/**
 * DEPRECATED: Use AdvancedEventBus instead
 * This file provides backwards compatibility for existing imports
 */

// Define the app events and their payload types
export type AppEvent =
  | "availability.created"
  | "availability.updated"
  | "availability.deleted"
  | "user.created"
  | "user.updated"
  | "booking.created"
  | "booking.updated"
  | "booking.cancelled";

// Define the payload types for each event
export interface EventPayload {
  "availability.created": {
    id: number;
    userId: number;
    startDate: Date | string;
    endDate: Date | string;
    recurring?: boolean;
  };
  "availability.updated": {
    id: number;
    userId: number;
    startDate?: Date | string;
    endDate?: Date | string;
    recurring?: boolean;
  };
  "availability.deleted": {
    id: number;
    userId: number;
  };
  "user.created": {
    id: number;
    username: string;
    role: string;
  };
  "user.updated": {
    id: number;
    username?: string;
    role?: string;
  };
  "booking.created": {
    id: number;
    userId: number;
    agentId: number;
    startTime: Date | string;
    endTime: Date | string;
  };
  "booking.updated": {
    id: number;
    startTime?: Date | string;
    endTime?: Date | string;
    status?: string;
  };
  "booking.cancelled": {
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
        event === "availability.created" ||
        event === "availability.updated"
      ) {
        // Safe type checking before accessing properties
        const availabilityPayload = processedPayload as any;
        if (
          availabilityPayload &&
          "startDate" in availabilityPayload &&
          availabilityPayload.startDate instanceof Date
        ) {
          availabilityPayload.startDate =
            availabilityPayload.startDate.toISOString();
        }
        if (
          availabilityPayload &&
          "endDate" in availabilityPayload &&
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
  "availability.created",
  "availability.updated",
  "availability.deleted",
  "user.created",
  "user.updated",
  "booking.created",
  "booking.updated",
  "booking.cancelled",
];

// Re-export the advanced event bus for backwards compatibility
export { advancedEventBus as distributedEventBus } from "./AdvancedEventBus";
