import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { IPermissionRepository } from '../interfaces/permission-repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(@InjectRepository(Permission) private readonly repository: Repository<Permission>) {}

  create(data: Partial<Permission>): Promise<Permission> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { name } });
  }

  findAll(): Promise<Permission[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }
}
