import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { UserResponseDto } from '../dtos/user-response.dto';

export const USERS_SERVICE = Symbol('USERS_SERVICE');

export interface IUsersService {
  create(dto: CreateUserDto): Promise<UserResponseDto>;
  findById(id: string): Promise<UserResponseDto>;
  findByEmailOrThrow(email: string): Promise<User>;
  findAll(page: number, limit: number): Promise<PaginatedResult<UserResponseDto>>;
  update(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
  softDelete(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<UserResponseDto>;
  unassignRole(userId: string, roleId: string): Promise<UserResponseDto>;
}
