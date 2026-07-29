import { Role } from '../entities/role.entity';
import { RoleResponseDto } from '../dtos/role-response.dto';

export class RoleMapper {
  static toResponseDto(role: Role, permissions: string[] = []): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions,
      createdAt: role.createdAt,
    };
  }
}
