import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from '../../../common/exceptions/business.exceptions';
import { SessionResponseDto } from '../dtos/session-response.dto';
import { Session } from '../entities/session.entity';
import { ISessionRepository, SESSION_REPOSITORY } from '../interfaces/session-repository.interface';
import { CreateSessionInput, ISessionsService } from '../interfaces/sessions-service.interface';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class SessionsService implements ISessionsService {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository) {}

  createSession(input: CreateSessionInput): Promise<Session> {
    return this.sessionRepository.create(input);
  }

  async findActiveById(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      return null;
    }
    return session;
  }

  async rotateRefreshToken(
    sessionId: string,
    newHash: string,
    newExpiresAt: Date,
  ): Promise<Session> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundException();
    }
    session.refreshTokenHash = newHash;
    session.expiresAt = newExpiresAt;
    return this.sessionRepository.save(session);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionRepository.revoke(sessionId);
  }

  async revokeForUserOrThrow(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new SessionNotFoundException();
    }
    await this.sessionRepository.revoke(sessionId);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessionRepository.revokeAllForUser(userId);
  }

  async listActiveForUser(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.findActiveForUser(userId);
    return sessions.map((session) => SessionMapper.toResponseDto(session));
  }
}
