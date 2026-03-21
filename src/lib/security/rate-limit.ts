import { NextRequest } from 'next/server';

// ✅ In-Memory Rate Limiter (fallback when Redis unavailable)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const TIER_LIMITS: Record<string, { requests: number; window: number }> = {
  free:     { requests: 100,  window: 3600 },
  bronze:   { requests: 200,  window: 3600 },
  silver:   { requests: 500,  window: 3600 },
  gold:     { requests: 1000, window: 3600 },
  platinum: { requests: 5000, window: 3600 },
};

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real      = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real)      return real;
  return 'unknown';
}

async function tryRedisRateLimit(
  key: string,
  limits: { requests: number; window: number }
): Promise<RateLimitResult | null> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const now    = Date.now();
    const window = limits.window * 1000;
    const windowStart = now - window;

    await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcount(key, windowStart, now);
    await redis.expire(key, limits.window);

    const remaining = Math.max(0, limits.requests - count);
    const reset = Math.ceil((now + window) / 1000);

    if (count > limits.requests) {
      return { success: false, limit: limits.requests, remaining: 0, reset, retryAfter: limits.window };
    }
    return { success: true, limit: limits.requests, remaining, reset };
  } catch {
    return null;
  }
}

function memoryRateLimit(
  key: string,
  limits: { requests: number; window: number }
): RateLimitResult {
  const now = Date.now();
  const windowMs = limits.window * 1000;
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success:   true,
      limit:     limits.requests,
      remaining: limits.requests - 1,
      reset:     Math.ceil((now + windowMs) / 1000),
    };
  }

  entry.count++;
  const remaining = Math.max(0, limits.requests - entry.count);
  const reset = Math.ceil(entry.resetAt / 1000);

  if (entry.count > limits.requests) {
    return { success: false, limit: limits.requests, remaining: 0, reset, retryAfter: limits.window };
  }
  return { success: true, limit: limits.requests, remaining, reset };
}

// ✅ Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetAt) memoryStore.delete(key);
  }
}, 10 * 60 * 1000);

export async function rateLimit(
  request: NextRequest,
  tier: string = 'free'
): Promise<RateLimitResult> {
  const ip     = getClientIP(request);
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const key    = `ratelimit:${ip}:${tier}`;

  // Try Redis first, fallback to memory
  const redisResult = await tryRedisRateLimit(key, limits);
  if (redisResult) return redisResult;

  return memoryRateLimit(key, limits);
}
