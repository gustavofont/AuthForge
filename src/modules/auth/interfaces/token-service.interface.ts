import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/interfaces/jwt-payload.interface';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface ITokenService {
  signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string;
  verifyRefreshToken(token: string): RefreshTokenPayload;
  verifyRefreshTokenIgnoringExpiry(token: string): RefreshTokenPayload;
  getRefreshTokenExpiryDate(): Date;
}
