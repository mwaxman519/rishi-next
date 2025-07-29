/**
 * Hybrid Event Bus for Rishi Platform
 * Combines local in-memory events with Redis distributed coordination
 * Falls back gracefully when Redis is unavailable
 */

import { BaseEvent } from './eventTypes';
import { DistributedEventBus, EventHandler } from './distributedEventBus';
import { RedisEventBus } from './redisEventBus';

export interface HybridEventBusConfig {
  enableRedis?: boolean;
  fallbackToLocal?: boolean;
  redisConfig?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    database?: number;
    maxRetries?: number;
  };
}

export class HybridEventBus {
  private localBus: DistributedEventBus;
  private redisBus: RedisEventBus | null = null;
  private config: Required<HybridEventBusConfig>;
  private isRedisAvailable: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: HybridEventBusConfig = {}) {
    this.config = {
      enableRedis: config.enableRedis ?? true,
      fallbackToLocal: config.fallbackToLocal ?? true,
      redisConfig: config.redisConfig || {}
    };

    // Always initialize local bus
    this.localBus = new DistributedEventBus();

    // Initialize Redis if enabled
    if (this.config.enableRedis) {
      this.initializeRedis();
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redisBus = new RedisEventBus(this.config.redisConfig);
      await this.redisBus.connect();
      this.isRedisAvailable = true;
      
      console.log('🔄 Hybrid EventBus: Redis enabled, local fallback available');
      
      // Start health monitoring
      this.startHealthMonitoring();
      
    } catch (error) {
      console.warn('⚠️ Hybrid EventBus: Redis initialization failed, using local-only mode:', error);
      this.isRedisAvailable = false;
      this.redisBus = null;
      
      if (!this.config.fallbackToLocal) {
        throw new Error('Redis unavailable and fallback disabled');
      }
    }
  }

  private startHealthMonitoring(): void {
    // Check Redis health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      if (this.redisBus) {
        const health = await this.redisBus.healthCheck();
        
        if (this.isRedisAvailable && !health.connected) {
          console.warn('⚠️ Hybrid EventBus: Redis connection lost, falling back to local');
          this.isRedisAvailable = false;
        } else if (!this.isRedisAvailable && health.connected) {
          console.log('✅ Hybrid EventBus: Redis connection restored');
          this.isRedisAvailable = true;
        }
      }
    }, 30000);
  }

  /**
   * Subscribe to events (hybrid approach)
   */
  async subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options: { localOnly?: boolean; redisOnly?: boolean } = {}
  ): Promise<string[]> {
    const subscriptionIds: string[] = [];

    try {
      // Always subscribe locally unless redisOnly is specified
      if (!options.redisOnly) {
        const localId = this.localBus.subscribe(eventType, handler);
        subscriptionIds.push(`local:${localId}`);
      }

      // Subscribe to Redis if available and not localOnly
      if (!options.localOnly && this.isRedisAvailable && this.redisBus) {
        try {
          const redisId = await this.redisBus.subscribe(eventType, handler);
          subscriptionIds.push(`redis:${redisId}`);
        } catch (error) {
          console.warn(`⚠️ Hybrid EventBus: Redis subscription failed for ${eventType}:`, error);
          this.isRedisAvailable = false;
        }
      }

      console.log(`📡 Hybrid EventBus: Subscribed to ${eventType} via ${subscriptionIds.length} channels`);
      return subscriptionIds;
      
    } catch (error) {
      console.error(`❌ Hybrid EventBus: Subscription failed for ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionIds: string[]): Promise<boolean[]> {
    const results: boolean[] = [];

    for (const id of subscriptionIds) {
      try {
        if (id.startsWith('local:')) {
          const localId = id.replace('local:', '');
          const result = this.localBus.unsubscribe(localId);
          results.push(result);
        } else if (id.startsWith('redis:') && this.redisBus) {
          const redisId = id.replace('redis:', '');
          const result = await this.redisBus.unsubscribe(redisId);
          results.push(result);
        } else {
          results.push(false);
        }
      } catch (error) {
        console.warn(`⚠️ Hybrid EventBus: Unsubscribe failed for ${id}:`, error);
        results.push(false);
      }
    }

    return results;
  }

  /**
   * Publish events to both local and Redis
   */
  async publish<T extends BaseEvent>(
    event: T,
    options: { localOnly?: boolean; redisOnly?: boolean } = {}
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    // Publish locally unless redisOnly is specified
    if (!options.redisOnly) {
      promises.push(this.localBus.publish(event));
    }

    // Publish to Redis if available and not localOnly
    if (!options.localOnly && this.isRedisAvailable && this.redisBus) {
      promises.push(
        this.redisBus.publish(event).catch(error => {
          console.warn(`⚠️ Hybrid EventBus: Redis publish failed for ${event.type}:`, error);
          this.isRedisAvailable = false;
          
          // Fallback to local if Redis fails and fallback is enabled
          if (this.config.fallbackToLocal && !options.redisOnly) {
            return this.localBus.publish(event);
          }
        })
      );
    }

    try {
      await Promise.allSettled(promises);
      
      const targets = [];
      if (!options.redisOnly) targets.push('local');
      if (!options.localOnly && this.isRedisAvailable) targets.push('redis');
      
      console.log(`📤 Hybrid EventBus: Published ${event.type} via [${targets.join(', ')}]`);
      
    } catch (error) {
      console.error(`❌ Hybrid EventBus: Publish failed for ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Get event history from both sources
   */
  async getEventHistory(
    eventType?: string,
    limit: number = 100,
    source: 'local' | 'redis' | 'both' = 'both'
  ): Promise<BaseEvent[]> {
    const events: BaseEvent[] = [];

    try {
      if (source === 'local' || source === 'both') {
        const localEvents = this.localBus.getEventHistory(limit);
        events.push(...localEvents);
      }

      if ((source === 'redis' || source === 'both') && this.isRedisAvailable && this.redisBus) {
        const redisEvents = await this.redisBus.getEventHistory(eventType, limit);
        events.push(...redisEvents);
      }

      // Remove duplicates based on correlationId and sort by timestamp
      const uniqueEvents = events.reduce((acc, event) => {
        const existing = acc.find(e => e.correlationId === event.correlationId);
        if (!existing) {
          acc.push(event);
        }
        return acc;
      }, [] as BaseEvent[]);

      return uniqueEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Hybrid EventBus: Failed to get event history:', error);
      return [];
    }
  }

  /**
   * Get comprehensive statistics
   */
  async getStats(): Promise<{
    local: Record<string, number>;
    redis?: Record<string, number>;
    redisHealth?: { connected: boolean; latency?: number; error?: string };
    mode: 'local-only' | 'hybrid' | 'redis-only';
  }> {
    const localStats = this.localBus.getSubscriptionStats();
    let redisStats: Record<string, number> | undefined;
    let redisHealth: { connected: boolean; latency?: number; error?: string } | undefined;

    if (this.redisBus) {
      try {
        redisStats = this.redisBus.getSubscriptionStats();
        redisHealth = await this.redisBus.healthCheck();
      } catch (error) {
        console.warn('⚠️ Hybrid EventBus: Failed to get Redis stats:', error);
      }
    }

    const mode = this.isRedisAvailable ? 'hybrid' : 'local-only';

    return {
      local: localStats,
      ...(redisStats ? { redis: redisStats } : {}),
      ...(redisHealth ? { redisHealth } : {}),
      mode
    };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.redisBus) {
      await this.redisBus.disconnect();
    }

    console.log('🔌 Hybrid EventBus: Cleanup completed');
  }
}

// Export singleton instance
export const hybridEventBus = new HybridEventBus({
  enableRedis: process.env.ENABLE_REDIS_EVENTS === 'true',
  fallbackToLocal: true,
  redisConfig: {
    // Support both Upstash (KV_URL) and Replit Redis Cloud (REDIS_URL)
    url: process.env.KV_URL || process.env.REDIS_URL,
    ...(process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : {}),
    ...(process.env.REDIS_PORT ? { port: parseInt(process.env.REDIS_PORT) } : {}),
    ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
    ...(process.env.REDIS_DB ? { database: parseInt(process.env.REDIS_DB) } : {}),
    maxRetries: 3
  }
});