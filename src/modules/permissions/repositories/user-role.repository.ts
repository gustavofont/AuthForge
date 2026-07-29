import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRoleRepository {
  constructor(@InjectRepository(UserRole) private readonly repository: Repository<UserRole>) {}

  findOne(userId: string, roleId: string): Promise<UserRole | null> {
    return this.repository.findOne({ where: { userId, roleId } });
  }

  create(userId: string, roleId: string): Promise<UserRole> {
    return this.repository.save(this.repository.create({ userId, roleId }));
  }

  async remove(userId: string, roleId: string): Promise<void> {
    await this.repository.delete({ userId, roleId });
  }

  findForUser(userId: string): Promise<UserRole[]> {
    return this.repository.find({ where: { userId }, relations: ['role'] });
  }
}
