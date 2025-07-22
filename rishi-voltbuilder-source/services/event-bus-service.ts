// Event Bus Service - Core Microservices Communication
// Follows Event-Driven Architecture Pillar with UUID-based message tracking

import { v4 as uuidv4 } from "uuid";
import { BookingEventType } from "../shared/types/cannabis-booking";

export interface EventMessage {
  id: string; // UUID
  type: string;
  data: any;
  timestamp: Date;
  correlationId: string; // UUID
  source: string;
  version: string;
}

export interface EventHandler {
  id: string; // UUID
  eventType: string;
  handler: (event: EventMessage) => Promise<void>;
}

export class EventBusService {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventStore: EventMessage[] = []; // In production, use Redis or message queue
  private readonly maxEventStoreSize = 10000; // Prevent memory leaks
  private readonly publishTimeout = 5000; // 5 second timeout for handlers
  private isShuttingDown = false;

  constructor() {
    this.initializeEventHandlers();
    this.setupGracefulShutdown();
  }

  // Production-ready event publishing with comprehensive error handling
  async publish(
    eventType: string,
    data: any,
    metadata?: any,
  ): Promise<boolean> {
    if (this.isShuttingDown) {
      console.warn("EventBusService is shutting down, rejecting new events");
      return false;
    }

    try {
      // Validate event data
      if (!eventType || typeof eventType !== "string") {
        throw new Error("Invalid event type provided");
      }

      const event: EventMessage = {
        id: uuidv4(),
        type: eventType,
        data: this.sanitizeEventData(data),
        timestamp: new Date(),
        correlationId: metadata?.correlationId || uuidv4(),
        source: metadata?.source || "unknown",
        version: metadata?.version || "1.0.0",
      };

      // Store event for audit trail with size management
      this.addToEventStore(event);

      // Get handlers for this event type
      const eventHandlers = this.handlers.get(eventType) || [];

      if (eventHandlers.length === 0) {
        console.debug(`No handlers registered for event type: ${eventType}`);
        return true;
      }

      // Execute all handlers with timeout and error isolation
      const promises = eventHandlers.map((handler) =>
        this.executeHandlerSafely(handler, event),
      );

      // Wait for all handlers with results tracking
      const results = await Promise.allSettled(promises);

      const failures = results.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failures > 0) {
        console.warn(
          `${failures}/${results.length} handlers failed for event ${eventType}`,
        );
      }

      return failures === 0;
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
      return false;
    }
  }

  // Execute handler with timeout and error isolation
  private async executeHandlerSafely(
    handler: EventHandler,
    event: EventMessage,
  ): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Handler timeout")),
        this.publishTimeout,
      );
    });

    try {
      await Promise.race([handler.handler(event), timeoutPromise]);
    } catch (error) {
      console.error(
        `Handler ${handler.id} failed for event ${event.type}:`,
        error,
      );
      throw error;
    }
  }

  // Sanitize event data to prevent circular references and excessive size
  private sanitizeEventData(data: any): any {
    try {
      const serialized = JSON.stringify(data);
      if (serialized.length > 100000) {
        // 100KB limit
        console.warn("Event data exceeds size limit, truncating");
        return { ...data, __truncated: true };
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.warn("Event data contains circular references, sanitizing");
      return { __sanitized: true, error: "Circular reference detected" };
    }
  }

  // Manage event store size to prevent memory leaks
  private addToEventStore(event: EventMessage): void {
    this.eventStore.push(event);
    if (this.eventStore.length > this.maxEventStoreSize) {
      this.eventStore.splice(
        0,
        this.eventStore.length - this.maxEventStoreSize,
      );
    }
  }

  // Setup graceful shutdown
  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.log("EventBusService: Graceful shutdown initiated");
      this.isShuttingDown = true;
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }

  // Production-ready event subscription with validation
  async subscribe(eventType: string, handler: EventHandler): Promise<string> {
    if (!eventType || typeof eventType !== "string") {
      throw new Error("Invalid event type for subscription");
    }

    if (!handler || typeof handler.handler !== "function") {
      throw new Error("Invalid handler provided for subscription");
    }

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler);

    console.debug(`Handler ${handler.id} subscribed to ${eventType}`);
    return handler.id;
  }

  // Unsubscribe handler by UUID
  async unsubscribe(eventType: string, handlerId: string): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.findIndex((h) => h.id === handlerId);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Execute handler with error handling
  private async executeHandler(
    handler: EventHandler,
    event: EventMessage,
  ): Promise<void> {
    try {
      await handler.handler(event);
    } catch (error) {
      console.error(
        `Handler ${handler.id} failed for event ${event.type}:`,
        error,
      );
      // In production, implement dead letter queue or retry logic
    }
  }

  // Initialize default event handlers for cannabis booking management
  private initializeEventHandlers(): void {
    // Cannabis booking handlers will be registered dynamically
    console.log(
      "EventBusService initialized - handlers ready for registration",
    );
  }

  // Unsubscribe handler
  async unsubscribe(eventType: string, handlerId: string): Promise<boolean> {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return false;

    const index = handlers.findIndex((h) => h.id === handlerId);
    if (index === -1) return false;

    handlers.splice(index, 1);
    console.debug(`Handler ${handlerId} unsubscribed from ${eventType}`);
    return true;
  }

  // Get event history with pagination and filtering
  async getEventHistory(
    correlationId?: string,
    eventType?: string,
    limit = 100,
    offset = 0,
  ): Promise<EventMessage[]> {
    let events = this.eventStore;

    if (correlationId) {
      events = events.filter((event) => event.correlationId === correlationId);
    }

    if (eventType) {
      events = events.filter((event) => event.type === eventType);
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  // Health check for monitoring
  getHealthStatus(): {
    status: string;
    eventStoreSize: number;
    handlersCount: number;
    isShuttingDown: boolean;
  } {
    return {
      status: this.isShuttingDown ? "shutting_down" : "healthy",
      eventStoreSize: this.eventStore.length,
      handlersCount: Array.from(this.handlers.values()).reduce(
        (sum, handlers) => sum + handlers.length,
        0,
      ),
      isShuttingDown: this.isShuttingDown,
    };
  }
}

// Singleton instance for application-wide use
export const eventBusService = new EventBusService();
