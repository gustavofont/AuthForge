import {
  PermissionAlreadyAssignedException,
  PermissionNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { IPermissionRepository } from '../interfaces/permission-repository.interface';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { RolePermissionsService } from './role-permissions.service';

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;
  let rolePermissionRepository: jest.Mocked<RolePermissionRepository>;
  let permissionRepository: jest.Mocked<IPermissionRepository>;

  const permission = { id: 'perm-1', name: 'create_product' } as Permission;

  beforeEach(() => {
    rolePermissionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      findPermissionNamesForRole: jest.fn(),
      findPermissionNamesForRoles: jest.fn(),
    } as unknown as jest.Mocked<RolePermissionRepository>;
    permissionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    };
    service = new RolePermissionsService(rolePermissionRepository, permissionRepository);
  });

  describe('assignPermissionToRole', () => {
    it('throws when the permission does not exist', async () => {
      permissionRepository.findById.mockResolvedValue(null);
      await expect(service.assignPermissionToRole('role-1', 'missing')).rejects.toThrow(
        PermissionNotFoundException,
      );
    });

    it('throws when the permission is already assigned to the role', async () => {
      permissionRepository.findById.mockResolvedValue(permission);
      rolePermissionRepository.findOne.mockResolvedValue({} as RolePermission);
      await expect(service.assignPermissionToRole('role-1', 'perm-1')).rejects.toThrow(
        PermissionAlreadyAssignedException,
      );
      expect(rolePermissionRepository.create).not.toHaveBeenCalled();
    });

    it('creates the assignment otherwise', async () => {
      permissionRepository.findById.mockResolvedValue(permission);
      rolePermissionRepository.findOne.mockResolvedValue(null);
      await service.assignPermissionToRole('role-1', 'perm-1');
      expect(rolePermissionRepository.create).toHaveBeenCalledWith('role-1', 'perm-1');
    });
  });

  describe('getPermissionNamesForRole', () => {
    it('maps role-permission rows to permission names', async () => {
      rolePermissionRepository.findPermissionNamesForRole.mockResolvedValue([
        { permission } as RolePermission,
      ]);
      const result = await service.getPermissionNamesForRole('role-1');
      expect(result).toEqual(['create_product']);
    });
  });
});
