// src/app/api/auth/[...nextauth]/route.ts
//
// SECURITY: the credentials sign-in callback is a password-guessing oracle,
// and it used to have NO rate limit (signup / forgot-password / reset had one,
// but this route, served directly by NextAuth, did not). Every attempt to
// POST /api/auth/callback/credentials is now throttled twice:
//   - per client IP   ('login'),
//   - per target email ('loginEmail'), so a distributed attack on a single
//     account is slowed down even when each request comes from a new IP.
// Other NextAuth endpoints (session, csrf, providers, Google/Pi callbacks)
// are passed through untouched.

import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth/options';
import { checkRateLimit } from '@/lib/rate-limit';

const handler = NextAuth(authOptions);

type RouteContext = { params: Promise<{ nextauth: string[] }> };

const CREDENTIALS_CALLBACK = /\/api\/auth\/callback\/credentials\/?$/;

/** Reads the submitted email without consuming the body NextAuth needs. */
async function readSubmittedEmail(request: NextRequest): Promise<string | null> {
  try {
    const cloned = request.clone();
    const type = cloned.headers.get('content-type') || '';
    let raw: unknown;
    if (type.includes('application/json')) {
      raw = ((await cloned.json()) as { email?: unknown })?.email;
    } else {
      raw = (await cloned.formData()).get('email');
    }
    if (typeof raw !== 'string') {return null;}
    const email = raw.trim().toLowerCase().slice(0, 254);
    return email || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handler(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (CREDENTIALS_CALLBACK.test(new URL(request.url).pathname)) {
    const byIp = await checkRateLimit(request, 'login');
    if (byIp) {return byIp;}

    const email = await readSubmittedEmail(request);
    if (email) {
      const byEmail = await checkRateLimit(request, 'loginEmail', `email:${email}`);
      if (byEmail) {return byEmail;}
    }
  }
  return handler(request, context);
}
