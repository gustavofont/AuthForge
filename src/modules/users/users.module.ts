import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { USERS_SERVICE } from './interfaces/users-service.interface';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PermissionsModule],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: USERS_SERVICE, useClass: UsersService },
  ],
  exports: [USER_REPOSITORY, USERS_SERVICE],
})
export class UsersModule {}
