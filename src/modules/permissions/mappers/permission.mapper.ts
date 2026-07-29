import { Permission } from '../entities/permission.entity';
import { PermissionResponseDto } from '../dtos/permission-response.dto';

export class PermissionMapper {
  static toResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
    };
  }
}
