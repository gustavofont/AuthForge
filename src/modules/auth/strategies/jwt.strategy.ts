import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../../../common/interfaces/jwt-payload.interface';
import { AppConfig } from '../../../config/configuration';
import { buildAccessTokenOptions } from '../../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<AppConfig, true>) {
    const { verify } = buildAccessTokenOptions(configService.get('jwt', { infer: true }));
    const secretOrKey = verify.secret ?? verify.publicKey;
    if (!secretOrKey) {
      throw new Error('JWT strategy misconfigured: no secret or public key available.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      algorithms: verify.algorithms,
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
