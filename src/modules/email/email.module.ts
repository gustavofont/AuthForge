import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from '../../common/logger/logger.module';
import { EMAIL_PROVIDER } from '../../common/interfaces/email-provider.interface';
import { AppConfig } from '../../config/configuration';
import { MailForgeEmailProvider } from './providers/mailforge-email.provider';
import { MAIL_CLIENT, MAIL_QUEUE } from './providers/mail-client.constants';
import { EmailService } from './email.service';

// ConsoleEmailProvider stays in the codebase, unused by default — the
// documented stub for running without RabbitMQ configured (see its own
// comment). Swap the binding below to go back to it.

@Module({
  imports: [
    LoggerModule,
    ClientsModule.registerAsync([
      {
        name: MAIL_CLIENT,
        useFactory: (configService: ConfigService<AppConfig, true>) => {
          const { url } = configService.get('rabbitmq', { infer: true });
          return {
            transport: Transport.RMQ as const,
            options: {
              urls: [url],
              queue: MAIL_QUEUE,
              // MailForge owns this queue's topology — asserting it here
              // with different arguments would fail with 406
              // PRECONDITION_FAILED.
              noAssert: true,
              connectTimeout: 3000,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [{ provide: EMAIL_PROVIDER, useClass: MailForgeEmailProvider }, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
