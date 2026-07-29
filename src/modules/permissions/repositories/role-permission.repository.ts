import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionRepository {
  constructor(
    @InjectRepository(RolePermission) private readonly repository: Repository<RolePermission>,
  ) {}

  findOne(roleId: string, permissionId: string): Promise<RolePermission | null> {
    return this.repository.findOne({ where: { roleId, permissionId } });
  }

  create(roleId: string, permissionId: string): Promise<RolePermission> {
    return this.repository.save(this.repository.create({ roleId, permissionId }));
  }

  async remove(roleId: string, permissionId: string): Promise<void> {
    await this.repository.delete({ roleId, permissionId });
  }

  findPermissionNamesForRole(roleId: string): Promise<RolePermission[]> {
    return this.repository.find({ where: { roleId }, relations: ['permission'] });
  }

  findPermissionNamesForRoles(roleIds: string[]): Promise<RolePermission[]> {
    if (roleIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.repository
      .createQueryBuilder('rolePermission')
      .leftJoinAndSelect('rolePermission.permission', 'permission')
      .where('rolePermission.role_id IN (:...roleIds)', { roleIds })
      .getMany();
  }
}
