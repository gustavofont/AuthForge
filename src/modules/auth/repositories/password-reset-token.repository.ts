import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { IPasswordResetTokenRepository } from '../interfaces/password-reset-token-repository.interface';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repository: Repository<PasswordResetToken>,
  ) {}

  create(data: Partial<PasswordResetToken>): Promise<PasswordResetToken> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<PasswordResetToken | null> {
    return this.repository.findOne({ where: { id } });
  }

  findValidByUserId(userId: string): Promise<PasswordResetToken[]> {
    return this.repository.find({
      where: { userId, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });
  }

  save(token: PasswordResetToken): Promise<PasswordResetToken> {
    return this.repository.save(token);
  }
}
