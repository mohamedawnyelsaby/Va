// ✅ Optional Sentry — no crash if not installed
//
// @sentry/nextjs is intentionally NOT in package.json. This module loads
// it dynamically at runtime only when NEXT_PUBLIC_SENTRY_DSN is set, and
// falls back to console logging otherwise. TypeScript resolves the import
// via the ambient declaration in src/types/sentry-optional.d.ts, so no
// ts-ignore/ts-expect-error suppression is needed here anymore.
import type * as SentryType from '@sentry/nextjs';

let Sentry: typeof SentryType | null = null;

async function loadSentry() {
  try {
    Sentry = await import('@sentry/nextjs');
  } catch {
    // Sentry not installed — silent fail
  }
}

if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  loadSentry().then(() => {
    if (!Sentry) {return;}
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      ignoreErrors: ['ResizeObserver loop limit exceeded'],
      beforeSend(event: Record<string, unknown>) {
        if (event.request) {
          const request = event.request as Record<string, unknown>;
          delete request.cookies;
          delete request.headers;
        }
        return event;
      },
    });
  });
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (Sentry) {
    Sentry.captureException(error, { extra: context });
  } else {
    // eslint-disable-next-line no-console -- this IS the fallback error
    // reporter when Sentry isn't configured; suppressing it would mean
    // errors vanish silently instead of at least reaching server logs.
    console.error('[Error]', error.message, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (Sentry) {
    Sentry.captureMessage(message, level);
  } else {
    // eslint-disable-next-line no-console -- see captureException above
    console.log(`[${level.toUpperCase()}]`, message);
  }
}
