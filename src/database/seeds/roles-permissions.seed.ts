import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { RolePermission } from '../../modules/permissions/entities/role-permission.entity';

const ROLES = ['ADMIN', 'MANAGER', 'USER'] as const;
const PERMISSIONS = ['create_user', 'delete_user', 'create_product', 'view_dashboard'] as const;

const ROLE_PERMISSIONS: Record<(typeof ROLES)[number], readonly (typeof PERMISSIONS)[number][]> = {
  ADMIN: PERMISSIONS,
  MANAGER: ['create_product', 'view_dashboard'],
  USER: [],
};

export async function seedRolesAndPermissions(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);

  const roles = new Map<string, Role>();
  for (const name of ROLES) {
    let role = await roleRepository.findOne({ where: { name } });
    role ??= await roleRepository.save(roleRepository.create({ name }));
    roles.set(name, role);
  }

  const permissions = new Map<string, Permission>();
  for (const name of PERMISSIONS) {
    let permission = await permissionRepository.findOne({ where: { name } });
    permission ??= await permissionRepository.save(permissionRepository.create({ name }));
    permissions.set(name, permission);
  }

  for (const roleName of ROLES) {
    const role = roles.get(roleName)!;
    for (const permissionName of ROLE_PERMISSIONS[roleName]) {
      const permission = permissions.get(permissionName)!;
      const existing = await rolePermissionRepository.findOne({
        where: { roleId: role.id, permissionId: permission.id },
      });
      if (!existing) {
        await rolePermissionRepository.save(
          rolePermissionRepository.create({ roleId: role.id, permissionId: permission.id }),
        );
      }
    }
  }
}
