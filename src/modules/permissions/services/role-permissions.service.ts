import { Inject, Injectable } from '@nestjs/common';
import {
  PermissionAlreadyAssignedException,
  PermissionNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../interfaces/permission-repository.interface';
import { IRolePermissionsService } from '../interfaces/role-permissions-service.interface';
import { RolePermissionRepository } from '../repositories/role-permission.repository';

@Injectable()
export class RolePermissionsService implements IRolePermissionsService {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: IPermissionRepository,
  ) {}

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new PermissionNotFoundException();
    }

    const existing = await this.rolePermissionRepository.findOne(roleId, permissionId);
    if (existing) {
      throw new PermissionAlreadyAssignedException();
    }

    await this.rolePermissionRepository.create(roleId, permissionId);
  }

  async unassignPermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionRepository.remove(roleId, permissionId);
  }

  async getPermissionNamesForRole(roleId: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionRepository.findPermissionNamesForRole(roleId);
    return rolePermissions.map((rp) => rp.permission.name);
  }
}
