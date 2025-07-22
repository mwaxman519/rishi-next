/**
 * Event Bus implementation
 * This module provides a simple event bus for publishing and subscribing to events
 * It is used for decoupled communication between components
 */

export interface EventData {
  type: string;
  payload: any;
}

// Event handler type
type EventHandler = (data: EventData) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  // Subscribe to an event
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) {
        handlers.splice(idx, 1);
      }
    };
  }

  // Publish an event
  publish(event: EventData): void {
    const { type } = event;

    if (!this.handlers.has(type)) {
      return;
    }

    const handlers = this.handlers.get(type)!;
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error(`Error in event handler for ${type}:`, err);
      }
    });
  }

  // Clear all handlers
  clear(): void {
    this.handlers.clear();
  }
}

// Export singleton instance
export const eventBus = new EventBus();
