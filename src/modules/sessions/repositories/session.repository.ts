import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { ISessionRepository } from '../interfaces/session-repository.interface';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(@InjectRepository(Session) private readonly repository: Repository<Session>) {}

  create(data: Partial<Session>): Promise<Session> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<Session | null> {
    return this.repository.findOne({ where: { id } });
  }

  findActiveForUser(userId: string): Promise<Session[]> {
    return this.repository.find({
      where: { userId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  save(session: Session): Promise<Session> {
    return this.repository.save(session);
  }

  async revoke(id: string): Promise<void> {
    await this.repository.update({ id }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }
}
