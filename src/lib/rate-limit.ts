// src/lib/rate-limit.ts
// Redis-backed rate limiting for sensitive endpoints (signup, Pi auth,
// Pi payments) using Upstash's sliding-window algorithm — durable across
// serverless function invocations and regions, unlike an in-memory
// counter (which resets per cold start and isn't shared across
// concurrent instances).
//
// Fails OPEN if Redis isn't configured (UPSTASH_REDIS_REST_URL/TOKEN
// missing): requests are allowed through rather than the app breaking,
// but a warning is logged so misconfiguration is visible rather than
// silently leaving every request unprotected forever.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  logger.warn(
    '⚠️ UPSTASH_REDIS_REST_URL/TOKEN not configured — rate limiting is DISABLED (fail-open). ' +
    'Sensitive endpoints (signup, Pi auth, Pi payments) are currently unprotected against abuse.'
  );
}

// Separate limiters per sensitivity tier. Payment creation is the most
// abuse-sensitive (each request can trigger a real Pi Network API call),
// so it gets the tightest limit.
const limiters = redis
  ? {
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'ratelimit:auth',
      }),
      payment: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        prefix: 'ratelimit:payment',
      }),
    }
  : null;

export type RateLimitTier = 'auth' | 'payment';

/**
 * Extracts a best-effort client identifier for rate-limit keying.
 * Vercel sets x-forwarded-for; falls back to a shared bucket if absent
 * (better to rate-limit too broadly than not at all).
 */
function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Call at the top of a route handler. Returns a 429 NextResponse to
 * return immediately if the limit was exceeded, or null if the request
 * should proceed normally.
 *
 * Usage:
 *   const limited = await checkRateLimit(request, 'payment');
 *   if (limited) return limited;
 */
export async function checkRateLimit(
  request: Request,
  tier: RateLimitTier
): Promise<NextResponse | null> {
  if (!limiters) {return null;} // fail open — see warning above

  const identifier = `${tier}:${getClientId(request)}`;
  const { success, limit, remaining, reset } = await limiters[tier].limit(identifier);

  if (!success) {
    logger.warn(`🚫 Rate limit exceeded: ${identifier}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    );
  }

  return null;
}
