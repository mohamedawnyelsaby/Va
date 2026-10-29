// src/lib/security/api-policy.ts
//
// Pure, edge-safe helpers used by src/middleware.ts. Kept free of Next.js
// imports so every rule can be unit-tested directly.
//
// Policy summary
// - CORS: an API request that carries an Origin header is only allowed if the
//   origin is the app's own origin or is on the explicit allowlist. Anything
//   else is rejected with 403 (the browser never gets to read the response,
//   and the request is not processed). Requests WITHOUT an Origin header are
//   server-to-server (Pi webhook, cron) and are not CORS traffic.
// - Auth: every /api path is DENY-BY-DEFAULT (needs a valid session) unless it
//   is listed as public, or authenticates itself (secret / signature).

export type ApiAccess = 'public' | 'self-authenticated' | 'protected';

/** Pi's own browser/SDK origins. Needed for cross-origin calls from Pi Browser. */
const PI_ORIGINS = ['https://sdk.minepi.com', 'https://app-cdn.minepi.com'];

/**
 * Allowed cross-origin callers. Configure with CORS_ALLOWED_ORIGINS
 * (comma-separated, exact origins such as https://va.pi). The app's own
 * origin is always allowed separately (same-origin) and does not need to be
 * listed. Wildcards are NOT supported on purpose.
 */
export function getAllowedOrigins(env: Record<string, string | undefined> = process.env): string[] {
  const fromEnv = (env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .filter((o) => o !== '*');
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  return Array.from(new Set([...PI_ORIGINS, ...(appUrl ? [appUrl.replace(/\/$/, '')] : []), ...fromEnv]));
}

export function isOriginAllowed(
  origin: string,
  ownOrigin: string,
  allowed: string[] = getAllowedOrigins()
): boolean {
  if (!origin) {return false;}
  if (origin === ownOrigin) {return true;}
  return allowed.includes(origin);
}

// ---- auth classification ------------------------------------------------

const SELF_AUTHENTICATED_PREFIXES = [
  '/api/webhooks/pi', // HMAC signature
  '/api/cron/', // CRON_SECRET bearer
  '/api/seed', // SEED_SECRET
];

const PUBLIC_ALWAYS_PREFIXES = [
  '/api/auth/', // NextAuth + signup / password reset / Pi verify
  '/api/pi/auth',
  '/api/health',
];

// Public for reads only. Any write needs a session.
const PUBLIC_READ_PREFIXES = [
  '/api/hotels',
  '/api/cities',
  '/api/attractions',
  '/api/restaurants',
  '/api/search',
  '/api/reviews',
];

// Public by design (rate limited inside the route).
const PUBLIC_POST_PATHS = ['/api/ai/travel'];

const matches = (pathname: string, prefix: string) =>
  prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`);

export function classifyApi(pathname: string, method: string): ApiAccess {
  const m = method.toUpperCase();

  if (SELF_AUTHENTICATED_PREFIXES.some((p) => matches(pathname, p))) {return 'self-authenticated';}
  if (PUBLIC_ALWAYS_PREFIXES.some((p) => matches(pathname, p))) {return 'public';}
  if (PUBLIC_POST_PATHS.includes(pathname) && m === 'POST') {return 'public';}
  if (PUBLIC_READ_PREFIXES.some((p) => matches(pathname, p)) && (m === 'GET' || m === 'HEAD')) {
    return 'public';
  }
  // bookings, payments, user, favorites, dev, any write, and anything unknown.
  return 'protected';
}

/** Locale-less page paths that need a signed-in user. */
const PROTECTED_PAGE_SEGMENTS = [
  'profile',
  'wallet',
  'bookings',
  'booking',
  'dashboard',
  'favorites',
  'settings',
];

export function isProtectedPage(pathnameWithoutLocale: string): boolean {
  const first = pathnameWithoutLocale.split('/').filter(Boolean)[0];
  return PROTECTED_PAGE_SEGMENTS.includes(first ?? '');
}
