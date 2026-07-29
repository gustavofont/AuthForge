import { Session } from '../entities/session.entity';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface ISessionRepository {
  create(data: Partial<Session>): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findActiveForUser(userId: string): Promise<Session[]>;
  save(session: Session): Promise<Session>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
