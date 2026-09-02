import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  EmailProvider,
  SendMailOptions,
} from '../../../common/interfaces/email-provider.interface';
import { AppLoggerService } from '../../../common/logger/app-logger.service';
import { MAIL_CLIENT } from './mail-client.constants';

const PUBLISH_TIMEOUT_MS = 3000;

/**
 * Publishes to MailForge's mail.queue (fanout exchange, MailForge owns the
 * topology — noAssert: true, same convention DotCard-API uses). Best-effort:
 * a notification failing to send must never throw — forgot-password already
 * responds 200 unconditionally to stay enumeration-safe, and a delivery
 * failure here shouldn't turn into a 500 for the caller.
 */
@Injectable()
export class MailForgeEmailProvider implements EmailProvider {
  constructor(
    @Inject(MAIL_CLIENT) private readonly client: ClientProxy,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('MailForgeEmailProvider');
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const payload = options.type
      ? { type: options.type, to: options.to, data: options.context ?? {} }
      : {
          type: 'default-notification',
          to: options.to,
          data: { name: '', title: options.subject, message: options.body },
        };

    try {
      await firstValueFrom(
        this.client.emit('mail.send', payload).pipe(timeout(PUBLISH_TIMEOUT_MS)),
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.warn(`Failed to publish mail notification to ${options.to}: ${reason}`);
    }
  }
}
