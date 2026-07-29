import { Injectable } from '@nestjs/common';
import {
  EmailProvider,
  SendMailOptions,
} from '../../../common/interfaces/email-provider.interface';
import { AppLoggerService } from '../../../common/logger/app-logger.service';

/**
 * Development/default stub. Logs the email instead of sending it so the
 * EmailProvider abstraction has a working implementation out of the box.
 * Swap the binding in EmailModule for a real provider (SMTP, SES, SendGrid, ...)
 * when one is needed — no other code depends on this class.
 */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('ConsoleEmailProvider');
  }

  sendMail(options: SendMailOptions): Promise<void> {
    this.logger.log(`Email to ${options.to} | Subject: ${options.subject}\n${options.body}`);
    return Promise.resolve();
  }
}
