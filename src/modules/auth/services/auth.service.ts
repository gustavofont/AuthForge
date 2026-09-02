import { randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import {
  AccountInactiveException,
  AccountLockedException,
  InvalidCredentialsException,
  InvalidCurrentPasswordException,
  InvalidResetTokenException,
} from '../../../common/exceptions/business.exceptions';
import { AppLoggerService } from '../../../common/logger/app-logger.service';
import { hashSecret, verifySecret } from '../../../common/utils/hash.util';
import { AppConfig } from '../../../config/configuration';
import { EmailService } from '../../email/email.service';
import {
  IUserRolesService,
  USER_ROLES_SERVICE,
} from '../../permissions/interfaces/user-roles-service.interface';
import {
  ISessionsService,
  SESSIONS_SERVICE,
} from '../../sessions/interfaces/sessions-service.interface';
import { IUserRepository, USER_REPOSITORY } from '../../users/interfaces/user-repository.interface';
import { AuthTokensResponseDto } from '../dtos/auth-tokens-response.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { IAuthService, LoginContext } from '../interfaces/auth-service.interface';
import {
  IPasswordResetTokenRepository,
  PASSWORD_RESET_TOKEN_REPOSITORY,
} from '../interfaces/password-reset-token-repository.interface';
import { ITokenService, TOKEN_SERVICE } from '../interfaces/token-service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(USER_ROLES_SERVICE) private readonly userRolesService: IUserRolesService,
    @Inject(SESSIONS_SERVICE) private readonly sessionsService: ISessionsService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('AuthService');
  }

  async login(dto: LoginDto, context: LoginContext): Promise<AuthTokensResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      this.logger.logAuthFailure('LOGIN_FAILED', { email: dto.email, reason: 'user_not_found' });
      throw new InvalidCredentialsException();
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      this.logger.logAuthFailure('LOGIN_FAILED', { email: dto.email, reason: 'account_locked' });
      throw new AccountLockedException(minutesRemaining);
    }

    if (!user.isActive) {
      this.logger.logAuthFailure('LOGIN_FAILED', { email: dto.email, reason: 'account_inactive' });
      throw new AccountInactiveException();
    }

    const passwordMatches = await verifySecret(user.passwordHash, dto.password);
    if (!passwordMatches) {
      await this.registerFailedLoginAttempt(user.id, user.failedLoginAttempts);
      this.logger.logAuthFailure('LOGIN_FAILED', { email: dto.email, reason: 'invalid_password' });
      throw new InvalidCredentialsException();
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }

    const tokens = await this.issueTokens(user.id, user.email, user.name, context);
    this.logger.logAuthEvent('LOGIN', { userId: user.id });
    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const payload = this.tokenService.verifyRefreshTokenIgnoringExpiry(refreshToken);
    if (payload.sub !== userId) {
      throw new InvalidCredentialsException();
    }
    await this.sessionsService.revoke(payload.sessionId);
    this.logger.logAuthEvent('LOGOUT', { userId });
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponseDto> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const session = await this.sessionsService.findActiveById(payload.sessionId);

    if (!session || session.userId !== payload.sub) {
      throw new InvalidCredentialsException();
    }

    const hashMatches = await verifySecret(session.refreshTokenHash, refreshToken);
    if (!hashMatches) {
      await this.sessionsService.revoke(session.id);
      this.logger.logAuthFailure('REFRESH_TOKEN_REUSE_DETECTED', { userId: payload.sub });
      throw new InvalidCredentialsException();
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    const roles = await this.userRolesService.getRoleNamesForUser(user.id);
    const permissions = await this.userRolesService.getPermissionNamesForUser(user.id);

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    });
    const newRefreshToken = this.tokenService.signRefreshToken({
      sub: user.id,
      sessionId: session.id,
    });
    const newHash = await hashSecret(newRefreshToken);
    await this.sessionsService.rotateRefreshToken(
      session.id,
      newHash,
      this.tokenService.getRefreshTokenExpiryDate(),
    );

    this.logger.logAuthEvent('REFRESH_TOKEN', { userId: user.id });
    return { accessToken, refreshToken: newRefreshToken, tokenType: 'Bearer' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || !user.isActive) {
      // Intentionally do not reveal whether the account exists.
      return;
    }

    const outstanding = await this.passwordResetTokenRepository.findValidByUserId(user.id);
    await Promise.all(
      outstanding.map((token) => {
        token.usedAt = new Date();
        return this.passwordResetTokenRepository.save(token);
      }),
    );

    const secret = randomBytes(32).toString('hex');
    const tokenHash = await hashSecret(secret);
    const ttlMinutes = this.configService.get('security', {
      infer: true,
    }).passwordResetTokenTtlMinutes;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

    const resetToken = await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const compositeToken = `${resetToken.id}.${secret}`;
    const frontendUrl = this.configService.get('app', { infer: true }).frontendUrl;
    const resetLink = `${frontendUrl}/reset-password?token=${compositeToken}`;
    const expiration = `${ttlMinutes} minutes`;
    await this.emailService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      body: `Use the following link to reset your password (expires in ${expiration}): ${resetLink}`,
      type: 'forgot-password',
      context: { name: user.name, resetLink, expiration },
    });

    this.logger.logAuthEvent('FORGOT_PASSWORD', { userId: user.id });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const [id, secret] = dto.token.split('.');
    // isUUID guards the DB lookup below — the id half is a uuid column, so a
    // malformed id (a garbled/tampered link) would otherwise reach Postgres
    // as an invalid literal and surface as an unhandled 500 instead of the
    // clean 400 this method already returns for every other bad-token case.
    if (!id || !secret || !isUUID(id)) {
      throw new InvalidResetTokenException();
    }

    const resetToken = await this.passwordResetTokenRepository.findById(id);
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() < Date.now()) {
      throw new InvalidResetTokenException();
    }

    const secretMatches = await verifySecret(resetToken.tokenHash, secret);
    if (!secretMatches) {
      throw new InvalidResetTokenException();
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new InvalidResetTokenException();
    }

    user.passwordHash = await hashSecret(dto.newPassword);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);

    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    await this.sessionsService.revokeAllForUser(user.id);
    this.logger.logAuthEvent('RESET_PASSWORD', { userId: user.id });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const currentMatches = await verifySecret(user.passwordHash, dto.currentPassword);
    if (!currentMatches) {
      throw new InvalidCurrentPasswordException();
    }

    user.passwordHash = await hashSecret(dto.newPassword);
    await this.userRepository.save(user);
    this.logger.logAuthEvent('CHANGE_PASSWORD', { userId: user.id });
  }

  private async issueTokens(
    userId: string,
    email: string,
    name: string,
    context: LoginContext,
  ): Promise<AuthTokensResponseDto> {
    const roles = await this.userRolesService.getRoleNamesForUser(userId);
    const permissions = await this.userRolesService.getPermissionNamesForUser(userId);

    const sessionId = randomUUID();
    const refreshToken = this.tokenService.signRefreshToken({ sub: userId, sessionId });
    const refreshTokenHash = await hashSecret(refreshToken);

    await this.sessionsService.createSession({
      id: sessionId,
      userId,
      device: context.device,
      ip: context.ip,
      refreshTokenHash,
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    const accessToken = this.tokenService.signAccessToken({
      sub: userId,
      email,
      name,
      roles,
      permissions,
    });
    return { accessToken, refreshToken, tokenType: 'Bearer' };
  }

  private async registerFailedLoginAttempt(userId: string, currentAttempts: number): Promise<void> {
    const security = this.configService.get('security', { infer: true });
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return;
    }

    user.failedLoginAttempts = currentAttempts + 1;
    if (user.failedLoginAttempts >= security.maxFailedLoginAttempts) {
      user.lockedUntil = new Date(Date.now() + security.accountLockMinutes * 60_000);
      user.failedLoginAttempts = 0;
    }
    await this.userRepository.save(user);
  }
}
