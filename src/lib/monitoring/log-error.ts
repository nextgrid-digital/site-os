type ErrorContext = Record<string, unknown>;

/**
 * Central place to record unexpected errors. Currently logs structured JSON
 * to stdout/stderr; swap in Sentry (or similar) by replacing the body here
 * once a DSN is provisioned, without touching every call site.
 */
export function logError(scope: string, error: unknown, context?: ErrorContext) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[${scope}]`, message, { ...context, stack });
}
