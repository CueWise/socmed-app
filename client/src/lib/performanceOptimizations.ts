// Client-side performance optimizations for scalability

// Debounced function to prevent excessive API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Throttled function to limit API call frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Intelligent image lazy loading with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer.unobserve(img);
            this.images.delete(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );
  }

  observe(img: HTMLImageElement): void {
    this.images.add(img);
    this.observer.observe(img);
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  }

  destroy(): void {
    this.observer.disconnect();
    this.images.clear();
  }
}

// Memory-efficient list virtualization for large datasets
export class VirtualList {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleItems: number;
  private totalItems: number;
  private startIndex = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    totalItems: number
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer

    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    this.container.addEventListener('scroll', 
      throttle(() => {
        const scrollTop = this.container.scrollTop;
        const newStartIndex = Math.floor(scrollTop / this.itemHeight);
        
        if (newStartIndex !== this.startIndex) {
          this.startIndex = newStartIndex;
          this.render();
        }
      }, 16) // ~60fps
    );
  }

  private render(): void {
    const endIndex = Math.min(
      this.startIndex + this.visibleItems,
      this.totalItems
    );

    // Update container height to maintain scroll position
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
    
    // Dispatch custom event with visible range
    this.container.dispatchEvent(new CustomEvent('virtualUpdate', {
      detail: {
        startIndex: this.startIndex,
        endIndex,
        offsetY: this.startIndex * this.itemHeight
      }
    }));
  }
}

// Efficient batch DOM updates
export class BatchUpdater {
  private updates: (() => void)[] = [];
  private scheduled = false;

  schedule(update: () => void): void {
    this.updates.push(update);
    
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    this.updates.forEach(update => update());
    this.updates = [];
    this.scheduled = false;
  }
}

// Optimized search with intelligent caching
export class SearchOptimizer {
  private cache = new Map<string, any>();
  private maxCacheSize = 100;
  private searchTimeout: NodeJS.Timeout | null = null;

  search<T>(
    query: string,
    searchFn: (query: string) => Promise<T>,
    debounceMs = 300
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Check cache first
      const cached = this.cache.get(query);
      if (cached) {
        resolve(cached);
        return;
      }

      // Debounce search
      this.searchTimeout = setTimeout(async () => {
        try {
          const result = await searchFn(query);
          this.cacheResult(query, result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, debounceMs);
    });
  }

  private cacheResult(query: string, result: any): void {
    // Implement LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(query, result);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    this.recordMetric(label, duration);
    
    // Clean up marks
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
    
    return duration;
  }

  private recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(label: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }
}

// Resource preloading for critical assets
export function preloadCriticalResources(): void {
  const criticalImages = [
    '/uploads/default-avatar.png',
    '/icons/instagram.svg',
    '/icons/facebook.svg',
    '/icons/twitter.svg',
    '/icons/tiktok.svg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Service worker utilities for PWA optimization
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('ServiceWorker registered successfully');
      return registration;
    })
    .catch(error => {
      console.log('ServiceWorker registration failed:', error);
      return null;
    });
}

// Export singleton instances
export const lazyImageLoader = new LazyImageLoader();
export const batchUpdater = new BatchUpdater();
export const searchOptimizer = new SearchOptimizer();
export const performanceMonitor = new PerformanceMonitor();

// Initialize performance optimizations
export function initializePerformanceOptimizations(): void {
  preloadCriticalResources();
  registerServiceWorker();
  
  // Monitor performance in development
  if (process.env.NODE_ENV === 'development') {
    // Log performance metrics every 30 seconds
    setInterval(() => {
      const metrics = performanceMonitor.getAllMetrics();
      if (Object.keys(metrics).length > 0) {
        console.table(metrics);
      }
    }, 30000);
  }
}