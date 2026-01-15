// src/lib/cache/redis.ts

// ✅ In-Memory Cache Fallback
class InMemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
    return true;
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async delMany(keys: string[]): Promise<boolean> {
    keys.forEach(key => this.cache.delete(key));
    return true;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + amount;
    await this.set(key, newValue, 3600);
    return newValue;
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

// ✅ Redis Client with Fallback
let redisClient: any = null;
let useInMemory = false;
const memoryCache = new InMemoryCache();

async function getRedisClient() {
  if (redisClient) return redisClient;
  
  try {
    // Only import Redis if env vars are set
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log('✅ Redis connected');
      return redisClient;
    }
  } catch (error) {
    console.warn('⚠️ Redis not available, using in-memory cache');
  }
  
  useInMemory = true;
  return null;
}

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (useInMemory) {
        return await memoryCache.get<T>(key);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.get<T>(key);
      }

      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      if (useInMemory) {
        return await memoryCache.set(key, value, ttl);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.set(key, value, ttl);
      }

      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      if (useInMemory) {
        return await memoryCache.del(key);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.del(key);
      }

      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  static async delMany(keys: string[]): Promise<boolean> {
    try {
      if (useInMemory) {
        return await memoryCache.delMany(keys);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.delMany(keys);
      }

      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete many error:', error);
      return false;
    }
  }

  static async keys(pattern: string): Promise<string[]> {
    try {
      if (useInMemory) {
        return await memoryCache.keys(pattern);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.keys(pattern);
      }

      return await redis.keys(pattern);
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }

  static async cacheHotels(cityId: string, hotels: any[], ttl: number = 3600): Promise<boolean> {
    return this.set(`hotels:city:${cityId}`, hotels, ttl);
  }

  static async getHotels(cityId: string): Promise<any[] | null> {
    return this.get<any[]>(`hotels:city:${cityId}`);
  }

  static async cacheHotel(hotelId: string, hotel: any, ttl: number = 3600): Promise<boolean> {
    return this.set(`hotel:${hotelId}`, hotel, ttl);
  }

  static async getHotel(hotelId: string): Promise<any | null> {
    return this.get<any>(`hotel:${hotelId}`);
  }

  static async cacheSearch(query: string, results: any[], ttl: number = 1800): Promise<boolean> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.set(key, results, ttl);
  }

  static async getSearch(query: string): Promise<any[] | null> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.get<any[]>(key);
  }

  static async invalidateHotelCache(hotelId: string): Promise<boolean> {
    const keys = await this.keys(`*hotel:${hotelId}*`);
    if (keys.length > 0) {
      return this.delMany(keys);
    }
    return true;
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (useInMemory) {
        return await memoryCache.increment(key, amount);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.increment(key, amount);
      }

      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      if (useInMemory) {
        return await memoryCache.exists(key);
      }

      const redis = await getRedisClient();
      if (!redis) {
        return await memoryCache.exists(key);
      }

      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
}
