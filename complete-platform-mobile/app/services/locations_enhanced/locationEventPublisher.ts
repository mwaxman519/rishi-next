/**
 * Location Event Publisher
 *
 * Specializes in publishing location-related events to the distributed event bus
 * with enhanced reliability features:
 * - Event correlation and tracking
 * - Configurable event routing
 * - Channel selection (local, HTTP, etc.)
 * - Automatic retry for failed deliveries
 */

import { AppEvent, EventPayload, PayloadFor } from "../../../shared/events";
import { enhancedDistributedEventBus } from "../infrastructure/messaging/distributedEventBus";
import { RetryableEventBus } from "../infrastructure/messaging/retryableEventBus";
import { distributedEventBus } from "../infrastructure/distributedEventBus";

// Location-specific event types
export type LocationEvent =
  | "location.created"
  | "location.updated"
  | "location.deleted"
  | "location.approved"
  | "location.rejected";

// Wrapper that integrates the RetryableEventBus with the DistributedEventBus
export class LocationEventPublisher {
  private retryableBus: RetryableEventBus;

  constructor() {
    // Set up with the distributed event bus as the underlying implementation
    this.retryableBus = new RetryableEventBus(
      enhancedDistributedEventBus,
      undefined,
      {
        processingIntervalMs: 3000, // Process pending messages every 3 seconds
        retryIntervalMs: 30000, // Retry failed messages every 30 seconds
        healthCheckIntervalMs: 300000, // Log health status every 5 minutes
        defaultMaxRetries: 5, // Retry location events up to 5 times
        batchSize: 10, // Process up to 10 messages at a time
        retryBackoffFactor: 2, // Exponential backoff factor
        retryInitialDelayMs: 1000, // Start with 1 second delay
        maxConcurrentProcessing: 3, // Process up to 3 messages concurrently
      },
    );

    // Configure which channels to use for different event types
    this.configureEventChannels();
  }

  /**
   * Configure which channels to use for different location event types
   */
  private configureEventChannels(): void {
    // If we're using the enhanced distributed event bus, configure routing
    if (enhancedDistributedEventBus.configureEventChannels) {
      // Critical events go to both local and HTTP channels
      enhancedDistributedEventBus.configureEventChannels("location.created", [
        "local",
        "http",
      ]);

      enhancedDistributedEventBus.configureEventChannels("location.approved", [
        "local",
        "http",
      ]);

      enhancedDistributedEventBus.configureEventChannels("location.rejected", [
        "local",
        "http",
      ]);

      // Less critical events can stay local for now
      enhancedDistributedEventBus.configureEventChannels("location.updated", [
        "local",
      ]);

      enhancedDistributedEventBus.configureEventChannels("location.deleted", [
        "local",
      ]);
    }
  }

  /**
   * Publish a location event with retry capability
   */
  async publishEvent<E extends LocationEvent>(
    event: E,
    payload: PayloadFor<E>,
    options: {
      immediate?: boolean;
      maxRetries?: number;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    try {
      return await this.retryableBus.publish(event, payload, {
        immediate: options.immediate,
        maxRetries: options.maxRetries,
        metadata: {
          correlationId: options.correlationId || this.generateCorrelationId(),
          serviceName: "location-service",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(`Failed to publish event ${event}:`, error);
      return false;
    }
  }

  /**
   * Publish a location.created event
   */
  async publishLocationCreated(
    payload: PayloadFor<"location.created">,
    options: {
      immediate?: boolean;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    return this.publishEvent("location.created", payload, {
      immediate: options.immediate || true, // Default to immediate for create events
      maxRetries: 5,
      correlationId: options.correlationId,
    });
  }

  /**
   * Publish a location.updated event
   */
  async publishLocationUpdated(
    payload: PayloadFor<"location.updated">,
    options: {
      immediate?: boolean;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    return this.publishEvent("location.updated", payload, {
      immediate: options.immediate,
      maxRetries: 3,
      correlationId: options.correlationId,
    });
  }

  /**
   * Publish a location.deleted event
   */
  async publishLocationDeleted(
    payload: PayloadFor<"location.deleted">,
    options: {
      immediate?: boolean;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    return this.publishEvent("location.deleted", payload, {
      immediate: options.immediate || true, // Default to immediate for delete events
      maxRetries: 4,
      correlationId: options.correlationId,
    });
  }

  /**
   * Publish a location.approved event
   */
  async publishLocationApproved(
    payload: PayloadFor<"location.approved">,
    options: {
      immediate?: boolean;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    return this.publishEvent("location.approved", payload, {
      immediate: options.immediate || true, // Default to immediate for approval events
      maxRetries: 5,
      correlationId: options.correlationId,
    });
  }

  /**
   * Publish a location.rejected event
   */
  async publishLocationRejected(
    payload: PayloadFor<"location.rejected">,
    options: {
      immediate?: boolean;
      correlationId?: string;
    } = {},
  ): Promise<boolean> {
    return this.publishEvent("location.rejected", payload, {
      immediate: options.immediate || true, // Default to immediate for rejection events
      maxRetries: 5,
      correlationId: options.correlationId,
    });
  }

  /**
   * Generate a correlation ID for event tracking
   */
  private generateCorrelationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get the current status of the underlying event bus
   */
  getStatus(): Record<string, any> {
    return this.retryableBus.getStatus();
  }

  /**
   * Pause event processing (for maintenance periods)
   */
  pauseProcessing(): void {
    this.retryableBus.pauseProcessing();
  }

  /**
   * Resume event processing
   */
  resumeProcessing(): void {
    this.retryableBus.resumeProcessing();
  }
}

// Export a singleton instance
export const locationEventPublisher = new LocationEventPublisher();
