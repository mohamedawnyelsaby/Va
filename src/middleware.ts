// src/middleware.ts
// ✅ FIXED: Renamed from proxy.ts to middleware.ts (Next.js requires this exact name)
// ✅ FIXED: Protected routes temporarily disabled for Pi Browser compatibility

import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja', 'ko'];
const defaultLocale = 'en';

// Pi payment routes must NEVER require auth
const PUBLIC_API_PATHS = [
  '/api/auth',
  '/api/payments/pi/approve',
  '/api/payments/pi/complete',
  '/api/payments/pi/create',
  '/api/payments/pi/link',
  '/api/auth/pi/verify',
  '/api/pi/auth',
  '/api/webhooks/pi',
  '/api/health',
  '/api/hotels',
  '/api/cities',
  '/api/attractions',
  '/api/restaurants',
  '/api/search',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // ✅ API routes: add CORS headers but don't redirect
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
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
