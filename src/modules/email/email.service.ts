import { Inject, Injectable } from '@nestjs/common';
import {
  EMAIL_PROVIDER,
  EmailProvider,
  SendMailOptions,
} from '../../common/interfaces/email-provider.interface';

@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider) {}

  sendMail(options: SendMailOptions): Promise<void> {
    return this.emailProvider.sendMail(options);
  }
}
