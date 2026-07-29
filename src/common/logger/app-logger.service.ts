import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

/**
 * Centralized application logger. Wraps Nest's ConsoleLogger so every log line
 * shares one format/context convention and can be swapped for a structured
 * transport (e.g. pino/winston/ELK) later without touching call sites.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  logAuthEvent(event: string, details: Record<string, unknown>): void {
    this.log(`[AUTH_EVENT] ${event} ${JSON.stringify(details)}`);
  }

  logAuthFailure(event: string, details: Record<string, unknown>): void {
    this.warn(`[AUTH_FAILURE] ${event} ${JSON.stringify(details)}`);
  }
}
