import { PasswordResetToken } from '../entities/password-reset-token.entity';

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol('PASSWORD_RESET_TOKEN_REPOSITORY');

export interface IPasswordResetTokenRepository {
  create(data: Partial<PasswordResetToken>): Promise<PasswordResetToken>;
  findValidByUserId(userId: string): Promise<PasswordResetToken[]>;
  findById(id: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<PasswordResetToken>;
}
