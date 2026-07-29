import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { InvalidRefreshTokenException } from '../../../common/exceptions/business.exceptions';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../../common/interfaces/jwt-payload.interface';
import { AppConfig } from '../../../config/configuration';
import { buildAccessTokenOptions, buildRefreshTokenOptions } from '../../../config/jwt.config';
import { ITokenService } from '../interfaces/token-service.interface';

@Injectable()
export class TokenService implements ITokenService {
  private readonly accessOptions;
  private readonly refreshOptions;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.accessOptions = buildAccessTokenOptions(this.configService.get('jwt', { infer: true }));
    const refreshConfig = this.configService.get('refresh', { infer: true });
    this.refreshOptions = buildRefreshTokenOptions(refreshConfig);
    this.refreshExpiresIn = refreshConfig.expiresIn;
  }

  signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign({ ...payload }, this.accessOptions.sign);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token, this.accessOptions.verify);
  }

  signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign({ ...payload }, this.refreshOptions.sign);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, this.refreshOptions.verify);
    } catch {
      throw new InvalidRefreshTokenException();
    }
  }

  verifyRefreshTokenIgnoringExpiry(token: string): RefreshTokenPayload {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, {
        ...this.refreshOptions.verify,
        ignoreExpiration: true,
      });
    } catch {
      throw new InvalidRefreshTokenException();
    }
  }

  getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + ms(this.refreshExpiresIn));
  }
}
