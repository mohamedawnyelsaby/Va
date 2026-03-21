// ✅ Optional Sentry — no crash if not installed
let Sentry: any = null;

async function loadSentry() {
  try {
    Sentry = await import('@sentry/nextjs');
  } catch {
    // Sentry not installed — silent fail
  }
}

if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  loadSentry().then(() => {
    if (!Sentry) return;
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      ignoreErrors: ['ResizeObserver loop limit exceeded'],
      beforeSend(event: any) {
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });
  });
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (Sentry) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Error]', error.message, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (Sentry) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}]`, message);
  }
}
