/**
 * Distributed Event Bus for Rishi Platform
 * Handles event publishing and subscription across the application
 */

import { PlatformEvent, BaseEvent } from './eventTypes';

export interface EventHandler<T extends BaseEvent = BaseEvent> {
  (event: T): Promise<void> | void;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  active: boolean;
}

export class DistributedEventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: BaseEvent[] = [];
  private maxHistorySize: number = 1000;

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): string {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler: handler as EventHandler,
      active: true
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);
    return subscription.id;
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index >= 0) {
        subscriptions[index].active = false;
        subscriptions.splice(index, 1);
        
        // Clean up empty event type arrays
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends BaseEvent>(event: T): Promise<void> {
    // Add to event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Get subscribers for this event type
    const subscriptions = this.subscriptions.get(event.type) || [];
    const activeSubscriptions = subscriptions.filter(sub => sub.active);

    // Execute handlers concurrently
    const promises = activeSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
        // In a production system, you might want to emit an error event
        this.emitErrorEvent(event, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Emit an error event when a handler fails
   */
  private emitErrorEvent(originalEvent: BaseEvent, error: any): void {
    const errorEvent: BaseEvent = {
      type: 'system.error',
      userId: originalEvent.userId,
      organizationId: originalEvent.organizationId,
      timestamp: new Date(),
      correlationId: `error_${originalEvent.correlationId}`,
      metadata: {
        originalEvent: originalEvent.type,
        error: error instanceof Error ? error.message : String(error)
      }
    };

    // Avoid infinite loops by not publishing error events for error events
    if (originalEvent.type !== 'system.error') {
      setTimeout(() => this.publish(errorEvent), 0);
    }
  }

  /**
   * Get event history for debugging/monitoring
   */
  getEventHistory(limit?: number): BaseEvent[] {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
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
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Dispose of all subscriptions and clear history
   */
  dispose(): void {
    this.subscriptions.clear();
    this.eventHistory = [];
  }

  /**
   * Wait for a specific event type
   */
  waitForEvent<T extends BaseEvent>(
    eventType: string,
    timeout: number = 5000,
    predicate?: (event: T) => boolean
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let subscriptionId: string;
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (subscriptionId) {
          this.unsubscribe(subscriptionId);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout);

      subscriptionId = this.subscribe<T>(eventType, (event) => {
        if (!predicate || predicate(event)) {
          cleanup();
          resolve(event);
        }
      });
    });
  }
}

// Global singleton instance
export const distributedEventBus = new DistributedEventBus();

// Helper functions for common event operations
export const publishEvent = <T extends BaseEvent>(event: T) => distributedEventBus.publish(event);
export const subscribeToEvent = <T extends BaseEvent>(eventType: string, handler: EventHandler<T>) => 
  distributedEventBus.subscribe(eventType, handler);
export const unsubscribeFromEvent = (subscriptionId: string) => distributedEventBus.unsubscribe(subscriptionId);
/**
 * Publish an event to the distributed event bus
 * Handles both BaseEvent and AppEvent types
 */
export async function publishEvent(event: BaseEvent | AppEvent): Promise<void> {
  try {
    // Log the event for development
    console.log('[Event Bus] Publishing event:', event.type, event);
    
    // In a production environment, this would publish to the actual event bus
    // For now, we'll just log it
    return Promise.resolve();
  } catch (error) {
    console.error('[Event Bus] Failed to publish event:', error);
    throw error;
  }
}
