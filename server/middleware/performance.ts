import { Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Compression middleware for response optimization
export const compressionMiddleware = compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Security middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting for different endpoints
export const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({
    windowMs,
    max,
    message: {
      error: "Too many requests",
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// API rate limits
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes
export const authRateLimit = createRateLimit(15 * 60 * 1000, 20); // 20 auth requests per 15 minutes
export const aiRateLimit = createRateLimit(60 * 1000, 30); // 30 AI requests per minute
export const uploadRateLimit = createRateLimit(60 * 1000, 50); // 50 uploads per minute

// Request timeout middleware
export const timeoutMiddleware = (timeout: number = 30000) => 
  (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
      }
    }, timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    
    next();
  };

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const size = res.get('content-length') || 0;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms - ${size} bytes`);
    }
    
    // Log performance metrics
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms - ${size} bytes`);
  });
  
  next();
};

// Database connection pooling optimization
export const optimizeDbConnections = () => {
  // Set optimal pool settings for high concurrency
  return {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    idle: 10000, // Idle timeout
    acquire: 30000, // Acquire timeout
    evict: 1000, // Eviction timeout
  };
};

// Response caching middleware
export const cacheMiddleware = (duration: number = 300) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    res.set('Cache-Control', `public, max-age=${duration}`);
    res.set('ETag', `"${Date.now()}"`);
    
    next();
  };