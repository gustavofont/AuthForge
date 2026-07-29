import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FindAllUsersResult, IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  create(data: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(page: number, limit: number): Promise<FindAllUsersResult> {
    const [items, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
