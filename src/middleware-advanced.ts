import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth',
  ];

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (!isPublicPath) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
