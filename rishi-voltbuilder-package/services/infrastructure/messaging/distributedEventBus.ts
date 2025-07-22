type EventHandler = (data: any) => Promise<void> | void;
type EventUnsubscribe = () => void;

class DistributedEventBus {
  private handlers: Record<string, EventHandler[]> = {};

  subscribe(eventType: string, handler: EventHandler): EventUnsubscribe {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }

    this.handlers[eventType].push(handler);

    return () => {
      if (this.handlers[eventType]) {
        this.handlers[eventType] = this.handlers[eventType].filter(
          (h) => h !== handler,
        );
      }
    };
  }

  async publish(eventType: string, data: any): Promise<void> {
    const handlers = this.handlers[eventType] || [];

    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }
}

export const eventBus = new DistributedEventBus();

// Export publishEvent function for API routes
export const publishEvent = (eventType: string, data: any) => {
  return eventBus.publish(eventType, data);
};
