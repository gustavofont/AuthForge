import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { PermissionsController } from './controllers/permissions.controller';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { PERMISSION_REPOSITORY } from './interfaces/permission-repository.interface';
import { PERMISSIONS_SERVICE } from './interfaces/permissions-service.interface';
import { ROLE_PERMISSIONS_SERVICE } from './interfaces/role-permissions-service.interface';
import { USER_ROLES_SERVICE } from './interfaces/user-roles-service.interface';
import { PermissionRepository } from './repositories/permission.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { PermissionsService } from './services/permissions.service';
import { RolePermissionsService } from './services/role-permissions.service';
import { UserRolesService } from './services/user-roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, RolePermission, UserRole, Role])],
  controllers: [PermissionsController],
  providers: [
    RolePermissionRepository,
    UserRoleRepository,
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
    { provide: PERMISSIONS_SERVICE, useClass: PermissionsService },
    { provide: ROLE_PERMISSIONS_SERVICE, useClass: RolePermissionsService },
    { provide: USER_ROLES_SERVICE, useClass: UserRolesService },
  ],
  exports: [
    PERMISSION_REPOSITORY,
    PERMISSIONS_SERVICE,
    ROLE_PERMISSIONS_SERVICE,
    USER_ROLES_SERVICE,
  ],
})
export class PermissionsModule {}
