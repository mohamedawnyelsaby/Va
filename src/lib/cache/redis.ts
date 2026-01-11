import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    ttl: number = 3600
  ): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  static async delMany(keys: string[]): Promise<boolean> {
    try {
      await redis.del(...keys);
      return true;
    } catch (error) {
      console.error('Cache delete many error:', error);
      return false;
    }
  }

  static async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }

  static async cacheHotels(
    cityId: string,
    hotels: any[],
    ttl: number = 3600
  ): Promise<boolean> {
    return this.set(`hotels:city:${cityId}`, hotels, ttl);
  }

  static async getHotels(cityId: string): Promise<any[] | null> {
    return this.get<any[]>(`hotels:city:${cityId}`);
  }

  static async cacheHotel(
    hotelId: string,
    hotel: any,
    ttl: number = 3600
  ): Promise<boolean> {
    return this.set(`hotel:${hotelId}`, hotel, ttl);
  }

  static async getHotel(hotelId: string): Promise<any | null> {
    return this.get<any>(`hotel:${hotelId}`);
  }

  static async cacheSearch(
    query: string,
    results: any[],
    ttl: number = 1800
  ): Promise<boolean> {
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
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
}
