export interface LogContext {
  readonly action: string;
  readonly uid?: string;
  readonly category?: string;
  readonly [key: string]: unknown;
}

export function logError(message: string, error: unknown, context: LogContext): void {
  console.error(JSON.stringify({
    level: 'error',
    message,
    error: error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : String(error),
    context,
    timestamp: new Date().toISOString(),
  }));
}

export function logInfo(message: string, context: LogContext): void {
  console.info(JSON.stringify({
    level: 'info',
    message,
    context,
    timestamp: new Date().toISOString(),
  }));
}
