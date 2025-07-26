import { v4 as uuidv4 } from "uuid";
import { AppEvent, Event, PublishResult } from "./eventTypes";

/**
 * CircuitBreaker for handling fault tolerance in distributed systems
 * Implements the Circuit Breaker pattern to prevent cascading failures
 */
export class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;

  constructor(failureThreshold = 5, resetTimeout = 30000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.state === "HALF_OPEN" ||
      this.failureCount >= this.failureThreshold
    ) {
      this.state = "OPEN";
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }
}

/**
 * EventSubscriber interface for components that need to subscribe to events
 */
export interface EventSubscriber {
  handleEvent<T>(event: Event<T>): Promise<void>;
  getSubscribedEvents(): (AppEvent | string)[];
}

/**
 * DistributedEventBus implementation
 * Handles event publishing and subscription with fault tolerance
 */
export class DistributedEventBus {
  private subscribers: Map<string, EventSubscriber[]> = new Map();
  private circuitBreaker: CircuitBreaker;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.circuitBreaker = new CircuitBreaker();
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Subscribe to an event
   * @param subscriber The component that will handle the event
   */
  subscribe(subscriber: EventSubscriber): void {
    const events = subscriber.getSubscribedEvents();

    for (const eventType of events) {
      if (!this.subscribers.has(eventType)) {
        this.subscribers.set(eventType, []);
      }

      const existingSubscribers = this.subscribers.get(eventType)!;
      if (!existingSubscribers.includes(subscriber)) {
        existingSubscribers.push(subscriber);
      }
    }
  }

  /**
   * Unsubscribe from an event
   * @param subscriber The component to unsubscribe
   * @param eventType Optional specific event to unsubscribe from
   */
  unsubscribe(
    subscriber: EventSubscriber,
    eventType?: AppEvent | string,
  ): void {
    if (eventType) {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        this.subscribers.set(
          eventType,
          subscribers.filter((s) => s !== subscriber),
        );
      }
    } else {
      // Unsubscribe from all events
      for (const [type, subscribers] of this.subscribers.entries()) {
        this.subscribers.set(
          type,
          subscribers.filter((s) => s !== subscriber),
        );
      }
    }
  }

  /**
   * Publish an event with retry and circuit breaker patterns
   * @param eventType The type of event
   * @param payload The event data
   * @param metadata Optional metadata
   * @returns Promise with publishing results
   */
  async publish<T>(
    eventType: AppEvent | string,
    payload: T,
    metadata?: Record<string, any>,
  ): Promise<PublishResult> {
    const event: Event<T> = {
      id: uuidv4(),
      type: eventType,
      timestamp: new Date().toISOString(),
      producer: "application",
      payload,
      metadata,
    };

    console.log(`[EventBus] Publishing event: ${eventType}`, {
      eventId: event.id,
    });

    const errors: Record<string, Error> = {};
    let success = true;

    try {
      const subscribers = this.subscribers.get(eventType) || [];

      if (subscribers.length === 0) {
        console.log(`[EventBus] No subscribers for event: ${eventType}`);
        return {
          success: true,
          eventId: event.id,
          errors: {},
        };
      }

      // Execute all subscribers with circuit breaker and retry
      await Promise.all(
        subscribers.map(async (subscriber) => {
          try {
            await this.executeWithRetry(
              async () => {
                await this.circuitBreaker.execute(async () => {
                  await subscriber.handleEvent(event);
                });
              },
              eventType as string,
              event.id,
            );
          } catch (error) {
            success = false;
            if (error instanceof Error) {
              errors[subscriber.constructor.name] = error;
            } else {
              errors[subscriber.constructor.name] = new Error(String(error));
            }
          }
        }),
      );

      return {
        success,
        eventId: event.id,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(`[EventBus] Error publishing event ${eventType}:`, error);

      if (error instanceof Error) {
        errors["eventBus"] = error;
      } else {
        errors["eventBus"] = new Error(String(error));
      }

      return {
        success: false,
        eventId: event.id,
        errors,
      };
    }
  }

  /**
   * Execute an operation with retry logic
   * @param operation The async operation to execute
   * @param eventType The type of event being processed (for error handling)
   * @param eventId The ID of the event being processed (for tracking)
   * @returns Promise with the operation result
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    eventType?: string,
    eventId?: string,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(
          `[EventBus] Retry attempt ${attempt + 1} failed for event ${eventType || "unknown"} (${eventId || "unknown"}):`,
          error,
        );

        // On last attempt, we should integrate with our error handling strategies
        if (attempt === this.maxRetries - 1 && eventType) {
          console.log(
            `[EventBus] Last retry attempt failed for event ${eventType} (${eventId || "unknown"})`,
          );

          // In the future, we would integrate with the ErrorHandler here
          // For example, by accessing it through a global registry or dependency injection
          // For now, we just provide a central point for adding this functionality later
        }

        if (attempt < this.maxRetries - 1) {
          // Exponential backoff with jitter
          const delay =
            this.retryDelay *
            Math.pow(2, attempt) *
            (0.5 + Math.random() * 0.5);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Reset the circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Get the current circuit breaker state
   */
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }
}

// Create a singleton instance of the event bus
export const eventBus = new DistributedEventBus();

// Export a simple function for publishing events to make usage easier
export async function publishEvent<T>(
  eventType: AppEvent | string,
  payload: T,
  metadata?: Record<string, any>,
): Promise<PublishResult> {
  return eventBus.publish(eventType, payload, metadata);
}
