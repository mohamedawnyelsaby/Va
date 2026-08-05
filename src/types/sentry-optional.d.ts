// @sentry/nextjs is an intentionally optional dependency (see
// src/lib/monitoring/sentry.ts) — it's not in package.json, and the app
// runs fine without it. This ambient declaration lets TypeScript resolve
// the dynamic `import('@sentry/nextjs')` in that file without either
// installing the real SDK or suppressing a compiler error with
// ts-ignore/ts-expect-error (this project's eslint config bans ts-ignore,
// and ts-expect-error was unreliable here since whether tsc actually
// raises the "module not found" error for this specific dynamic import
// is order-dependent). The shape below only needs to cover what
// sentry.ts actually calls: init(), captureException(), captureMessage().
declare module '@sentry/nextjs' {
  interface SentryInitOptions {
    dsn?: string;
    tracesSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    ignoreErrors?: string[];
    beforeSend?: (event: Record<string, unknown>) => Record<string, unknown>;
  }

  export function init(options: SentryInitOptions): void;
  export function captureException(
    error: Error,
    context?: { extra?: Record<string, unknown> }
  ): void;
  export function captureMessage(
    message: string,
    level?: 'info' | 'warning' | 'error'
  ): void;
}
