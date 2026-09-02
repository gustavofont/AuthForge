export interface SendMailOptions {
  to: string;
  subject: string;
  body: string;
  /**
   * Notification type for providers that support structured templates
   * (e.g. MailForge's forgot-password/reset-password templates). Omitted
   * means plain subject/body text — providers without template support can
   * ignore this and `context` entirely.
   */
  type?: 'forgot-password' | 'reset-password';
  context?: Record<string, unknown>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
