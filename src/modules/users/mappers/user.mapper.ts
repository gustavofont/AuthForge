import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toResponseDto(user: User, roles: string[] = []): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
