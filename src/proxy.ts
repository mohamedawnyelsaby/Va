// src/proxy.ts - FIXED VERSION for Next.js 16+

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja', 'ko'];
const defaultLocale = 'en';

const protectedPaths = [
  '/dashboard',
  '/bookings',
  '/profile',
  '/settings',
  '/favorites',
];

const publicPaths = [
  '/api/auth',
  '/api/seed',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/_next',
  '/favicon.ico',
];

// النقطة المهمة: استخدام export default function proxy
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Clone the request URL
  const url = request.nextUrl.clone();

  // Handle locale detection and redirection
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get locale from cookie or header
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

  // Create response with security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.minepi.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.minepi.com https://*.vercel.app;"
  );

  // Check authentication for protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  if (isProtectedPath && !token) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (token) {
    if (pathWithoutLocale.includes('/admin') && token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (pathWithoutLocale.includes('/partner') && token.role !== 'partner' && token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // CSRF protection for non-GET API requests
  if (pathname.startsWith('/api') && request.method !== 'GET') {
    const csrfToken = request.headers.get('x-csrf-token');
    const referer = request.headers.get('referer');

    if (!csrfToken || !referer?.startsWith(request.nextUrl.origin)) {
      return new NextResponse('CSRF validation failed', { status: 403 });
    }
  }

  // Add request ID for tracking
  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|validation-key.txt|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
