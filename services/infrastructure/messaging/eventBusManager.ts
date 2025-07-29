/**
 * Event Bus Manager for Rishi Platform
 * Centralized management and integration point for hybrid event system
 */

import { BaseEvent } from './eventTypes';
import { hybridEventBus, HybridEventBus } from './hybridEventBus';
import { EventHandler } from './distributedEventBus';

export class EventBusManager {
  private static instance: EventBusManager;
  private eventBus: HybridEventBus;
  private isInitialized: boolean = false;

  private constructor() {
    this.eventBus = hybridEventBus;
  }

  public static getInstance(): EventBusManager {
    if (!EventBusManager.instance) {
      EventBusManager.instance = new EventBusManager();
    }
    return EventBusManager.instance;
  }

  /**
   * Initialize the event bus system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 EventBusManager: Initializing hybrid event system...');
      
      // Get initial stats to verify system
      const stats = await this.eventBus.getStats();
      
      console.log(`✅ EventBusManager: Initialized in ${stats.mode} mode`);
      if (stats.redisHealth?.connected) {
        console.log(`📡 EventBusManager: Redis connected with ${stats.redisHealth.latency}ms latency`);
      }

      this.isInitialized = true;
      
      // Publish initialization event
      await this.publishSystemEvent('system.eventbus.initialized', {
        mode: stats.mode,
        redisAvailable: stats.redisHealth?.connected ?? false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ EventBusManager: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to events across the platform
   */
  async subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options?: { localOnly?: boolean; redisOnly?: boolean }
  ): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.eventBus.subscribe(eventType, handler, options);
  }

  /**
   * Publish events across the platform
   */
  async publish<T extends BaseEvent>(
    event: T,
    options?: { localOnly?: boolean; redisOnly?: boolean }
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Enrich event with system metadata
    const enrichedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        publishedVia: 'EventBusManager',
        serviceInstance: process.env.SERVICE_NAME || 'rishi-platform',
        timestamp: event.timestamp || new Date()
      }
    };

    return this.eventBus.publish(enrichedEvent, options);
  }

  /**
   * Publish system-level events
   */
  async publishSystemEvent(
    eventType: string,
    payload: Record<string, any>,
    userId: string = 'system',
    organizationId: string = 'system'
  ): Promise<void> {
    const systemEvent: BaseEvent = {
      type: eventType,
      userId,
      organizationId,
      timestamp: new Date(),
      correlationId: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...payload,
        source: 'EventBusManager',
        systemEvent: true
      }
    };

    return this.publish(systemEvent);
  }

  /**
   * Get comprehensive system statistics
   */
  async getSystemStats(): Promise<{
    initialized: boolean;
    stats: any;
    uptime: number;
    eventTypes: string[];
  }> {
    const stats = await this.eventBus.getStats();
    
    // Calculate unique event types from history
    const history = await this.eventBus.getEventHistory(undefined, 100);
    const eventTypes = [...new Set(history.map(event => event.type))];

    return {
      initialized: this.isInitialized,
      stats,
      uptime: process.uptime(),
      eventTypes
    };
  }

  /**
   * Health check for the entire event system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const stats = await this.eventBus.getStats();
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      
      if (stats.mode === 'hybrid' && stats.redisHealth?.connected) {
        status = 'healthy';
      } else if (stats.mode === 'local-only') {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          mode: stats.mode,
          redisConnected: stats.redisHealth?.connected ?? false,
          localSubscriptions: Object.values(stats.local).reduce((sum, count) => sum + count, 0),
          redisSubscriptions: stats.redis ? Object.values(stats.redis).reduce((sum, count) => sum + count, 0) : 0,
          redisLatency: stats.redisHealth?.latency
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionIds: string[]): Promise<boolean[]> {
    return this.eventBus.unsubscribe(subscriptionIds);
  }

  /**
   * Get event history
   */
  async getEventHistory(
    eventType?: string,
    limit: number = 50,
    source: 'local' | 'redis' | 'both' = 'both'
  ): Promise<BaseEvent[]> {
    return this.eventBus.getEventHistory(eventType, limit, source);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔌 EventBusManager: Shutting down...');
    
    await this.publishSystemEvent('system.eventbus.shutdown', {
      reason: 'graceful_shutdown',
      timestamp: new Date().toISOString()
    });

    await this.eventBus.destroy();
    this.isInitialized = false;
    
    console.log('✅ EventBusManager: Shutdown completed');
  }
}

// Export singleton instance
export const eventBusManager = EventBusManager.getInstance();

// Auto-initialize in production environments
if (process.env.NODE_ENV === 'production') {
  eventBusManager.initialize().catch(error => {
    console.error('❌ Failed to auto-initialize EventBusManager:', error);
  });
}