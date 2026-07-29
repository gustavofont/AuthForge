import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { AuthTokensResponseDto } from '../dtos/auth-tokens-response.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { AUTH_SERVICE, IAuthService } from '../interfaces/auth-service.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: IAuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 403, description: 'Account locked or inactive.' })
  login(@Body() dto: LoginDto, @Req() request: Request): Promise<AuthTokensResponseDto> {
    return this.authService.login(dto, {
      device: request.headers['user-agent'] ?? null,
      ip: request.ip ?? null,
    });
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the session tied to the given refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out.' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset token (always returns 200)' })
  @ApiResponse({ status: 200, description: 'If the account exists, a reset email was sent.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the password using a token from forgot-password' })
  @ApiResponse({ status: 200, description: 'Password reset.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token.' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully.' };
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiOperation({ summary: 'Change the password of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed.' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect.' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Password changed successfully.' };
  }
}
