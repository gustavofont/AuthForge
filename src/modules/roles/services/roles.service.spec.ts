import {
  RoleAlreadyExistsException,
  RoleNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { IRolePermissionsService } from '../../permissions/interfaces/role-permissions-service.interface';
import { Role } from '../entities/role.entity';
import { IRoleRepository } from '../interfaces/role-repository.interface';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let rolePermissionsService: jest.Mocked<IRolePermissionsService>;

  const buildRole = (overrides: Partial<Role> = {}): Role => ({
    id: 'role-1',
    name: 'MANAGER',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    rolePermissions: [],
    userRoles: [],
    ...overrides,
  });

  beforeEach(() => {
    roleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    };
    rolePermissionsService = {
      assignPermissionToRole: jest.fn(),
      unassignPermissionFromRole: jest.fn(),
      getPermissionNamesForRole: jest.fn().mockResolvedValue([]),
    };
    service = new RolesService(roleRepository, rolePermissionsService);
  });

  describe('create', () => {
    it('throws when a role with the same name already exists', async () => {
      roleRepository.findByName.mockResolvedValue(buildRole());
      await expect(service.create({ name: 'MANAGER' })).rejects.toThrow(RoleAlreadyExistsException);
    });

    it('creates a new role otherwise', async () => {
      roleRepository.findByName.mockResolvedValue(null);
      roleRepository.create.mockResolvedValue(buildRole());
      const result = await service.create({ name: 'MANAGER' });
      expect(result.name).toBe('MANAGER');
    });
  });

  describe('assignPermission', () => {
    it('throws RoleNotFoundException when the role does not exist', async () => {
      roleRepository.findById.mockResolvedValue(null);
      await expect(service.assignPermission('missing', 'perm-1')).rejects.toThrow(
        RoleNotFoundException,
      );
      expect(rolePermissionsService.assignPermissionToRole).not.toHaveBeenCalled();
    });

    it('delegates assignment and returns the role with updated permissions', async () => {
      roleRepository.findById.mockResolvedValue(buildRole());
      rolePermissionsService.getPermissionNamesForRole.mockResolvedValue(['create_product']);

      const result = await service.assignPermission('role-1', 'perm-1');

      expect(rolePermissionsService.assignPermissionToRole).toHaveBeenCalledWith(
        'role-1',
        'perm-1',
      );
      expect(result.permissions).toEqual(['create_product']);
    });
  });
});
