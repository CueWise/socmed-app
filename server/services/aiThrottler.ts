import { cache } from "../cache";
import * as crypto from "crypto";

interface ThrottleConfig {
  maxConcurrent: number;
  queueSize: number;
  cooldownMs: number;
}

interface QueueItem {
  id: string;
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
}

// Advanced AI request throttler to prevent rate limiting and optimize costs
export class AIThrottler {
  private queue: QueueItem[] = [];
  private running: Set<string> = new Set();
  private config: ThrottleConfig;
  private lastRequestTime = 0;

  constructor(config: ThrottleConfig = {
    maxConcurrent: 3,
    queueSize: 50,
    cooldownMs: 1000
  }) {
    this.config = config;
  }

  async throttle<T>(
    operation: () => Promise<T>,
    priority: number = 1,
    cacheKey?: string
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = await cache.get<T>(cacheKey);
      if (cached) return cached;
    }

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const item: QueueItem = {
        id,
        operation,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };

      // Check queue size
      if (this.queue.length >= this.config.queueSize) {
        reject(new Error('AI request queue is full. Please try again later.'));
        return;
      }

      // Add to queue with priority sorting
      this.queue.push(item);
      this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running.size >= this.config.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Respect cooldown between requests
    const now = Date.now();
    if (now - this.lastRequestTime < this.config.cooldownMs) {
      setTimeout(() => this.processQueue(), this.config.cooldownMs);
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.running.add(item.id);
    this.lastRequestTime = now;

    try {
      const result = await item.operation();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running.delete(item.id);
      // Process next item with cooldown
      setTimeout(() => this.processQueue(), this.config.cooldownMs);
    }
  }

  // Get queue status for monitoring
  getStatus() {
    return {
      queueLength: this.queue.length,
      running: this.running.size,
      maxConcurrent: this.config.maxConcurrent,
      lastRequestTime: this.lastRequestTime
    };
  }

  // Clear queue (emergency measure)
  clearQueue(): void {
    const items = this.queue.splice(0);
    items.forEach(item => 
      item.reject(new Error('Queue cleared'))
    );
  }
}

// Create hash for caching AI results
export function createAIHash(content: string, operation: string, params?: any): string {
  const input = JSON.stringify({ content, operation, params });
  return crypto.createHash('md5').update(input).digest('hex').slice(0, 16);
}

// Optimized AI service with caching and throttling
export class OptimizedAIService {
  private throttler: AIThrottler;

  constructor() {
    this.throttler = new AIThrottler({
      maxConcurrent: 2, // Conservative for cost control
      queueSize: 100,
      cooldownMs: 2000 // 2 second cooldown between requests
    });
  }

  async generateCaption(
    topic: string, 
    platform: string, 
    tone?: string, 
    keywords?: string[]
  ): Promise<string> {
    const hash = createAIHash(topic, 'caption', { platform, tone, keywords });
    const cacheKey = `ai:caption:${hash}`;

    return this.throttler.throttle(
      async () => {
        // Import AI module here to avoid circular dependencies
        const { generateCaption } = await import("../ai");
        const result = await generateCaption({ topic, platform, tone, keywords });
        
        // Cache result for 24 hours
        await cache.set(cacheKey, result, 86400);
        return result;
      },
      2, // High priority for caption generation
      cacheKey
    );
  }

  async suggestHashtags(content: string, platform: string): Promise<{
    hashtags: string[];
    reasoning: string;
  }> {
    const hash = createAIHash(content, 'hashtags', { platform });
    const cacheKey = `ai:hashtags:${hash}`;

    return this.throttler.throttle(
      async () => {
        const { suggestHashtags } = await import("../ai");
        const result = await suggestHashtags(content, platform);
        
        // Cache for 12 hours
        await cache.set(cacheKey, result, 43200);
        return result;
      },
      1, // Normal priority
      cacheKey
    );
  }

  async optimizeForEngagement(content: string, platform: string): Promise<{
    optimizedContent: string;
    suggestions: string[];
    score: number;
  }> {
    const hash = createAIHash(content, 'optimize', { platform });
    const cacheKey = `ai:optimize:${hash}`;

    return this.throttler.throttle(
      async () => {
        const { optimizeForEngagement } = await import("../ai");
        const result = await optimizeForEngagement(content, platform);
        
        // Cache for 6 hours
        await cache.set(cacheKey, result, 21600);
        return result;
      },
      1, // Normal priority
      cacheKey
    );
  }

  async suggestBestPostingTime(platform: string, audienceTimezone = "UTC"): Promise<{
    recommendedTime: string;
    reasoning: string;
    alternativeTimes: string[];
  }> {
    const hash = createAIHash('', 'posting-time', { platform, audienceTimezone });
    const cacheKey = `ai:posting-time:${hash}`;

    return this.throttler.throttle(
      async () => {
        const { suggestBestPostingTime } = await import("../ai");
        const result = await suggestBestPostingTime(platform, audienceTimezone);
        
        // Cache for 24 hours (posting times don't change frequently)
        await cache.set(cacheKey, result, 86400);
        return result;
      },
      0, // Lower priority
      cacheKey
    );
  }

  getStatus() {
    return this.throttler.getStatus();
  }
}

export const optimizedAI = new OptimizedAIService();