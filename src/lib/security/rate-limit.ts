import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TIER_LIMITS: Record<string, { requests: number; window: number }> = {
  free: { requests: 100, window: 3600 },
  bronze: { requests: 200, window: 3600 },
  silver: { requests: 500, window: 3600 },
  gold: { requests: 1000, window: 3600 },
  platinum: { requests: 5000, window: 3600 },
};

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export async function rateLimit(
  request: NextRequest,
  tier: string = 'free'
): Promise<RateLimitResult> {
  try {
    const ip = getClientIP(request);
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    
    const key = `ratelimit:${ip}:${tier}`;
    const now = Date.now();
    const window = limits.window * 1000;
    const windowStart = now - window;

    await redis.zadd(key, {
      score: now,
      member: `${now}:${Math.random()}`,
    });

    await redis.zremrangebyscore(key, 0, windowStart);

    const count = await redis.zcount(key, windowStart, now);

    await redis.expire(key, limits.window);

    const remaining = Math.max(0, limits.requests - count);
    const reset = Math.ceil((now + window) / 1000);

    if (count > limits.requests) {
      return {
        success: false,
        limit: limits.requests,
        remaining: 0,
        reset,
        retryAfter: Math.ceil(window / 1000),
      };
    }

    return {
      success: true,
      limit: limits.requests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Math.ceil(Date.now() / 1000) + 3600,
    };
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return 'unknown';
}
