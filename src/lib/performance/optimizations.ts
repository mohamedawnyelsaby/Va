/**
 * Performance Optimization Utilities for VA Travel App
 * High-Tech Gradient Design System - World Class Performance
 */

// Image Optimization Configuration
export const imageOptimization = {
  sizes: {
    thumbnail: '(max-width: 640px) 100vw, 300px',
    card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    hero: '100vw',
  },
  quality: 80,
  formats: ['webp', 'avif'],
};

// Web Vitals Monitoring
export function reportWebVital(metric: any) {
  // Send to analytics service (e.g., Google Analytics, Sentry)
  const body = JSON.stringify(metric);
  
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', body);
  } else {
    fetch('/api/metrics', { body, method: 'POST', keepalive: true });
  }
}

// Cache strategies
export const cacheStrategies = {
  // Cache-first: Check cache first, fall back to network
  cacheFirst: async (cacheName: string, request: Request) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      cache.put(request, response.clone());
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network-first: Try network first, fall back to cache
  networkFirst: async (cacheName: string, request: Request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      return response;
    } catch {
      const cache = await caches.open(cacheName);
      return await cache.match(request) || new Response('Offline', { status: 503 });
    }
  },

  // Stale-while-revalidate: Return cached immediately, update in background
  staleWhileRevalidate: async (cacheName: string, request: Request) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      cache.put(request, response.clone());
      return response;
    });

    return cached || fetchPromise;
  },
};

// Debounce utility for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export function setupLazyImageLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Prefetch links on hover/focus
export function setupLinkPrefetch() {
  const prefetchedUrls = new Set<string>();

  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link?.href && !prefetchedUrls.has(link.href)) {
      prefetchedUrls.add(link.href);
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch';
      prefetch.href = link.href;
      document.head.appendChild(prefetch);
    }
  });
}

// Core Web Vitals thresholds (ms)
export const webVitalsThresholds = {
  LCP: 2500,   // Largest Contentful Paint
  FID: 100,    // First Input Delay
  CLS: 0.1,    // Cumulative Layout Shift
  TTFB: 600,   // Time to First Byte
  FCP: 1800,   // First Contentful Paint
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    if (measure) {
      this.metrics.set(name, measure.duration);
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  logMetrics() {
    const metrics = this.getMetrics();
    console.table('[Performance]', metrics);
  }
}

// Compression utility (for JSON payloads)
export function compressJSON(obj: any): string {
  return JSON.stringify(obj);
}

export function decompressJSON(str: string): any {
  return JSON.parse(str);
}
