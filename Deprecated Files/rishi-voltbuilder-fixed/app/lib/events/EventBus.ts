/**
 * EventBus.ts
 *
 * Implementation of the event bus pattern for the Rishi platform
 * Enables loosely coupled communication between services
 */

// Event handler type definition
export type EventHandler = (payload: any) => void;

/**
 * EventBus class for publishing and subscribing to events
 * This is a singleton to ensure a single event bus instance is used across the application
 */
export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, EventHandler[]>;
  private retryQueues: Map<
    string,
    Array<{ type: string; payload: any; retryCount: number }>
  >;
  private circuitBreakers: Map<
    string,
    { failures: number; lastFailure: Date; isOpen: boolean }
  >;

  // Configuration constants
  private MAX_RETRIES = 3;
  private RETRY_DELAY = 5000; // 5 seconds
  private CIRCUIT_THRESHOLD = 5; // Number of failures before opening circuit
  private CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute

  private constructor() {
    this.subscribers = new Map();
    this.retryQueues = new Map();
    this.circuitBreakers = new Map();
  }

  /**
   * Get the singleton instance of the EventBus
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }

    return EventBus.instance;
  }

  /**
   * Subscribe to an event type
   *
   * @param type The event type to subscribe to
   * @param handler The function to call when an event of this type is published
   * @returns A function to unsubscribe
   */
  public subscribe(type: string, handler: EventHandler): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }

    this.subscribers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publish an event
   *
   * @param type The event type
   * @param payload The event payload
   */
  public publish(type: string, payload: any): void {
    // Check if circuit is open for this event type
    if (this.isCircuitOpen(type)) {
      console.warn(`Circuit open for ${type}. Event dropped.`);
      this.storeForRetry(type, payload);
      return;
    }

    try {
      // Get subscribers for this event type
      const handlers = this.subscribers.get(type) || [];

      // Notify all subscribers
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });

      // Reset failure count on success
      this.resetFailureCount(type);
    } catch (error) {
      console.error(`Error publishing event ${type}:`, error);

      // Increment failure count
      this.incrementFailureCount(type);

      // Store for retry
      this.storeForRetry(type, payload);

      // Check if we should open the circuit
      if (this.shouldOpenCircuit(type)) {
        this.openCircuit(type);

        // Schedule circuit reset
        setTimeout(() => {
          this.resetCircuit(type);
        }, this.CIRCUIT_RESET_TIMEOUT);
      }
    }
  }

  /**
   * Store an event for retry
   */
  private storeForRetry(type: string, payload: any): void {
    if (!this.retryQueues.has(type)) {
      this.retryQueues.set(type, []);
    }

    this.retryQueues.get(type)!.push({
      type,
      payload,
      retryCount: 0,
    });

    // Schedule retry
    setTimeout(() => {
      this.processRetryQueue(type);
    }, this.RETRY_DELAY);
  }

  /**
   * Process the retry queue for an event type
   */
  private processRetryQueue(type: string): void {
    const queue = this.retryQueues.get(type) || [];
    if (queue.length === 0) return;

    // Check if circuit is still open
    if (this.isCircuitOpen(type)) {
      // Reschedule retry
      setTimeout(() => {
        this.processRetryQueue(type);
      }, this.RETRY_DELAY);
      return;
    }

    // Process each item in the queue
    const retries = [...queue];
    this.retryQueues.set(type, []);

    for (const item of retries) {
      if (item.retryCount >= this.MAX_RETRIES) {
        console.error(`Max retries reached for event ${type}. Dropping event.`);
        continue;
      }

      try {
        // Increment retry count
        item.retryCount++;

        // Get subscribers for this event type
        const handlers = this.subscribers.get(type) || [];

        // Notify all subscribers
        handlers.forEach((handler) => {
          try {
            handler(item.payload);
          } catch (error) {
            console.error(
              `Error in event handler for ${type} during retry:`,
              error,
            );
          }
        });

        // Reset failure count on success
        this.resetFailureCount(type);
      } catch (error) {
        console.error(`Error retrying event ${type}:`, error);

        // Increment failure count
        this.incrementFailureCount(type);

        // Add back to retry queue
        if (!this.retryQueues.has(type)) {
          this.retryQueues.set(type, []);
        }
        this.retryQueues.get(type)!.push(item);

        // Check if we should open the circuit
        if (this.shouldOpenCircuit(type)) {
          this.openCircuit(type);

          // Schedule circuit reset
          setTimeout(() => {
            this.resetCircuit(type);
          }, this.CIRCUIT_RESET_TIMEOUT);

          // Stop processing more items
          break;
        }
      }
    }
  }

  /**
   * Check if the circuit is open for an event type
   */
  private isCircuitOpen(type: string): boolean {
    const breaker = this.circuitBreakers.get(type);
    return breaker ? breaker.isOpen : false;
  }

  /**
   * Increment the failure count for an event type
   */
  private incrementFailureCount(type: string): void {
    if (!this.circuitBreakers.has(type)) {
      this.circuitBreakers.set(type, {
        failures: 0,
        lastFailure: new Date(),
        isOpen: false,
      });
    }

    const breaker = this.circuitBreakers.get(type)!;
    breaker.failures++;
    breaker.lastFailure = new Date();
  }

  /**
   * Reset the failure count for an event type
   */
  private resetFailureCount(type: string): void {
    if (this.circuitBreakers.has(type)) {
      const breaker = this.circuitBreakers.get(type)!;
      breaker.failures = 0;
    }
  }

  /**
   * Check if we should open the circuit for an event type
   */
  private shouldOpenCircuit(type: string): boolean {
    const breaker = this.circuitBreakers.get(type);
    return breaker ? breaker.failures >= this.CIRCUIT_THRESHOLD : false;
  }

  /**
   * Open the circuit for an event type
   */
  private openCircuit(type: string): void {
    if (!this.circuitBreakers.has(type)) {
      this.circuitBreakers.set(type, {
        failures: 0,
        lastFailure: new Date(),
        isOpen: false,
      });
    }

    const breaker = this.circuitBreakers.get(type)!;
    breaker.isOpen = true;

    console.warn(`Circuit opened for event type: ${type}`);
  }

  /**
   * Reset the circuit for an event type
   */
  private resetCircuit(type: string): void {
    if (this.circuitBreakers.has(type)) {
      const breaker = this.circuitBreakers.get(type)!;
      breaker.isOpen = false;
      breaker.failures = 0;

      console.info(`Circuit reset for event type: ${type}`);

      // Process any queued events
      this.processRetryQueue(type);
    }
  }
}
