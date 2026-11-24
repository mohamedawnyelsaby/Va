// src/app/api/auth/[...nextauth]/route.ts
//
// NextAuth endpoint. Pi Network is the only sign-in provider (see
// src/lib/auth/options.ts), so there is no password-guessing surface here and
// nothing to rate-limit specially: unknown providers such as
// /api/auth/callback/credentials or /api/auth/signin/google are not registered
// and NextAuth rejects them.

import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth/options';

// Pi's /v2/me can take up to ~17 s in the worst case (8 s timeout + 1 retry);
// don't let the platform default cut the function off first.
export const maxDuration = 30;

const handler = NextAuth(authOptions);

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return handler(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handler(request, context);
}
