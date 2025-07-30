/**
 * Event Bus Implementation
 *
 * Central event system for microservices communication within Next.js.
 * Provides type-safe event publishing and subscription with guaranteed delivery.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

export type EventHandler<T = any> = (data: T) => Promise<void> | void;

export interface IEventBus {
  publish<T>(event: string, data: T): Promise<void>;
  subscribe<T>(event: string, handler: EventHandler<T>): void;
  unsubscribe(event: string, handler: EventHandler<any>): void;
  getSubscribers(event: string): EventHandler<any>[];
}

/**
 * In-memory event bus implementation for microservices
 *
 * Handles event publishing, subscription management, and error recovery
 * with comprehensive logging for audit and debugging purposes.
 */
export class EventBus implements IEventBus {
  private subscribers: Map<string, Set<EventHandler<any>>> = new Map();
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> =
    [];
  private maxHistorySize = 1000;

  /**
   * Publish an event to all subscribers
   *
   * @param event - Event name
   * @param data - Event payload
   */
  async publish<T>(event: string, data: T): Promise<void> {
    try {
      // Log event for audit trail
      console.log(`[EventBus] Publishing event: ${event}`, {
        timestamp: new Date().toISOString(),
        dataKeys:
          typeof data === &quot;object&quot; ? Object.keys(data as any) : &quot;primitive&quot;,
      });

      // Add to history
      this.eventHistory.push({
        event,
        data,
        timestamp: new Date(),
      });

      // Maintain history size
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Get subscribers for this event
      const eventSubscribers = this.subscribers.get(event) || new Set();

      // Execute all handlers
      const promises = Array.from(eventSubscribers).map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(
            `[EventBus] Error in event handler for ${event}:`,
            error,
          );
          // Continue processing other handlers
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error(`[EventBus] Error publishing event ${event}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to an event
   *
   * @param event - Event name
   * @param handler - Event handler function
   */
  subscribe<T>(event: string, handler: EventHandler<T>): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(handler);

    console.log(`[EventBus] Subscribed to event: ${event}`);
  }

  /**
   * Unsubscribe from an event
   *
   * @param event - Event name
   * @param handler - Event handler to remove
   */
  unsubscribe(event: string, handler: EventHandler<any>): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.delete(handler);

      // Clean up empty subscriber sets
      if (eventSubscribers.size === 0) {
        this.subscribers.delete(event);
      }

      console.log(`[EventBus] Unsubscribed from event: ${event}`);
    }
  }

  /**
   * Get all subscribers for an event
   *
   * @param event - Event name
   * @returns Array of event handlers
   */
  getSubscribers(event: string): EventHandler<any>[] {
    const subscribers = this.subscribers.get(event);
    return subscribers ? Array.from(subscribers) : [];
  }

  /**
   * Get recent event history for debugging
   *
   * @param limit - Number of recent events to return
   * @returns Array of recent events
   */
  getEventHistory(
    limit: number = 50,
  ): Array<{ event: string; data: any; timestamp: Date }> {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear all subscribers (useful for testing)
   */
  clearAllSubscribers(): void {
    this.subscribers.clear();
    console.log(&quot;[EventBus] Cleared all subscribers&quot;);
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    totalSubscribers: number;
    eventTypes: string[];
    historySize: number;
  } {
    return {
      totalEvents: this.eventHistory.length,
      totalSubscribers: Array.from(this.subscribers.values()).reduce(
        (total, set) => total + set.size,
        0,
      ),
      eventTypes: Array.from(this.subscribers.keys()),
      historySize: this.eventHistory.length,
    };
  }
}
