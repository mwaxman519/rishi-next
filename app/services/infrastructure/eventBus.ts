/**
 * DEPRECATED: Use AdvancedEventBus instead
 * This file provides backwards compatibility for existing imports
 */

// Define the app events and their payload types
export type AppEvent =
  | &quot;availability.created&quot;
  | &quot;availability.updated&quot;
  | &quot;availability.deleted&quot;
  | &quot;user.created&quot;
  | &quot;user.updated&quot;
  | &quot;booking.created&quot;
  | &quot;booking.updated&quot;
  | &quot;booking.cancelled&quot;;

// Define the payload types for each event
export interface EventPayload {
  &quot;availability.created&quot;: {
    id: number;
    userId: number;
    startDate: Date | string;
    endDate: Date | string;
    recurring?: boolean;
  };
  &quot;availability.updated&quot;: {
    id: number;
    userId: number;
    startDate?: Date | string;
    endDate?: Date | string;
    recurring?: boolean;
  };
  &quot;availability.deleted&quot;: {
    id: number;
    userId: number;
  };
  &quot;user.created&quot;: {
    id: number;
    username: string;
    role: string;
  };
  &quot;user.updated&quot;: {
    id: number;
    username?: string;
    role?: string;
  };
  &quot;booking.created&quot;: {
    id: number;
    userId: number;
    agentId: number;
    startTime: Date | string;
    endTime: Date | string;
  };
  &quot;booking.updated&quot;: {
    id: number;
    startTime?: Date | string;
    endTime?: Date | string;
    status?: string;
  };
  &quot;booking.cancelled&quot;: {
    id: number;
    reason?: string;
  };
}

// Define the publisher interface
export interface EventPublisher {
  publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<boolean>;
}

// Define the subscriber interface
export interface EventSubscriber {
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void;

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void;
}

/**
 * LocalEventBus implementation
 *
 * Handles events locally using Node.js EventEmitter.
 * This is the current implementation used in our modular monolith.
 */
export class LocalEventBus implements EventPublisher, EventSubscriber {
  private emitter = new EventEmitter();

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<boolean> {
    try {
      // Process payload for proper serialization
      const processedPayload = { ...payload };

      // Handle Date objects in availability events
      if (
        event === &quot;availability.created&quot; ||
        event === &quot;availability.updated&quot;
      ) {
        // Safe type checking before accessing properties
        const availabilityPayload = processedPayload as any;
        if (
          availabilityPayload &&
          &quot;startDate&quot; in availabilityPayload &&
          availabilityPayload.startDate instanceof Date
        ) {
          availabilityPayload.startDate =
            availabilityPayload.startDate.toISOString();
        }
        if (
          availabilityPayload &&
          &quot;endDate&quot; in availabilityPayload &&
          availabilityPayload.endDate instanceof Date
        ) {
          availabilityPayload.endDate =
            availabilityPayload.endDate.toISOString();
        }
      }

      return this.emitter.emit(event, processedPayload);
    } catch (error) {
      console.error(`Error publishing event ${String(event)}:`, error);
      return false;
    }
  }

  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void {
    this.emitter.on(event, handler);
  }

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void {
    this.emitter.off(event, handler);
  }
}

// Export all required constants
export const APP_EVENTS: AppEvent[] = [
  &quot;availability.created&quot;,
  &quot;availability.updated&quot;,
  &quot;availability.deleted&quot;,
  &quot;user.created&quot;,
  &quot;user.updated&quot;,
  &quot;booking.created&quot;,
  &quot;booking.updated&quot;,
  &quot;booking.cancelled&quot;,
];

// Re-export the advanced event bus for backwards compatibility
export { advancedEventBus as distributedEventBus } from &quot;./AdvancedEventBus&quot;;
