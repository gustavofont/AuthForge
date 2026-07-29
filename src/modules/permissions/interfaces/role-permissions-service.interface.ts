export const ROLE_PERMISSIONS_SERVICE = Symbol('ROLE_PERMISSIONS_SERVICE');

export interface IRolePermissionsService {
  assignPermissionToRole(roleId: string, permissionId: string): Promise<void>;
  unassignPermissionFromRole(roleId: string, permissionId: string): Promise<void>;
  getPermissionNamesForRole(roleId: string): Promise<string[]>;
}
