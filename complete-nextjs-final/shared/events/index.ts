/**
 * Event Bus System
 * Simple event management for application-wide event handling
 */

interface EventListener {
  (data?: any): void;
}

class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Import the actual eventBusService
import { eventBusService } from "../../services/event-bus-service";

// Create a singleton instance
const eventBusInstance = new EventBus();

// Export for compatibility
export { eventBusInstance as eventBus };
export { eventBusService };

// Event types for type safety
export enum EventTypes {
  USER_CREATED = "user:created",
  USER_UPDATED = "user:updated",
  USER_DELETED = "user:deleted",
  ORGANIZATION_CREATED = "organization:created",
  ORGANIZATION_UPDATED = "organization:updated",
  PERMISSION_CHANGED = "permission:changed",
  ROLE_ASSIGNED = "role:assigned",
}

export type { EventListener };
export { EventBus };
