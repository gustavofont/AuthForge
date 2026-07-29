import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { IRoleRepository } from '../interfaces/role-repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(@InjectRepository(Role) private readonly repository: Repository<Role>) {}

  create(data: Partial<Role>): Promise<Role> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  findAll(): Promise<Role[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }
}
