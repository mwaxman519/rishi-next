/**
 * Organization Cache Manager
 *
 * This module provides caching mechanisms that are organization-aware,
 * ensuring that cached data is properly isolated between organizations.
 */

import { OrganizationContext } from "../storage";

// Type for cache configuration options
export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in the cache (per organization)
}

// Default cache configuration
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
};

// Cache entry with metadata
interface CacheEntry<T> {
  value: T;
  expires: number;
}

/**
 * Organization-aware cache manager that maintains separate caches for each organization
 */
export class OrganizationCacheManager {
  private caches: Map<number, Map<string, CacheEntry<any>>> = new Map();
  private options: CacheOptions;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };

    // Set up automatic cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Clean up every minute
  }

  /**
   * Get a value from the cache for a specific organization
   */
  get<T>(key: string, context: OrganizationContext): T | undefined {
    const orgCache = this.getOrCreateOrgCache(context.organizationId);
    const entry = orgCache.get(key);

    // Return undefined if not in cache or expired
    if (!entry || entry.expires < Date.now()) {
      if (entry) {
        // Remove expired entry
        orgCache.delete(key);
      }
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Set a value in the cache for a specific organization
   */
  set<T>(
    key: string,
    value: T,
    context: OrganizationContext,
    ttl?: number,
  ): void {
    const orgCache = this.getOrCreateOrgCache(context.organizationId);

    // Check if we need to evict entries due to size limit
    if (this.options.maxSize && orgCache.size >= this.options.maxSize) {
      this.evictLeastRecentlyUsed(orgCache);
    }

    // Calculate expiration time
    const expires = Date.now() + (ttl || this.options.ttl);

    // Store the value with expiration time
    orgCache.set(key, { value, expires });
  }

  /**
   * Check if a key exists in the cache for a specific organization
   */
  has(key: string, context: OrganizationContext): boolean {
    const orgCache = this.getOrCreateOrgCache(context.organizationId);
    const entry = orgCache.get(key);

    if (!entry || entry.expires < Date.now()) {
      if (entry) {
        // Remove expired entry
        orgCache.delete(key);
      }
      return false;
    }

    return true;
  }

  /**
   * Remove a key from the cache for a specific organization
   */
  delete(key: string, context: OrganizationContext): boolean {
    const orgCache = this.getOrCreateOrgCache(context.organizationId);
    return orgCache.delete(key);
  }

  /**
   * Clear all cached items for a specific organization
   */
  clearOrganization(organizationId: number): void {
    this.caches.delete(organizationId);
  }

  /**
   * Clear all caches for all organizations
   */
  clearAll(): void {
    this.caches.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): {
    organizationCount: number;
    totalEntries: number;
    organizationSizes: Record<number, number>;
  } {
    const stats = {
      organizationCount: this.caches.size,
      totalEntries: 0,
      organizationSizes: {} as Record<number, number>,
    };

    this.caches.forEach((cache, orgId) => {
      const size = cache.size;
      stats.totalEntries += size;
      stats.organizationSizes[orgId] = size;
    });

    return stats;
  }

  /**
   * Internal method to get or create the cache for an organization
   */
  private getOrCreateOrgCache(
    organizationId: number,
  ): Map<string, CacheEntry<any>> {
    if (!this.caches.has(organizationId)) {
      this.caches.set(organizationId, new Map());
    }
    return this.caches.get(organizationId)!;
  }

  /**
   * Internal method to evict least recently used items when cache is full
   */
  private evictLeastRecentlyUsed(cache: Map<string, CacheEntry<any>>): void {
    // For simplicity, just remove the first entry
    // In a more sophisticated implementation, we'd track usage and evict based on LRU policy
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }

  /**
   * Clean up expired cache entries for all organizations
   */
  private cleanup(): void {
    const now = Date.now();

    this.caches.forEach((cache, orgId) => {
      cache.forEach((entry, key) => {
        if (entry.expires < now) {
          cache.delete(key);
        }
      });

      // If the organization cache is empty after cleanup, remove it
      if (cache.size === 0) {
        this.caches.delete(orgId);
      }
    });
  }
}
