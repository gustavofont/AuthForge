import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AssignPermissionDto } from '../../permissions/dtos/assign-permission.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { RoleResponseDto } from '../dtos/role-response.dto';
import { IRolesService, ROLES_SERVICE } from '../interfaces/roles-service.interface';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(@Inject(ROLES_SERVICE) private readonly rolesService: IRolesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'A role with this name already exists.' })
  create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  findAll(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll();
  }

  @Post(':id/permissions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  assignPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.assignPermission(id, dto.permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  unassignPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ): Promise<RoleResponseDto> {
    return this.rolesService.unassignPermission(id, permissionId);
  }
}
