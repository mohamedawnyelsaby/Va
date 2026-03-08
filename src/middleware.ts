import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru', 'pt', 'hi'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes, static files, etc.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/apple-touch') ||
    pathname.startsWith('/og-image') ||
    pathname.startsWith('/site.webmanifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to default locale
  const locale = defaultLocale;
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
