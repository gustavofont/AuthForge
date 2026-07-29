import { CreateRoleDto } from '../dtos/create-role.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';

export const ROLES_SERVICE = Symbol('ROLES_SERVICE');

export interface IRolesService {
  create(dto: CreateRoleDto): Promise<RoleResponseDto>;
  findAll(): Promise<RoleResponseDto[]>;
  assignPermission(roleId: string, permissionId: string): Promise<RoleResponseDto>;
  unassignPermission(roleId: string, permissionId: string): Promise<RoleResponseDto>;
}
