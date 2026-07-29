export const USER_ROLES_SERVICE = Symbol('USER_ROLES_SERVICE');

export interface IUserRolesService {
  assignRoleToUser(userId: string, roleId: string): Promise<void>;
  unassignRoleFromUser(userId: string, roleId: string): Promise<void>;
  getRoleNamesForUser(userId: string): Promise<string[]>;
  getPermissionNamesForUser(userId: string): Promise<string[]>;
}
