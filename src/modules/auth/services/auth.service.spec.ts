import { ConfigService } from '@nestjs/config';
import {
  AccountInactiveException,
  AccountLockedException,
  InvalidCredentialsException,
  InvalidCurrentPasswordException,
  InvalidResetTokenException,
} from '../../../common/exceptions/business.exceptions';
import { AppLoggerService } from '../../../common/logger/app-logger.service';
import * as hashUtil from '../../../common/utils/hash.util';
import { AppConfig } from '../../../config/configuration';
import { EmailService } from '../../email/email.service';
import { IUserRolesService } from '../../permissions/interfaces/user-roles-service.interface';
import { ISessionsService } from '../../sessions/interfaces/sessions-service.interface';
import { IUserRepository } from '../../users/interfaces/user-repository.interface';
import { User } from '../../users/entities/user.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { IPasswordResetTokenRepository } from '../interfaces/password-reset-token-repository.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { Session } from '../../sessions/entities/session.entity';
import { AuthService } from './auth.service';

jest.mock('../../../common/utils/hash.util');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let userRolesService: jest.Mocked<IUserRolesService>;
  let sessionsService: jest.Mocked<ISessionsService>;
  let tokenService: jest.Mocked<ITokenService>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let emailService: jest.Mocked<EmailService>;
  let configService: ConfigService<AppConfig, true>;

  const hashSecretMock = hashUtil.hashSecret as jest.Mock;
  const verifySecretMock = hashUtil.verifySecret as jest.Mock;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    passwordHash: 'hashed-password',
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    userRoles: [],
    ...overrides,
  });

  const buildSession = (overrides: Partial<Session> = {}): Session =>
    ({
      id: 'session-1',
      userId: 'user-1',
      device: null,
      ip: null,
      refreshTokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      createdAt: new Date(),
      ...overrides,
    }) as Session;

  beforeEach(() => {
    jest.clearAllMocks();
    hashSecretMock.mockImplementation((value: string) => Promise.resolve(`hashed(${value})`));
    verifySecretMock.mockResolvedValue(true);

    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      softDelete: jest.fn(),
    };
    userRolesService = {
      assignRoleToUser: jest.fn(),
      unassignRoleFromUser: jest.fn(),
      getRoleNamesForUser: jest.fn().mockResolvedValue(['USER']),
      getPermissionNamesForUser: jest.fn().mockResolvedValue([]),
    };
    sessionsService = {
      createSession: jest.fn().mockResolvedValue(buildSession()),
      findActiveById: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revoke: jest.fn(),
      revokeForUserOrThrow: jest.fn(),
      revokeAllForUser: jest.fn(),
      listActiveForUser: jest.fn(),
    };
    tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      verifyAccessToken: jest.fn(),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyRefreshToken: jest.fn(),
      verifyRefreshTokenIgnoringExpiry: jest.fn(),
      getRefreshTokenExpiryDate: jest.fn().mockReturnValue(new Date(Date.now() + 60_000)),
    };
    passwordResetTokenRepository = {
      create: jest.fn(),
      findValidByUserId: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
    };
    emailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailService>;
    configService = {
      get: (key: string) => {
        if (key === 'security') {
          return {
            maxFailedLoginAttempts: 3,
            accountLockMinutes: 15,
            passwordResetTokenTtlMinutes: 60,
            loginThrottleLimit: 5,
            loginThrottleTtlSeconds: 60,
          };
        }
        throw new Error(`unexpected config key ${key}`);
      },
    } as unknown as ConfigService<AppConfig, true>;

    const logger = {
      setContext: jest.fn(),
      logAuthEvent: jest.fn(),
      logAuthFailure: jest.fn(),
    } as unknown as AppLoggerService;

    service = new AuthService(
      userRepository,
      userRolesService,
      sessionsService,
      tokenService,
      passwordResetTokenRepository,
      emailService,
      configService,
      logger,
    );
  });

  describe('login', () => {
    it('throws InvalidCredentialsException when the user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' }, { device: null, ip: null }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('throws AccountLockedException while the lock window is active', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ lockedUntil: new Date(Date.now() + 60_000) }),
      );
      await expect(
        service.login({ email: 'jane@example.com', password: 'x' }, { device: null, ip: null }),
      ).rejects.toThrow(AccountLockedException);
    });

    it('throws AccountInactiveException for a deactivated user', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser({ isActive: false }));
      await expect(
        service.login({ email: 'jane@example.com', password: 'x' }, { device: null, ip: null }),
      ).rejects.toThrow(AccountInactiveException);
    });

    it('increments failed attempts and locks the account after the configured threshold', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser({ failedLoginAttempts: 2 }));
      userRepository.findById.mockResolvedValue(buildUser({ failedLoginAttempts: 2 }));
      verifySecretMock.mockResolvedValue(false);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrong' }, { device: null, ip: null }),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginAttempts: 0, lockedUntil: expect.any(Date) }),
      );
    });

    it('issues a token pair and creates a session on success', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());

      const result = await service.login(
        { email: 'jane@example.com', password: 'correct' },
        { device: 'jest', ip: '127.0.0.1' },
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
      });
      expect(sessionsService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', device: 'jest', ip: '127.0.0.1' }),
      );
    });
  });

  describe('refresh', () => {
    it('throws when the session is not active', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1', sessionId: 'session-1' });
      sessionsService.findActiveById.mockResolvedValue(null);
      await expect(service.refresh('token')).rejects.toThrow(InvalidCredentialsException);
    });

    it('revokes the session and throws on hash mismatch (token reuse)', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1', sessionId: 'session-1' });
      sessionsService.findActiveById.mockResolvedValue(buildSession());
      verifySecretMock.mockResolvedValue(false);

      await expect(service.refresh('token')).rejects.toThrow(InvalidCredentialsException);
      expect(sessionsService.revoke).toHaveBeenCalledWith('session-1');
    });

    it('rotates the refresh token on success', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1', sessionId: 'session-1' });
      sessionsService.findActiveById.mockResolvedValue(buildSession());
      userRepository.findById.mockResolvedValue(buildUser());

      const result = await service.refresh('token');

      expect(result.accessToken).toBe('access-token');
      expect(sessionsService.rotateRefreshToken).toHaveBeenCalledWith(
        'session-1',
        expect.any(String),
        expect.any(Date),
      );
    });
  });

  describe('logout', () => {
    it('rejects when the token belongs to a different user', async () => {
      tokenService.verifyRefreshTokenIgnoringExpiry.mockReturnValue({
        sub: 'someone-else',
        sessionId: 'session-1',
      });
      await expect(service.logout('user-1', 'token')).rejects.toThrow(InvalidCredentialsException);
      expect(sessionsService.revoke).not.toHaveBeenCalled();
    });

    it('revokes the session for the matching user', async () => {
      tokenService.verifyRefreshTokenIgnoringExpiry.mockReturnValue({
        sub: 'user-1',
        sessionId: 'session-1',
      });
      await service.logout('user-1', 'token');
      expect(sessionsService.revoke).toHaveBeenCalledWith('session-1');
    });
  });

  describe('forgotPassword', () => {
    it('does nothing when the user does not exist (no enumeration)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await service.forgotPassword({ email: 'nobody@example.com' });
      expect(emailService.sendMail).not.toHaveBeenCalled();
    });

    it('creates a reset token and sends an email for an active user', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());
      passwordResetTokenRepository.create.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      } as PasswordResetToken);

      await service.forgotPassword({ email: 'jane@example.com' });

      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'jane@example.com' }),
      );
    });
  });

  describe('resetPassword', () => {
    it('rejects a malformed token', async () => {
      await expect(
        service.resetPassword({ token: 'not-composite', newPassword: 'X' }),
      ).rejects.toThrow(InvalidResetTokenException);
    });

    it('rejects an expired or already-used token', async () => {
      passwordResetTokenRepository.findById.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        createdAt: new Date(),
      } as PasswordResetToken);

      await expect(
        service.resetPassword({ token: 'reset-1.secret', newPassword: 'NewPassw0rd' }),
      ).rejects.toThrow(InvalidResetTokenException);
    });

    it('resets the password and revokes all sessions on success', async () => {
      passwordResetTokenRepository.findById.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
        createdAt: new Date(),
      } as PasswordResetToken);
      userRepository.findById.mockResolvedValue(buildUser());

      await service.resetPassword({ token: 'reset-1.secret', newPassword: 'NewPassw0rd' });

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed(NewPassw0rd)' }),
      );
      expect(sessionsService.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changePassword', () => {
    it('throws InvalidCurrentPasswordException when the current password is wrong', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      verifySecretMock.mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', { currentPassword: 'wrong', newPassword: 'NewPassw0rd' }),
      ).rejects.toThrow(InvalidCurrentPasswordException);
    });

    it('updates the password hash on success', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      await service.changePassword('user-1', {
        currentPassword: 'right',
        newPassword: 'NewPassw0rd',
      });

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed(NewPassw0rd)' }),
      );
    });
  });
});
