import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './controllers/sessions.controller';
import { Session } from './entities/session.entity';
import { SESSION_REPOSITORY } from './interfaces/session-repository.interface';
import { SESSIONS_SERVICE } from './interfaces/sessions-service.interface';
import { SessionRepository } from './repositories/session.repository';
import { SessionsService } from './services/sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
  providers: [
    { provide: SESSION_REPOSITORY, useClass: SessionRepository },
    { provide: SESSIONS_SERVICE, useClass: SessionsService },
  ],
  exports: [SESSION_REPOSITORY, SESSIONS_SERVICE],
})
export class SessionsModule {}
