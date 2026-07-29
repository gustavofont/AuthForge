import { PermissionAlreadyExistsException } from '../../../common/exceptions/business.exceptions';
import { Permission } from '../entities/permission.entity';
import { IPermissionRepository } from '../interfaces/permission-repository.interface';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionRepository: jest.Mocked<IPermissionRepository>;

  const buildPermission = (overrides: Partial<Permission> = {}): Permission => ({
    id: 'perm-1',
    name: 'create_product',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    rolePermissions: [],
    ...overrides,
  });

  beforeEach(() => {
    permissionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    };
    service = new PermissionsService(permissionRepository);
  });

  it('throws when a permission with the same name already exists', async () => {
    permissionRepository.findByName.mockResolvedValue(buildPermission());
    await expect(service.create({ name: 'create_product' })).rejects.toThrow(
      PermissionAlreadyExistsException,
    );
  });

  it('creates a new permission otherwise', async () => {
    permissionRepository.findByName.mockResolvedValue(null);
    permissionRepository.create.mockResolvedValue(buildPermission());
    const result = await service.create({ name: 'create_product' });
    expect(result.name).toBe('create_product');
  });

  it('lists all permissions mapped to DTOs', async () => {
    permissionRepository.findAll.mockResolvedValue([
      buildPermission(),
      buildPermission({ id: 'perm-2', name: 'view_dashboard' }),
    ]);
    const result = await service.findAll();
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe('view_dashboard');
  });
});
