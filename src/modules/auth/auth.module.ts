import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../common/logger/logger.module';
import { EmailModule } from '../email/email.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { AUTH_SERVICE } from './interfaces/auth-service.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './interfaces/password-reset-token-repository.interface';
import { TOKEN_SERVICE } from './interfaces/token-service.interface';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken]),
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    PermissionsModule,
    SessionsModule,
    EmailModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: TOKEN_SERVICE, useClass: TokenService },
    { provide: PASSWORD_RESET_TOKEN_REPOSITORY, useClass: PasswordResetTokenRepository },
    { provide: AUTH_SERVICE, useClass: AuthService },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
