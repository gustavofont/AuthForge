import { AuthTokensResponseDto } from '../dtos/auth-tokens-response.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface LoginContext {
  device: string | null;
  ip: string | null;
}

export interface IAuthService {
  login(dto: LoginDto, context: LoginContext): Promise<AuthTokensResponseDto>;
  logout(userId: string, refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<AuthTokensResponseDto>;
  forgotPassword(dto: ForgotPasswordDto): Promise<void>;
  resetPassword(dto: ResetPasswordDto): Promise<void>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
}
