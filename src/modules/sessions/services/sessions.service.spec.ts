import { SessionNotFoundException } from '../../../common/exceptions/business.exceptions';
import { Session } from '../entities/session.entity';
import { ISessionRepository } from '../interfaces/session-repository.interface';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  const buildSession = (overrides: Partial<Session> = {}): Session =>
    ({
      id: 'session-1',
      userId: 'user-1',
      device: 'curl',
      ip: '127.0.0.1',
      refreshTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      createdAt: new Date(),
      ...overrides,
    }) as Session;

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findActiveForUser: jest.fn(),
      save: jest.fn(),
      revoke: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    service = new SessionsService(sessionRepository);
  });

  describe('findActiveById', () => {
    it('returns null when the session does not exist', async () => {
      sessionRepository.findById.mockResolvedValue(null);
      expect(await service.findActiveById('missing')).toBeNull();
    });

    it('returns null when the session is revoked', async () => {
      sessionRepository.findById.mockResolvedValue(buildSession({ revokedAt: new Date() }));
      expect(await service.findActiveById('session-1')).toBeNull();
    });

    it('returns null when the session is expired', async () => {
      sessionRepository.findById.mockResolvedValue(
        buildSession({ expiresAt: new Date(Date.now() - 1000) }),
      );
      expect(await service.findActiveById('session-1')).toBeNull();
    });

    it('returns the session when active and not expired', async () => {
      const session = buildSession();
      sessionRepository.findById.mockResolvedValue(session);
      expect(await service.findActiveById('session-1')).toBe(session);
    });
  });

  describe('revokeForUserOrThrow', () => {
    it('throws when the session belongs to a different user', async () => {
      sessionRepository.findById.mockResolvedValue(buildSession({ userId: 'someone-else' }));
      await expect(service.revokeForUserOrThrow('user-1', 'session-1')).rejects.toThrow(
        SessionNotFoundException,
      );
      expect(sessionRepository.revoke).not.toHaveBeenCalled();
    });

    it('revokes the session when it belongs to the requesting user', async () => {
      sessionRepository.findById.mockResolvedValue(buildSession({ userId: 'user-1' }));
      await service.revokeForUserOrThrow('user-1', 'session-1');
      expect(sessionRepository.revoke).toHaveBeenCalledWith('session-1');
    });
  });

  describe('rotateRefreshToken', () => {
    it('throws when the session does not exist', async () => {
      sessionRepository.findById.mockResolvedValue(null);
      await expect(service.rotateRefreshToken('missing', 'hash', new Date())).rejects.toThrow(
        SessionNotFoundException,
      );
    });

    it('updates the hash and expiry then persists the session', async () => {
      const session = buildSession();
      sessionRepository.findById.mockResolvedValue(session);
      sessionRepository.save.mockImplementation((s) => Promise.resolve(s));
      const newExpiry = new Date(Date.now() + 120_000);

      const result = await service.rotateRefreshToken('session-1', 'new-hash', newExpiry);

      expect(result.refreshTokenHash).toBe('new-hash');
      expect(result.expiresAt).toBe(newExpiry);
    });
  });
});
