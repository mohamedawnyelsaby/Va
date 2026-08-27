// src/lib/logger.ts
// Thin wrapper around console so intentional logging (payment/webhook/auth
// traces, dev-time debugging) doesn't trip the no-console ESLint rule at
// every call site. Behavior is identical to console.* — this exists purely
// to give logging call sites a single, lint-exempt place to go through.
// If/when this app adopts a real logging backend (Sentry, Datadog, etc.),
// this is the one file that needs to change.

/* eslint-disable no-console */
export const logger = {
  log: (...args: unknown[]) => console.log(...args),
  info: (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
/* eslint-enable no-console */
