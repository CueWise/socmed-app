import { Request, Response, NextFunction } from "express";
import { cache } from "../cache";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Advanced rate limiter with Redis support
export class AdvancedRateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: (req) => req.ip,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options
    };
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = `ratelimit:${this.options.keyGenerator!(req)}`;
      const windowStart = Math.floor(Date.now() / this.options.windowMs) * this.options.windowMs;
      const cacheKey = `${key}:${windowStart}`;

      try {
        const current = await cache.get<number>(cacheKey) || 0;
        
        if (current >= this.options.maxRequests) {
          const resetTime = new Date(windowStart + this.options.windowMs);
          
          res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded",
            retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
            limit: this.options.maxRequests,
            remaining: 0,
            reset: resetTime.toISOString()
          });
          return;
        }

        // Increment counter
        await cache.set(cacheKey, current + 1, Math.ceil(this.options.windowMs / 1000));

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': this.options.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.options.maxRequests - current - 1).toString(),
          'X-RateLimit-Reset': new Date(windowStart + this.options.windowMs).toISOString()
        });

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open - allow request if rate limiter fails
        next();
      }
    };
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API access
  api: new AdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000
  }),

  // Authentication endpoints
  auth: new AdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20
  }),

  // AI API calls (expensive operations)
  ai: new AdvancedRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (req) => req.user?.id || req.ip // User-based if authenticated
  }),

  // File uploads
  upload: new AdvancedRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  }),

  // Third-party API calls (to prevent hitting external limits)
  thirdParty: new AdvancedRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  })
};

// Adaptive rate limiting based on server load
export class AdaptiveRateLimiter extends AdvancedRateLimiter {
  private baseMaxRequests: number;

  constructor(options: RateLimitOptions) {
    super(options);
    this.baseMaxRequests = options.maxRequests;
  }

  private getServerLoad(): number {
    // Simple load calculation based on memory usage
    const used = process.memoryUsage();
    const total = used.heapTotal;
    return used.heapUsed / total;
  }

  middleware() {
    const originalMiddleware = super.middleware();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const load = this.getServerLoad();
      
      // Reduce rate limit when server is under high load
      if (load > 0.8) {
        this.options.maxRequests = Math.floor(this.baseMaxRequests * 0.5);
      } else if (load > 0.6) {
        this.options.maxRequests = Math.floor(this.baseMaxRequests * 0.7);
      } else {
        this.options.maxRequests = this.baseMaxRequests;
      }

      originalMiddleware(req, res, next);
    };
  }
}