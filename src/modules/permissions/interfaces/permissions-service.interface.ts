import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';

export const PERMISSIONS_SERVICE = Symbol('PERMISSIONS_SERVICE');

export interface IPermissionsService {
  create(dto: CreatePermissionDto): Promise<PermissionResponseDto>;
  findAll(): Promise<PermissionResponseDto[]>;
}
