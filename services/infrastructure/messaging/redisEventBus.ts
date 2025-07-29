/**
 * Redis-based Distributed Event Bus for Rishi Platform
 * Provides cross-service event coordination using Redis pub/sub
 */

import { createClient, RedisClientType } from 'redis';
import { BaseEvent } from './eventTypes';
import { EventHandler, EventSubscription } from './distributedEventBus';

export interface RedisEventBusConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  eventTtlSeconds?: number;
  enableEventHistory?: boolean;
  maxHistorySize?: number;
}

export class RedisEventBus {
  private client: RedisClientType;
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private config: Required<RedisEventBusConfig>;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  constructor(config: RedisEventBusConfig = {}) {
    this.config = {
      url: config.url || process.env.REDIS_URL || 'redis://localhost:6379',
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || process.env.REDIS_PASSWORD || '',
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 1000,
      eventTtlSeconds: config.eventTtlSeconds || 3600, // 1 hour
      enableEventHistory: config.enableEventHistory ?? true,
      maxHistorySize: config.maxHistorySize || 1000
    };

    this.initializeClients();
  }

  private initializeClients(): void {
    const clientConfig = {
      url: this.config.url,
      socket: {
        host: this.config.host,
        port: this.config.port,
        reconnectStrategy: (retries: number) => {
          if (retries >= this.config.maxRetries) {
            console.error(`Redis connection failed after ${retries} attempts`);
            return false;
          }
          return Math.min(retries * this.config.retryDelayMs, 5000);
        }
      },
      ...(this.config.password ? { password: this.config.password } : {})
    };

    // Main client for general operations
    this.client = createClient(clientConfig);
    
    // Dedicated publisher client
    this.pubClient = createClient(clientConfig);
    
    // Dedicated subscriber client
    this.subClient = createClient(clientConfig);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Connection event handlers
    this.client.on('connect', () => {
      console.log('✅ Redis EventBus: Main client connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis EventBus: Main client error:', error);
      this.isConnected = false;
    });

    this.pubClient.on('connect', () => {
      console.log('✅ Redis EventBus: Publisher client connected');
    });

    this.subClient.on('connect', () => {
      console.log('✅ Redis EventBus: Subscriber client connected');
    });

    // Message handler for subscriptions
    this.subClient.on('message', async (channel: string, message: string) => {
      try {
        const event: BaseEvent = JSON.parse(message);
        await this.handleIncomingEvent(channel, event);
      } catch (error) {
        console.error(`Failed to parse Redis event on channel ${channel}:`, error);
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.pubClient.connect(),
        this.subClient.connect()
      ]);
      console.log('🚀 Redis EventBus: All clients connected successfully');
    } catch (error) {
      console.error('❌ Redis EventBus: Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.pubClient.quit(),
        this.subClient.quit()
      ]);
      console.log('🔌 Redis EventBus: All clients disconnected');
    } catch (error) {
      console.error('❌ Redis EventBus: Disconnect error:', error);
    }
  }

  /**
   * Subscribe to events with Redis pub/sub
   */
  async subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<string> {
    const subscription: EventSubscription = {
      id: `redis_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler: handler as EventHandler,
      active: true
    };

    // Store local subscription
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
      // Subscribe to Redis channel
      await this.subClient.subscribe(eventType, (message) => {
        // Message handling is done via the 'message' event listener
      });
    }

    this.subscriptions.get(eventType)!.push(subscription);
    console.log(`📡 Redis EventBus: Subscribed to ${eventType} (${subscription.id})`);
    
    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index >= 0) {
        if (subscriptions[index]) {
          subscriptions[index].active = false;
          subscriptions.splice(index, 1);
        }
        
        // Unsubscribe from Redis if no more local subscriptions
        if (subscriptions.length === 0) {
          await this.subClient.unsubscribe(eventType);
          this.subscriptions.delete(eventType);
          console.log(`📡 Redis EventBus: Unsubscribed from ${eventType}`);
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * Publish event to Redis and local subscribers
   */
  async publish<T extends BaseEvent>(event: T): Promise<void> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis EventBus: Not connected, falling back to local-only');
      await this.handleIncomingEvent(event.type, event);
      return;
    }

    try {
      // Add correlation tracking
      const enrichedEvent = {
        ...event,
        timestamp: new Date(),
        correlationId: event.correlationId || `redis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          ...event.metadata,
          publishedBy: process.env.SERVICE_NAME || 'rishi-platform',
          publishedAt: new Date().toISOString()
        }
      };

      // Store event history in Redis (with TTL)
      if (this.config.enableEventHistory) {
        const historyKey = `events:history:${event.type}`;
        await this.client.lPush(historyKey, JSON.stringify(enrichedEvent));
        await this.client.lTrim(historyKey, 0, this.config.maxHistorySize - 1);
        await this.client.expire(historyKey, this.config.eventTtlSeconds);
      }

      // Publish to Redis
      await this.pubClient.publish(event.type, JSON.stringify(enrichedEvent));
      
      console.log(`📤 Redis EventBus: Published ${event.type} (${enrichedEvent.correlationId})`);
      
    } catch (error) {
      console.error(`❌ Redis EventBus: Failed to publish ${event.type}:`, error);
      // Fallback to local handling
      await this.handleIncomingEvent(event.type, event);
    }
  }

  /**
   * Handle incoming events from Redis or local fallback
   */
  private async handleIncomingEvent(eventType: string, event: BaseEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(eventType) || [];
    const activeSubscriptions = subscriptions.filter(sub => sub.active);

    if (activeSubscriptions.length === 0) {
      return;
    }

    // Execute handlers concurrently
    const promises = activeSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
        await this.emitErrorEvent(event, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Emit error events through Redis
   */
  private async emitErrorEvent(originalEvent: BaseEvent, error: any): Promise<void> {
    const errorEvent: BaseEvent = {
      type: 'system.error.redis',
      userId: originalEvent.userId || 'system',
      organizationId: originalEvent.organizationId || 'system',
      timestamp: new Date(),
      correlationId: `error_${originalEvent.correlationId}`,
      metadata: {
        originalEvent: originalEvent.type,
        error: error instanceof Error ? error.message : String(error),
        source: 'redis-event-bus'
      }
    };

    // Avoid infinite loops
    if (originalEvent.type !== 'system.error.redis') {
      setTimeout(() => this.publish(errorEvent), 0);
    }
  }

  /**
   * Get event history from Redis
   */
  async getEventHistory(eventType?: string, limit: number = 100): Promise<BaseEvent[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      if (eventType) {
        const historyKey = `events:history:${eventType}`;
        const events = await this.client.lRange(historyKey, 0, limit - 1);
        return events.map(event => JSON.parse(event));
      } else {
        // Get history for all event types
        const keys = await this.client.keys('events:history:*');
        const allEvents: BaseEvent[] = [];
        
        for (const key of keys) {
          const events = await this.client.lRange(key, 0, limit - 1);
          allEvents.push(...events.map(event => JSON.parse(event)));
        }
        
        return allEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, limit);
      }
    } catch (error) {
      console.error('❌ Redis EventBus: Failed to get event history:', error);
      return [];
    }
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      stats[eventType] = subscriptions.filter(sub => sub.active).length;
    }
    return stats;
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    if (!this.isConnected) {
      return { connected: false, error: 'Not connected' };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return { connected: true, latency };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
}

// Export singleton instance
export const redisEventBus = new RedisEventBus();