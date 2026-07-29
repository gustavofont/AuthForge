import { Repository } from 'typeorm';
import {
  RoleAlreadyAssignedException,
  RoleNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { Role } from '../../roles/entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { UserRolesService } from './user-roles.service';

describe('UserRolesService', () => {
  let service: UserRolesService;
  let userRoleRepository: jest.Mocked<UserRoleRepository>;
  let rolePermissionRepository: jest.Mocked<RolePermissionRepository>;
  let roleRepository: jest.Mocked<Repository<Role>>;

  const role = { id: 'role-1', name: 'MANAGER' } as Role;

  beforeEach(() => {
    userRoleRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      findForUser: jest.fn(),
    } as unknown as jest.Mocked<UserRoleRepository>;
    rolePermissionRepository = {
      findPermissionNamesForRoles: jest.fn(),
    } as unknown as jest.Mocked<RolePermissionRepository>;
    roleRepository = { findOne: jest.fn() } as unknown as jest.Mocked<Repository<Role>>;
    service = new UserRolesService(userRoleRepository, rolePermissionRepository, roleRepository);
  });

  describe('assignRoleToUser', () => {
    it('throws when the role does not exist', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.assignRoleToUser('user-1', 'missing')).rejects.toThrow(
        RoleNotFoundException,
      );
    });

    it('throws when the role is already assigned', async () => {
      roleRepository.findOne.mockResolvedValue(role);
      userRoleRepository.findOne.mockResolvedValue({} as UserRole);
      await expect(service.assignRoleToUser('user-1', 'role-1')).rejects.toThrow(
        RoleAlreadyAssignedException,
      );
    });

    it('creates the assignment otherwise', async () => {
      roleRepository.findOne.mockResolvedValue(role);
      userRoleRepository.findOne.mockResolvedValue(null);
      await service.assignRoleToUser('user-1', 'role-1');
      expect(userRoleRepository.create).toHaveBeenCalledWith('user-1', 'role-1');
    });
  });

  describe('getPermissionNamesForUser', () => {
    it('aggregates and de-duplicates permission names across all of the user roles', async () => {
      userRoleRepository.findForUser.mockResolvedValue([
        { roleId: 'role-1' } as UserRole,
        { roleId: 'role-2' } as UserRole,
      ]);
      rolePermissionRepository.findPermissionNamesForRoles.mockResolvedValue([
        { permission: { name: 'create_product' } } as RolePermission,
        { permission: { name: 'view_dashboard' } } as RolePermission,
        { permission: { name: 'create_product' } } as RolePermission,
      ]);

      const result = await service.getPermissionNamesForUser('user-1');

      expect(result.sort()).toEqual(['create_product', 'view_dashboard']);
    });
  });
});
