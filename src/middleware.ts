import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';

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
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/_next',
  '/favicon.ico',
];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.minepi.com;"
  );

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.includes(path)
  );

  if (isProtectedPath && !token) {
    const locale = pathname.split('/')[1];
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (token) {
    if (pathname.includes('/admin') && token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (pathname.includes('/partner') && token.role !== 'partner' && token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (pathname.startsWith('/api') && request.method !== 'GET') {
    const csrfToken = request.headers.get('x-csrf-token');
    const referer = request.headers.get('referer');

    if (!csrfToken || !referer?.startsWith(request.nextUrl.origin)) {
      return new NextResponse('CSRF validation failed', { status: 403 });
    }
  }

  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
