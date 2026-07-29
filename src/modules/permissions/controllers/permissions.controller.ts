import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { PermissionResponseDto } from '../dtos/permission-response.dto';
import {
  IPermissionsService,
  PERMISSIONS_SERVICE,
} from '../interfaces/permissions-service.interface';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(
    @Inject(PERMISSIONS_SERVICE) private readonly permissionsService: IPermissionsService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, type: PermissionResponseDto })
  @ApiResponse({ status: 409, description: 'A permission with this name already exists.' })
  create(@Body() dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionsService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, type: [PermissionResponseDto] })
  findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll();
  }
}
