/**
 * Event bus implementation for the application
 * This is used to publish and subscribe to events across the application
 * It uses an adapter pattern to support both local development and serverless environments
 */
import { createEventBusAdapter, EventBusAdapter } from &quot;./event-bus-adapter&quot;;

/**
 * EventBus class that wraps the adapter implementation
 */
class EventBus {
  private adapter: EventBusAdapter;

  constructor() {
    this.adapter = createEventBusAdapter();
  }

  /**
   * Subscribe to an event
   * @param eventName The name of the event to subscribe to
   * @param callback The callback to execute when the event is published
   * @returns A function to unsubscribe from the event
   */
  subscribe(
    eventName: string,
    callback: (data: any) => void | Promise<void>,
  ): () => void {
    return this.adapter.subscribe(eventName, callback);
  }

  /**
   * Publish an event with data
   * @param eventName The name of the event to publish
   * @param data The data to pass to the subscribers
   */
  async publish(eventName: string, data: any): Promise<void> {
    return this.adapter.publish(eventName, data);
  }

  /**
   * Check if an event has subscribers
   * @param eventName The name of the event to check
   * @returns True if the event has subscribers, false otherwise
   */
  hasSubscribers(eventName: string): boolean {
    return this.adapter.hasSubscribers(eventName);
  }

  /**
   * Clear all subscribers for an event
   * @param eventName The name of the event to clear
   */
  clearEvent(eventName: string): void {
    this.adapter.clearEvent(eventName);
  }

  /**
   * Clear all events and subscribers
   */
  clearAllEvents(): void {
    this.adapter.clearAllEvents();
  }
}

// Create a singleton instance of the event bus
export const eventBus = new EventBus();
