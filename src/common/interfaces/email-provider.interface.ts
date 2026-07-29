export interface SendMailOptions {
  to: string;
  subject: string;
  body: string;
  context?: Record<string, unknown>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
