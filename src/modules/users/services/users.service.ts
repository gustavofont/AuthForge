import { Inject, Injectable } from '@nestjs/common';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { hashSecret } from '../../../common/utils/hash.util';
import {
  IUserRolesService,
  USER_ROLES_SERVICE,
} from '../../permissions/interfaces/user-roles-service.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../interfaces/user-repository.interface';
import { IUsersService } from '../interfaces/users-service.interface';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(USER_ROLES_SERVICE) private readonly userRolesService: IUserRolesService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await hashSecret(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return UserMapper.toResponseDto(user, []);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    const roles = await this.userRolesService.getRoleNamesForUser(user.id);
    return UserMapper.toResponseDto(user, roles);
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<UserResponseDto>> {
    const { items, total } = await this.userRepository.findAll(page, limit);
    const users = await Promise.all(
      items.map(async (user) => {
        const roles = await this.userRolesService.getRoleNamesForUser(user.id);
        return UserMapper.toResponseDto(user, roles);
      }),
    );
    return { items: users, total, page, limit };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);

    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    const saved = await this.userRepository.save(user);
    const roles = await this.userRolesService.getRoleNamesForUser(saved.id);
    return UserMapper.toResponseDto(saved, roles);
  }

  async softDelete(id: string): Promise<void> {
    await this.getUserOrThrow(id);
    await this.userRepository.softDelete(id);
  }

  async assignRole(userId: string, roleId: string): Promise<UserResponseDto> {
    await this.getUserOrThrow(userId);
    await this.userRolesService.assignRoleToUser(userId, roleId);
    return this.findById(userId);
  }

  async unassignRole(userId: string, roleId: string): Promise<UserResponseDto> {
    await this.getUserOrThrow(userId);
    await this.userRolesService.unassignRoleFromUser(userId, roleId);
    return this.findById(userId);
  }

  private async getUserOrThrow(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }
}
