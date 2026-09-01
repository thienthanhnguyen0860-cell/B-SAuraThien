/**
 * Production Error Reporting & Logging Abstraction
 * Supports extensible monitoring providers (e.g. Sentry / Datadog) while safely logging
 * in development and sanitizing sensitive user data in production.
 */

export interface ErrorContext {
  userId?: string | null;
  email?: string | null;
  path?: string;
  action?: string;
  extra?: Record<string, any>;
}

export interface ErrorReporter {
  captureException(error: unknown, context?: ErrorContext): void;
  captureMessage(message: string, level?: 'info' | 'warn' | 'error', context?: ErrorContext): void;
}

export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomStr}`;
}

class ConsoleErrorReporter implements ErrorReporter {
  private isProduction = process.env.NODE_ENV === 'production';

  public captureException(error: unknown, context?: ErrorContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const correlationId = generateCorrelationId();

    // Sanitize context: Never log passwords, tokens, or raw payment details
    const sanitizedContext = context ? this.sanitize(context) : {};

    if (this.isProduction) {
      console.error(`[ErrorReporter][${correlationId}]`, {
        name: errorObj.name,
        message: errorObj.message,
        context: sanitizedContext,
      });
    } else {
      console.error(`[DEV ErrorReporter][${correlationId}]`, errorObj, sanitizedContext);
    }
  }

  public captureMessage(message: string, level: 'info' | 'warn' | 'error' = 'info', context?: ErrorContext): void {
    const correlationId = generateCorrelationId();
    const sanitizedContext = context ? this.sanitize(context) : {};

    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logFn(`[ErrorReporter][${level.toUpperCase()}][${correlationId}] ${message}`, sanitizedContext);
  }

  private sanitize(data: Record<string, any>): Record<string, any> {
    const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'accountNumber'];
    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
        cleaned[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = Array.isArray(value) ? value : this.sanitize(value);
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

export const errorReporter: ErrorReporter = new ConsoleErrorReporter();
