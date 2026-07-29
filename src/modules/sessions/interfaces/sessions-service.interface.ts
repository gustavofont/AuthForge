import { Session } from '../entities/session.entity';
import { SessionResponseDto } from '../dtos/session-response.dto';

export const SESSIONS_SERVICE = Symbol('SESSIONS_SERVICE');

export interface CreateSessionInput {
  id?: string;
  userId: string;
  device: string | null;
  ip: string | null;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface ISessionsService {
  createSession(input: CreateSessionInput): Promise<Session>;
  findActiveById(sessionId: string): Promise<Session | null>;
  rotateRefreshToken(sessionId: string, newHash: string, newExpiresAt: Date): Promise<Session>;
  revoke(sessionId: string): Promise<void>;
  revokeForUserOrThrow(userId: string, sessionId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  listActiveForUser(userId: string): Promise<SessionResponseDto[]>;
}
