/**
 * Distributed Event Bus
 *
 * A simple event bus implementation that can be used across the application
 * for event-driven communication between components.
 */

import { AppEvent, EventPayload, PayloadFor } from "../../../shared/events";

// Event publisher interface
export interface EventPublisher {
  publish<E extends AppEvent>(
    event: E,
    payload: PayloadFor<E>,
    options?: any,
  ): Promise<boolean>;
}

// Event subscriber interface
export interface EventSubscriber {
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: PayloadFor<E>, metadata?: any) => void,
  ): void;
  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: PayloadFor<E>, metadata?: any) => void,
  ): void;
}

// Combined event bus interface
export interface EventBus extends EventPublisher, EventSubscriber {}

/**
 * Simple in-memory event bus implementation
 */
class LocalEventBus implements EventBus {
  private handlers: Map<string, Array<(payload: any, metadata?: any) => void>> =
    new Map();

  /**
   * Publish an event to all subscribers
   *
   * @param event The event type
   * @param payload The event payload
   * @returns Promise resolving to true if published successfully
   */
  async publish<E extends AppEvent>(
    event: E,
    payload: PayloadFor<E>,
    _options?: any,
  ): Promise<boolean> {
    const handlers = this.handlers.get(event) || [];

    const metadata = {
      timestamp: new Date().toISOString(),
      publisher: "local",
    };

    // Call all handlers for this event type
    for (const handler of handlers) {
      try {
        await handler(payload, metadata);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }

    return true;
  }

  /**
   * Subscribe to an event
   *
   * @param event The event type to subscribe to
   * @param handler The function to call when the event occurs
   */
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: PayloadFor<E>, metadata?: any) => void,
  ): void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler as any);
    this.handlers.set(event, handlers);
  }

  /**
   * Unsubscribe from an event
   *
   * @param event The event type to unsubscribe from
   * @param handler The handler function to remove
   */
  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: PayloadFor<E>, metadata?: any) => void,
  ): void {
    const handlers = this.handlers.get(event) || [];
    const index = handlers.indexOf(handler as any);

    if (index !== -1) {
      handlers.splice(index, 1);
      this.handlers.set(event, handlers);
    }
  }
}

// Export the singleton instance of the event bus
export const distributedEventBus = new LocalEventBus();
