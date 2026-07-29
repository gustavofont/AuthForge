import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface IPermissionRepository {
  create(data: Partial<Permission>): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
}
