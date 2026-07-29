import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InvalidRefreshTokenException } from '../../../common/exceptions/business.exceptions';
import { AppConfig } from '../../../config/configuration';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  const buildConfigService = (overrides: Partial<AppConfig> = {}) => {
    const config: Pick<AppConfig, 'jwt' | 'refresh'> = {
      jwt: { secret: 'access-secret', expiresIn: '15m' },
      refresh: { secret: 'refresh-secret', expiresIn: '7d' },
      ...overrides,
    };
    return {
      get: (key: 'jwt' | 'refresh') => config[key],
    } as unknown as ConfigService<AppConfig, true>;
  };

  beforeEach(() => {
    service = new TokenService(new JwtService(), buildConfigService());
  });

  it('signs and verifies an access token round-trip', () => {
    const token = service.signAccessToken({
      sub: 'user-1',
      email: 'jane@example.com',
      roles: ['ADMIN'],
      permissions: ['create_user'],
    });

    const payload = service.verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.roles).toEqual(['ADMIN']);
  });

  it('signs and verifies a refresh token round-trip', () => {
    const token = service.signRefreshToken({ sub: 'user-1', sessionId: 'session-1' });
    const payload = service.verifyRefreshToken(token);
    expect(payload.sessionId).toBe('session-1');
  });

  it('throws InvalidRefreshTokenException for a tampered refresh token', () => {
    const token = service.signRefreshToken({ sub: 'user-1', sessionId: 'session-1' });
    expect(() => service.verifyRefreshToken(`${token}tampered`)).toThrow(
      InvalidRefreshTokenException,
    );
  });

  it('verifyRefreshTokenIgnoringExpiry accepts an expired-but-valid token', () => {
    const shortLivedService = new TokenService(
      new JwtService(),
      buildConfigService({ refresh: { secret: 'refresh-secret', expiresIn: '1ms' } }),
    );
    const token = shortLivedService.signRefreshToken({ sub: 'user-1', sessionId: 'session-1' });

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const payload = shortLivedService.verifyRefreshTokenIgnoringExpiry(token);
        expect(payload.sessionId).toBe('session-1');
        resolve();
      }, 20);
    });
  });
});
