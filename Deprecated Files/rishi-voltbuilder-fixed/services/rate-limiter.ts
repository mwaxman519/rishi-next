// Production Rate Limiting Service
// Protects APIs from abuse and ensures fair usage across cannabis booking operations

import { v4 as uuidv4 } from "uuid";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiterService {
  private static instance: RateLimiterService;
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval?: NodeJS.Timeout;

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  constructor() {
    this.startCleanup();
  }

  // Check if request is within rate limits
  checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const key = config.keyGenerator
      ? config.keyGenerator(identifier)
      : identifier;
    const now = Date.now();
    const resetTime = now + config.windowMs;

    let entry = this.store.get(key);

    if (!entry) {
      // First request for this identifier
      entry = {
        count: 1,
        resetTime,
        firstRequest: now,
      };
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(resetTime),
        totalHits: 1,
      };
    }

    // Check if window has expired
    if (now >= entry.resetTime) {
      // Reset the window
      entry.count = 1;
      entry.resetTime = resetTime;
      entry.firstRequest = now;
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(resetTime),
        totalHits: 1,
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetTime: new Date(entry.resetTime),
      totalHits: entry.count,
    };
  }

  // Get current rate limit status without incrementing
  getRateLimitStatus(
    identifier: string,
    config: RateLimitConfig,
  ): RateLimitResult | null {
    const key = config.keyGenerator
      ? config.keyGenerator(identifier)
      : identifier;
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now >= entry.resetTime) {
      return null; // Window expired
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);

    return {
      allowed: entry.count < config.maxRequests,
      remaining,
      resetTime: new Date(entry.resetTime),
      totalHits: entry.count,
    };
  }

  // Clear rate limit for specific identifier
  clearRateLimit(identifier: string, config?: RateLimitConfig): boolean {
    const key = config?.keyGenerator
      ? config.keyGenerator(identifier)
      : identifier;
    return this.store.delete(key);
  }

  // Get all active rate limits (for monitoring)
  getActiveLimits(): { identifier: string; entry: RateLimitEntry }[] {
    const now = Date.now();
    const active: { identifier: string; entry: RateLimitEntry }[] = [];

    for (const [identifier, entry] of this.store.entries()) {
      if (now < entry.resetTime) {
        active.push({ identifier, entry });
      }
    }

    return active;
  }

  // Start cleanup process to remove expired entries
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Remove expired entries to prevent memory leaks
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.store.delete(key));

    if (expiredKeys.length > 0) {
      console.debug(
        `Cleaned up ${expiredKeys.length} expired rate limit entries`,
      );
    }
  }

  // Stop cleanup (for graceful shutdown)
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Get memory usage statistics
  getStats() {
    return {
      totalEntries: this.store.size,
      activeEntries: this.getActiveLimits().length,
      memoryUsage: process.memoryUsage(),
    };
  }
}

// Predefined rate limit configurations for different use cases
export const RateLimitConfigs = {
  // General API access - 100 requests per minute
  API_GENERAL: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  } as RateLimitConfig,

  // Cannabis booking operations - 50 requests per minute (more restrictive)
  CANNABIS_BOOKING: {
    windowMs: 60 * 1000,
    maxRequests: 50,
  } as RateLimitConfig,

  // Authentication endpoints - 10 attempts per 15 minutes
  AUTH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  } as RateLimitConfig,

  // Staff assignment operations - 200 requests per minute (higher for operational needs)
  STAFF_OPERATIONS: {
    windowMs: 60 * 1000,
    maxRequests: 200,
  } as RateLimitConfig,

  // File uploads - 20 uploads per hour
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
  } as RateLimitConfig,

  // Location submissions - 30 per hour
  LOCATION_SUBMISSION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 30,
  } as RateLimitConfig,

  // Health checks - No limit (for monitoring)
  HEALTH_CHECK: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
  } as RateLimitConfig,
};

// Rate limit middleware helper
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.totalHits.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(
      result.resetTime.getTime() / 1000,
    ).toString(),
    "Retry-After": Math.ceil(
      (result.resetTime.getTime() - Date.now()) / 1000,
    ).toString(),
  };
}
