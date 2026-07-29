import { Inject, Injectable } from '@nestjs/common';
import {
  RoleAlreadyExistsException,
  RoleNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import {
  IRolePermissionsService,
  ROLE_PERMISSIONS_SERVICE,
} from '../../permissions/interfaces/role-permissions-service.interface';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';
import { Role } from '../entities/role.entity';
import { IRoleRepository, ROLE_REPOSITORY } from '../interfaces/role-repository.interface';
import { IRolesService } from '../interfaces/roles-service.interface';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RolesService implements IRolesService {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(ROLE_PERMISSIONS_SERVICE)
    private readonly rolePermissionsService: IRolePermissionsService,
  ) {}

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      throw new RoleAlreadyExistsException();
    }

    const role = await this.roleRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return RoleMapper.toResponseDto(role, []);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.findAll();
    return Promise.all(
      roles.map(async (role) => {
        const permissions = await this.rolePermissionsService.getPermissionNamesForRole(role.id);
        return RoleMapper.toResponseDto(role, permissions);
      }),
    );
  }

  async assignPermission(roleId: string, permissionId: string): Promise<RoleResponseDto> {
    const role = await this.getRoleOrThrow(roleId);
    await this.rolePermissionsService.assignPermissionToRole(roleId, permissionId);
    const permissions = await this.rolePermissionsService.getPermissionNamesForRole(roleId);
    return RoleMapper.toResponseDto(role, permissions);
  }

  async unassignPermission(roleId: string, permissionId: string): Promise<RoleResponseDto> {
    const role = await this.getRoleOrThrow(roleId);
    await this.rolePermissionsService.unassignPermissionFromRole(roleId, permissionId);
    const permissions = await this.rolePermissionsService.getPermissionNamesForRole(roleId);
    return RoleMapper.toResponseDto(role, permissions);
  }

  private async getRoleOrThrow(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException();
    }
    return role;
  }
}
