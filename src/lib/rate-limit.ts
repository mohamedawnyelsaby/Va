// src/lib/rate-limit.ts
// Rate limiting for sensitive / costly endpoints.
//
// - With UPSTASH_REDIS_REST_URL/TOKEN configured: Upstash sliding window,
//   shared across serverless instances (the real protection).
// - Without Redis: a per-instance in-memory fixed window. It is NOT shared
//   across instances and resets on cold start, so it only slows abuse — but
//   that is strictly better than the previous behaviour (no limiting at all).
//   A warning is logged so the missing Redis config stays visible.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export type RateLimitTier = 'auth' | 'payment' | 'ai' | 'search';

// tier -> [max requests, window in seconds]
const TIER_CONFIG: Record<RateLimitTier, [number, number]> = {
  auth: [10, 60],
  payment: [5, 60],
  ai: [10, 60],
  search: [30, 60],
};

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  logger.warn(
    '⚠️ UPSTASH_REDIS_REST_URL/TOKEN not configured — using per-instance in-memory rate limiting only. ' +
      'Configure Redis for effective protection of auth, payment, AI and search endpoints.'
  );
}

const limiters = redis
  ? (Object.fromEntries(
      (Object.keys(TIER_CONFIG) as RateLimitTier[]).map((tier) => {
        const [max, windowSec] = TIER_CONFIG[tier];
        return [
          tier,
          new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
            prefix: `ratelimit:${tier}`,
          }),
        ];
      })
    ) as Record<RateLimitTier, Ratelimit>)
  : null;

// ---- in-memory fallback -------------------------------------------------
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();
const MEMORY_MAX_KEYS = 5000;

function memoryLimit(identifier: string, max: number, windowSec: number) {
  const now = Date.now();

  if (memoryBuckets.size > MEMORY_MAX_KEYS) {
    for (const [key, bucket] of memoryBuckets) {
      if (bucket.resetAt <= now) {memoryBuckets.delete(key);}
    }
    // Still huge after pruning -> drop everything rather than grow unbounded.
    if (memoryBuckets.size > MEMORY_MAX_KEYS) {memoryBuckets.clear();}
  }

  const existing = memoryBuckets.get(identifier);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSec * 1000;
    memoryBuckets.set(identifier, { count: 1, resetAt });
    return { success: true, limit: max, remaining: max - 1, reset: resetAt };
  }

  existing.count += 1;
  return {
    success: existing.count <= max,
    limit: max,
    remaining: Math.max(0, max - existing.count),
    reset: existing.resetAt,
  };
}

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Call at the top of a route handler. Returns a 429 NextResponse to return
 * immediately if the limit was exceeded, or null if the request may proceed.
 *
 *   const limited = await checkRateLimit(request, 'payment');
 *   if (limited) return limited;
 */
export async function checkRateLimit(
  request: Request,
  tier: RateLimitTier
): Promise<NextResponse | null> {
  const identifier = `${tier}:${getClientId(request)}`;
  const [max, windowSec] = TIER_CONFIG[tier];

  let result: { success: boolean; limit: number; remaining: number; reset: number };
  try {
    result = limiters
      ? await limiters[tier].limit(identifier)
      : memoryLimit(identifier, max, windowSec);
  } catch (error) {
    // Redis outage must not take the app down: fall back to memory.
    logger.error('[rate-limit] backend error, using in-memory fallback:', error);
    result = memoryLimit(identifier, max, windowSec);
  }

  if (!result.success) {
    logger.warn(`🚫 Rate limit exceeded: ${identifier}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    );
  }

  return null;
}
