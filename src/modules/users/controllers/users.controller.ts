import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PaginatedUsersQueryDto } from '../dtos/paginated-users-query.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { IUsersService, USERS_SERVICE } from '../interfaces/users-service.interface';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(@Inject(USERS_SERVICE) private readonly usersService: IUsersService) {}

  @Post()
  @Roles('ADMIN')
  @Permissions('create_user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created.', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'A user with this email already exists.' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List users (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users.' })
  findAll(@Query() query: PaginatedUsersQueryDto) {
    return this.usersService.findAll(query.page ?? 1, query.limit ?? 20);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update a user (including deactivation via isActive=false)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @Permissions('delete_user')
  @ApiOperation({ summary: 'Soft-delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.softDelete(id);
  }

  @Post(':id/roles')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.assignRole(id, dto.roleId);
  }

  @Delete(':id/roles/:roleId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  unassignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.unassignRole(id, roleId);
  }
}
