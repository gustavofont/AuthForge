import { Module } from '@nestjs/common';
import { LoggerModule } from '../../common/logger/logger.module';
import { EMAIL_PROVIDER } from '../../common/interfaces/email-provider.interface';
import { ConsoleEmailProvider } from './providers/console-email.provider';
import { EmailService } from './email.service';

@Module({
  imports: [LoggerModule],
  providers: [{ provide: EMAIL_PROVIDER, useClass: ConsoleEmailProvider }, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
