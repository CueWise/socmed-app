import memoize from "memoizee";
import { Redis } from "ioredis";

// In-memory cache for development, Redis for production
class CacheService {
  private redis?: Redis;
  private memoryCache = new Map<string, { data: any; expires: number }>();
  
  constructor() {
    // Initialize Redis if available in production
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    }
    
    // Fallback to memory cache
    const item = this.memoryCache.get(key);
    if (item && item.expires > Date.now()) {
      return item.data;
    }
    
    if (item) {
      this.memoryCache.delete(key);
    }
    
    return null;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (this.redis) {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    }
    
    // Fallback to memory cache
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
    
    // Clean up expired entries periodically
    if (this.memoryCache.size > 1000) {
      this.cleanup();
    }
  }

  async del(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
      return;
    }
    
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return;
    }
    
    // Memory cache pattern matching
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.memoryCache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cache = new CacheService();

// Memoized functions for expensive operations
export const memoizedAI = memoize(
  async (content: string, operation: string) => {
    // AI operations are expensive, cache for 1 hour
    return cache.get(`ai:${operation}:${content.slice(0, 50)}`);
  },
  { maxAge: 3600000, length: 2 }
);

// Cache keys
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  POSTS: (brandId?: number, status?: string) => `posts:${brandId || 'all'}:${status || 'all'}`,
  BRANDS: () => 'brands:all',
  ANALYTICS: (brandId: number, startDate: string, endDate: string) => 
    `analytics:${brandId}:${startDate}:${endDate}`,
  CALENDAR: (brandId?: number, month?: string) => `calendar:${brandId || 'all'}:${month}`,
  AI_RESULT: (operation: string, hash: string) => `ai:${operation}:${hash}`,
};