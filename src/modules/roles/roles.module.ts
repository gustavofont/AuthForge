import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesController } from './controllers/roles.controller';
import { Role } from './entities/role.entity';
import { ROLE_REPOSITORY } from './interfaces/role-repository.interface';
import { ROLES_SERVICE } from './interfaces/roles-service.interface';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './services/roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RolesController],
  providers: [
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: ROLES_SERVICE, useClass: RolesService },
  ],
  exports: [ROLE_REPOSITORY, ROLES_SERVICE],
})
export class RolesModule {}
