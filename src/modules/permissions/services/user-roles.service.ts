import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RoleAlreadyAssignedException,
  RoleNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { Role } from '../../roles/entities/role.entity';
import { IUserRolesService } from '../interfaces/user-roles-service.interface';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';

@Injectable()
export class UserRolesService implements IUserRolesService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new RoleNotFoundException();
    }

    const existing = await this.userRoleRepository.findOne(userId, roleId);
    if (existing) {
      throw new RoleAlreadyAssignedException();
    }

    await this.userRoleRepository.create(userId, roleId);
  }

  async unassignRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.remove(userId, roleId);
  }

  async getRoleNamesForUser(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.findForUser(userId);
    return userRoles.map((userRole) => userRole.role.name);
  }

  async getPermissionNamesForUser(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.findForUser(userId);
    const roleIds = userRoles.map((userRole) => userRole.roleId);
    const rolePermissions =
      await this.rolePermissionRepository.findPermissionNamesForRoles(roleIds);
    const permissionNames = rolePermissions.map((rp) => rp.permission.name);
    return Array.from(new Set(permissionNames));
  }
}
