import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AppConfig } from './configuration';

export interface TokenSigningOptions {
  sign: JwtSignOptions;
  verify: JwtVerifyOptions;
}

/**
 * Resolves HS256 (shared secret) vs RS256 (key pair) signing options from
 * config so switching to asymmetric keys later is a config-only change.
 */
export function buildAccessTokenOptions(config: AppConfig['jwt']): TokenSigningOptions {
  if (config.privateKey && config.publicKey) {
    return {
      sign: { algorithm: 'RS256', privateKey: config.privateKey, expiresIn: config.expiresIn },
      verify: { algorithms: ['RS256'], publicKey: config.publicKey },
    };
  }

  return {
    sign: { algorithm: 'HS256', secret: config.secret, expiresIn: config.expiresIn },
    verify: { algorithms: ['HS256'], secret: config.secret },
  };
}

export function buildRefreshTokenOptions(config: AppConfig['refresh']): TokenSigningOptions {
  return {
    sign: { algorithm: 'HS256', secret: config.secret, expiresIn: config.expiresIn },
    verify: { algorithms: ['HS256'], secret: config.secret },
  };
}
