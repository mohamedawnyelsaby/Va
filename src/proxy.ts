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

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
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

  const url = request.nextUrl.clone();

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
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

  const response = NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  // Temporarily disabled for Pi Browser compatibility
  // if (isProtectedPath && !token) {
  //   const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
  //   signInUrl.searchParams.set('callbackUrl', pathname);
  //   return NextResponse.redirect(signInUrl);
  // }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
