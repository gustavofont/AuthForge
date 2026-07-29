import { Inject, Injectable } from '@nestjs/common';
import { PermissionAlreadyExistsException } from '../../../common/exceptions/business.exceptions';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../interfaces/permission-repository.interface';
import { IPermissionsService } from '../interfaces/permissions-service.interface';
import { PermissionMapper } from '../mappers/permission.mapper';

@Injectable()
export class PermissionsService implements IPermissionsService {
  constructor(
    @Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: IPermissionRepository,
  ) {}

  async create(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const existing = await this.permissionRepository.findByName(dto.name);
    if (existing) {
      throw new PermissionAlreadyExistsException();
    }

    const permission = await this.permissionRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return PermissionMapper.toResponseDto(permission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map((permission) => PermissionMapper.toResponseDto(permission));
  }
}
