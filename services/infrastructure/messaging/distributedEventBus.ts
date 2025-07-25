// Distributed Event Bus for VoltBuilder compatibility
import { EventType } from './eventTypes';

export class DistributedEventBus {
  private listeners: Map<string, Function[]> = new Map();

  async publish(event: EventType): Promise<void> {
    const listeners = this.listeners.get(event.type) || [];
    
    // Execute all listeners for this event type
    await Promise.all(
      listeners.map(listener => {
        try {
          return listener(event);
        } catch (error) {
          console.warn(`Event listener failed for ${event.type}:`, error);
          return Promise.resolve();
        }
      })
    );
  }

  subscribe(eventType: string, listener: (event: EventType) => void | Promise<void>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  unsubscribe(eventType: string, listener: Function): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  async emit(eventType: string, data: any): Promise<void> {
    const event: EventType = {
      id: `mobile-${Date.now()}`,
      type: eventType as any,
      timestamp: new Date(),
      data
    } as EventType;

    await this.publish(event);
  }
}

// Standalone publishEvent function for compatibility
export async function publishEvent(eventType: string, data: any): Promise<void> {
  const eventBus = new DistributedEventBus();
  await eventBus.emit(eventType, data);
}

export const distributedEventBus = new DistributedEventBus();
export default distributedEventBus;