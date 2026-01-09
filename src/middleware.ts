// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru', 'pt', 'hi'];
const defaultLocale = 'en';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/bookings', '/profile', '/settings'];

// Public routes that should redirect if authenticated
const authRoutes = ['/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if locale is in pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get locale from cookie or Accept-Language header
    const locale = getLocale(request) || defaultLocale;
    
    // Redirect to URL with locale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  // Extract current locale from pathname
  const locale = pathname.split('/')[1];

  // Check authentication for protected routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(`/${locale}${route}`)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(`/${locale}${route}`)
  );

  if (isProtectedRoute && !token) {
    // Redirect to signin if not authenticated
    const url = new URL(`/${locale}/auth/signin`, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );

  return response;
}

function getLocale(request: NextRequest): string | null {
  // Check cookie first
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return null;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|api|favicon.ico|.*\\..*|_vercel|public).*)',
  ],
};
