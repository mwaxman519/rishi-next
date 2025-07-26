import { config } from "../config/environment";

/**
 * Event Bus Adapter interface
 * This interface defines the contract for different event bus implementations
 */
export interface EventBusAdapter {
  publish(eventName: string, data: any): Promise<void>;
  subscribe(
    eventName: string,
    callback: (data: any) => void | Promise<void>,
  ): () => void;
  hasSubscribers(eventName: string): boolean;
  clearEvent(eventName: string): void;
  clearAllEvents(): void;
}

/**
 * In-memory event bus implementation for local development
 */
export class InMemoryEventBusAdapter implements EventBusAdapter {
  private events: Map<string, Array<(data: any) => void | Promise<void>>> =
    new Map();

  async publish(eventName: string, data: any): Promise<void> {
    const callbacks = this.systemEvents.get(eventName) || [];

    console.log(`Event published: ${eventName}`, {
      details: typeof data === "object" ? JSON.stringify(data) : data,
      subscribers: callbacks.length,
    });

    await Promise.all(
      callbacks.map(async (callback) => {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      }),
    );
  }

  subscribe(
    eventName: string,
    callback: (data: any) => void | Promise<void>,
  ): () => void {
    const callbacks = this.systemEvents.get(eventName) || [];
    callbacks.push(callback);
    this.systemEvents.set(eventName, callbacks);

    return () => {
      const callbacks = this.systemEvents.get(eventName) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.systemEvents.set(eventName, callbacks);
      }
    };
  }

  hasSubscribers(eventName: string): boolean {
    const callbacks = this.systemEvents.get(eventName) || [];
    return callbacks.length > 0;
  }

  clearEvent(eventName: string): void {
    this.systemEvents.delete(eventName);
  }

  clearAllEvents(): void {
    this.systemEvents.clear();
  }
}

/**
 * Serverless-compatible event bus that uses Azure Service Bus
 * This implementation would be used in production
 */
export class AzureServiceBusAdapter implements EventBusAdapter {
  // In a real implementation, this would connect to Azure Service Bus
  // For now, we'll use a stub implementation that logs events

  async publish(eventName: string, data: any): Promise<void> {
    console.log(`[AZURE] Publishing event ${eventName} to Azure Service Bus`, {
      details: typeof data === "object" ? JSON.stringify(data) : data,
    });

    // In production, this would publish the event to Azure Service Bus
    // await serviceBusClient.sendMessage(eventName, data);

    // For now, we'll fall back to local callbacks for development
    const callbacks = this.localSubscribers.get(eventName) || [];
    await Promise.all(
      callbacks.map(async (callback) => {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      }),
    );
  }

  // Local subscribers for development
  private localSubscribers: Map<
    string,
    Array<(data: any) => void | Promise<void>>
  > = new Map();

  subscribe(
    eventName: string,
    callback: (data: any) => void | Promise<void>,
  ): () => void {
    // In production, this would register a handler with Azure Service Bus
    console.log(
      `[AZURE] Subscribing to event ${eventName} from Azure Service Bus`,
    );

    // For now, we'll store the callback locally for development
    const callbacks = this.localSubscribers.get(eventName) || [];
    callbacks.push(callback);
    this.localSubscribers.set(eventName, callbacks);

    return () => {
      const callbacks = this.localSubscribers.get(eventName) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.localSubscribers.set(eventName, callbacks);
      }
    };
  }

  hasSubscribers(eventName: string): boolean {
    const callbacks = this.localSubscribers.get(eventName) || [];
    return callbacks.length > 0;
  }

  clearEvent(eventName: string): void {
    this.localSubscribers.delete(eventName);
  }

  clearAllEvents(): void {
    this.localSubscribers.clear();
  }
}

/**
 * Factory function to create the appropriate event bus adapter based on environment
 */
export function createEventBusAdapter(): EventBusAdapter {
  // Use the environment configuration to determine the event bus type
  switch (config.eventBusType) {
    case "azure":
      console.log("Creating Azure Service Bus adapter for event bus");
      return new AzureServiceBusAdapter();
    case "aws":
      console.log(
        "AWS event bus adapter not yet implemented, falling back to in-memory",
      );
      return new InMemoryEventBusAdapter();
    case "memory":
    default:
      console.log("Creating in-memory adapter for event bus");
      return new InMemoryEventBusAdapter();
  }
}
