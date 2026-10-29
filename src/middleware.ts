// src/middleware.ts
// Edge middleware: locale routing, security headers, CORS allowlist and
// session enforcement (see src/lib/security/api-policy.ts for the rules).
//
// SECURITY
// - /api/*: an unknown Origin is rejected with 403; every API path is
//   deny-by-default and needs a session unless explicitly public or
//   self-authenticated (webhook signature / cron secret / seed secret).
// - Sensitive pages (profile, wallet, bookings, ...) redirect to sign-in
//   without a session.
// - This is a first gate only: it checks that a valid, signed session cookie
//   exists. Route handlers still re-check the user in the database
//   (requireUser / requireAdmin), which is what revokes deactivated users.

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  classifyApi,
  getAllowedOrigins,
  isOriginAllowed,
  isProtectedPage,
} from '@/lib/security/api-policy';

// Must match src/app/[locale]/layout.tsx and Locale in lib/i18n/translations.ts:
// a locale accepted here but not there redirects visitors to a 404.
const locales = ['en', 'ar', 'fr', 'es', 'de', 'ru', 'zh', 'ja'];
const defaultLocale = 'en';

// Pi domain-ownership validation keys, one per registered app. Both
// va-pied.vercel.app (Testnet app) and va-mainnet.vercel.app (Mainnet
// app) are aliases of this same Vercel deployment, so a single static
// public/validation-key.txt can't serve both — Pi checks
// https://<domain>/validation-key.txt and expects a different value
// per domain. These values are meant to be public (that's the whole
// point of the file), so hardcoding them here is fine.
const VALIDATION_KEYS: Record<string, string> = {
  'va-pied.vercel.app': 'ff33e9722c38cad2f0ff491e01f3e70d21c695368d78af8299537117183c830762b90b777d192b4a9704c48c4e302225f601e2604056043d4a3f59a1e362e301',
  'va-mainnet.vercel.app': 'd94228e67abeffc15c2ad34a613cfd7af51201db1e5502a7767807cdae9a1904393a0d011dd22f83412da289a1cbc973853b1f1d642e5920d460812aa828f3b3',
};

// Reads and verifies the signed NextAuth session cookie. The cookie name must
// match the one configured in src/lib/auth/options.ts. Any failure means
// "no session" (fail closed).
async function readSession(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {return null;}
  try {
    const secure = process.env.NODE_ENV === 'production';
    return await getToken({
      req: request,
      secret,
      secureCookie: secure,
      cookieName: secure ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    });
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Serve the correct per-domain Pi validation key before any of the
  // generic static-file/dotted-path skip logic below would otherwise
  // catch this same path and pass it straight to the single static file.
  if (pathname === '/validation-key.txt') {
    const host = request.headers.get('host')?.split(':')[0] ?? '';
    const key = VALIDATION_KEYS[host];
    if (key) {
      return new NextResponse(key, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    // Unknown host — fall through to the static public/validation-key.txt file.
  }

  // ✅ API routes: CORS allowlist + session enforcement. Handled BEFORE the
  // static-file skip below so a dotted path (e.g. /api/hotels/a.b) can never
  // slip past these checks.
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const ownOrigin = request.nextUrl.origin;

    if (origin && !isOriginAllowed(origin, ownOrigin, getAllowedOrigins())) {
      return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
    }

    const corsHeaders = new Headers();
    if (origin) {
      corsHeaders.set('Access-Control-Allow-Origin', origin);
      corsHeaders.set('Vary', 'Origin');
      corsHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Preflight carries no credentials; answer it for allowed origins only.
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    if (classifyApi(pathname, request.method) === 'protected') {
      const token = await readSession(request);
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
    }

    const response = NextResponse.next();
    corsHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  // ✅ Skip static files and images
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/apple-touch') ||
    pathname.startsWith('/og-image') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/screenshots') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ✅ Locale detection and redirect
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();

    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    const acceptLanguage = request.headers.get('accept-language');

    let detectedLocale = defaultLocale;

    if (localeCookie && locales.includes(localeCookie)) {
      detectedLocale = localeCookie;
    } else if (acceptLanguage) {
      const preferred = acceptLanguage.split(',')[0].split('-')[0];
      if (locales.includes(preferred)) {
        detectedLocale = preferred;
      }
    }

    url.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // ✅ Sensitive pages need a session
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  if (isProtectedPage(withoutLocale)) {
    const token = await readSession(request);
    if (!token) {
      const locale = pathname.split('/')[1];
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/signin`;
      url.search = '';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ✅ Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Allow framing from Pi Browser
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.minepi.com https://app-cdn.minepi.com"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
