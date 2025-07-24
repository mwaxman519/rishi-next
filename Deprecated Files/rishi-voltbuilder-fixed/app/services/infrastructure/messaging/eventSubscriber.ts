/**
 * Event Subscriber System
 *
 * Provides a mechanism for services to register and receive events
 * with advanced features such as:
 * - Automatic recovery from subscriber failures
 * - Batch processing of events
 * - Filtering of events
 * - Delayed event processing
 */

import { AppEvent, EventPayload } from "../../../../shared/events";
import { EventSubscriber } from "../distributedEventBus";

// Subscription options for fine-tuning subscriber behavior
export interface SubscriptionOptions {
  // Buffer events for batch processing
  batchSize?: number;
  batchTimeoutMs?: number;

  // Filter events based on payload content
  filter?: <E extends AppEvent>(event: E, payload: EventPayload[E]) => boolean;

  // Process events with a delay
  delayMs?: number;

  // Error handling
  retryCount?: number;
  retryDelayMs?: number;
  retryBackoffFactor?: number;

  // Subscription metadata
  description?: string;
  tags?: string[];
}

// Handler for processing events, can be async
export type EventHandler<E extends AppEvent> = (
  payload: EventPayload[E],
  metadata?: EventMetadata,
) => void | Promise<void>;

// Batch handler for processing multiple events at once
export type BatchEventHandler<E extends AppEvent> = (
  payloads: EventPayload[E][],
  metadata?: BatchEventMetadata,
) => void | Promise<void>;

// Metadata provided to event handlers
export interface EventMetadata {
  eventTime: Date;
  receivedTime: Date;
  processingDelay: number; // in milliseconds
  retryCount: number;
}

// Metadata for batch processing
export interface BatchEventMetadata extends EventMetadata {
  batchSize: number;
  batchStartTime: Date;
  batchEndTime: Date;
}

// Subscription record for tracking subscribers
interface Subscription<E extends AppEvent> {
  id: string;
  event: E;
  handler: EventHandler<E> | BatchEventHandler<E>;
  options: SubscriptionOptions;
  isBatchHandler: boolean;
  active: boolean;
  batchBuffer?: EventPayload[E][];
  batchTimeout?: NodeJS.Timeout;
  createdAt: Date;
  lastInvoked?: Date;
  errorCount: number;
  lastError?: Error;
}

/**
 * AdvancedEventSubscriber
 *
 * Enhances the basic event subscription system with:
 * - Robust error handling
 * - Batch processing
 * - Event filtering
 * - Subscription management
 */
export class AdvancedEventSubscriber<E extends AppEvent = AppEvent> {
  private eventBus: EventSubscriber;
  private subscriptions: Map<string, Subscription<any>> = new Map();
  private subscriptionsByEvent: Map<E, Set<string>> = new Map();

  constructor(eventBus: EventSubscriber) {
    this.eventBus = eventBus;
  }

  /**
   * Subscribe to a specific event type
   *
   * @param event The event type to subscribe to
   * @param handler The function to handle events
   * @param options Options to customize subscription behavior
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribe(
    event: E,
    handler: EventHandler<E>,
    options: SubscriptionOptions = {},
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const subscription: Subscription<E> = {
      id: subscriptionId,
      event,
      handler,
      options,
      isBatchHandler: false,
      active: true,
      created_at: new Date(),
      errorCount: 0,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Add to event index
    if (!this.subscriptionsByEvent.has(event)) {
      this.subscriptionsByEvent.set(event, new Set());
    }
    this.subscriptionsByEvent.get(event)?.add(subscriptionId);

    // Register with underlying event bus
    this.eventBus.subscribe(event, (payload) =>
      this.handleEvent(event, payload, subscriptionId),
    );

    return subscriptionId;
  }

  /**
   * Subscribe to a specific event type with batch processing
   *
   * @param event The event type to subscribe to
   * @param handler The function to handle batches of events
   * @param options Options to customize subscription behavior (must include batchSize)
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribeBatch(
    event: E,
    handler: BatchEventHandler<E>,
    options: SubscriptionOptions = { batchSize: 10, batchTimeoutMs: 5000 },
  ): string {
    if (!options.batchSize || options.batchSize < 1) {
      throw new Error("Batch size must be at least 1");
    }

    const subscriptionId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const subscription: Subscription<E> = {
      id: subscriptionId,
      event,
      handler,
      options,
      isBatchHandler: true,
      active: true,
      batchBuffer: [],
      created_at: new Date(),
      errorCount: 0,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Add to event index
    if (!this.subscriptionsByEvent.has(event)) {
      this.subscriptionsByEvent.set(event, new Set());
    }
    this.subscriptionsByEvent.get(event)?.add(subscriptionId);

    // Register with underlying event bus
    this.eventBus.subscribe(event, (payload) =>
      this.handleEvent(event, payload, subscriptionId),
    );

    return subscriptionId;
  }

  /**
   * Unsubscribe from a previously registered subscription
   *
   * @param subscriptionId The ID returned from subscribe or subscribeBatch
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      console.warn(`Subscription ${subscriptionId} not found`);
      return;
    }

    // Clean up batch timeout if exists
    if (subscription.batchTimeout) {
      clearTimeout(subscription.batchTimeout);
      subscription.batchTimeout = undefined;
    }

    // Process any remaining batched events
    this.processBatchIfNeeded(subscription);

    // Mark as inactive (but keep for historical tracking)
    subscription.active = false;

    // Remove from event index
    this.subscriptionsByEvent.get(subscription.event)?.delete(subscriptionId);

    // Clean up the event set if empty
    if (this.subscriptionsByEvent.get(subscription.event)?.size === 0) {
      this.subscriptionsByEvent.delete(subscription.event);
    }

    // Note: We don't unsubscribe from the underlying event bus because
    // there might be other subscribers for the same event type
  }

  /**
   * Handle an event for a specific subscription
   */
  private async handleEvent<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    subscriptionId: string,
  ): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription || !subscription.active) {
      return;
    }

    // Apply filter if specified
    if (
      subscription.options.filter &&
      !subscription.options.filter(event, payload)
    ) {
      return;
    }

    // For batch handlers, buffer the event
    if (subscription.isBatchHandler) {
      subscription.batchBuffer = subscription.batchBuffer || [];
      subscription.batchBuffer.push(payload);

      // Process batch if it's at the threshold size
      if (
        subscription.batchBuffer.length >=
        (subscription.options.batchSize || 10)
      ) {
        this.processBatch(subscription);
      }
      // Or set/reset a timeout to process the batch after the timeout period
      else if (
        subscription.options.batchTimeoutMs &&
        !subscription.batchTimeout
      ) {
        subscription.batchTimeout = setTimeout(() => {
          this.processBatch(subscription);
        }, subscription.options.batchTimeoutMs);
      }

      return;
    }

    // For regular handlers, process with delay if specified
    if (subscription.options.delayMs && subscription.options.delayMs > 0) {
      setTimeout(() => {
        this.processEvent(subscription, payload);
      }, subscription.options.delayMs);
    } else {
      await this.processEvent(subscription, payload);
    }
  }

  /**
   * Process a single event
   */
  private async processEvent<E extends AppEvent>(
    subscription: Subscription<E>,
    payload: EventPayload[E],
  ): Promise<void> {
    try {
      // Create metadata for the handler
      const metadata: EventMetadata = {
        eventTime: new Date(), // Ideally this would come from the event itself
        receivedTime: new Date(),
        processingDelay: 0, // Calculate actual delay if needed
        retryCount: 0,
      };

      // Invoke the handler
      subscription.lastInvoked = new Date();
      await (subscription.handler as EventHandler<E>)(payload, metadata);
    } catch (error) {
      subscription.errorCount++;
      subscription.lastError =
        error instanceof Error ? error : new Error(String(error));

      console.error(
        `Error in event handler (subscription ${subscription.id}):`,
        error,
      );

      // Retry logic
      if (
        subscription.options.retryCount &&
        subscription.options.retryCount > 0
      ) {
        this.retryEvent(subscription, payload, 0);
      }
    }
  }

  /**
   * Process a batch of events
   */
  private async processBatch<E extends AppEvent>(
    subscription: Subscription<E>,
  ): Promise<void> {
    if (!subscription.batchBuffer || subscription.batchBuffer.length === 0) {
      return;
    }

    // Clear the timeout if it exists
    if (subscription.batchTimeout) {
      clearTimeout(subscription.batchTimeout);
      subscription.batchTimeout = undefined;
    }

    // Create a copy of the current buffer and reset it
    const payloads = [...subscription.batchBuffer];
    subscription.batchBuffer = [];

    // Create metadata for the batch handler
    const metadata: BatchEventMetadata = {
      eventTime: new Date(),
      receivedTime: new Date(),
      processingDelay: 0,
      retryCount: 0,
      batchSize: payloads.length,
      batchStartTime: new Date(),
      batchEndTime: new Date(),
    };

    try {
      // Invoke the batch handler
      subscription.lastInvoked = new Date();
      await (subscription.handler as BatchEventHandler<E>)(payloads, metadata);
    } catch (error) {
      subscription.errorCount++;
      subscription.lastError =
        error instanceof Error ? error : new Error(String(error));

      console.error(
        `Error in batch event handler (subscription ${subscription.id}):`,
        error,
      );

      // Retry individual events rather than the whole batch
      if (
        subscription.options.retryCount &&
        subscription.options.retryCount > 0
      ) {
        for (const payload of payloads) {
          // Reprocess individual events
          this.retryEvent(subscription, payload, 0);
        }
      }
    }
  }

  /**
   * Process a batch if needed (called when unsubscribing)
   */
  private processBatchIfNeeded<E extends AppEvent>(
    subscription: Subscription<E>,
  ): void {
    if (
      subscription.isBatchHandler &&
      subscription.batchBuffer &&
      subscription.batchBuffer.length > 0
    ) {
      this.processBatch(subscription);
    }
  }

  /**
   * Retry processing an event with exponential backoff
   */
  private retryEvent<E extends AppEvent>(
    subscription: Subscription<E>,
    payload: EventPayload[E],
    currentRetry: number,
  ): void {
    // Check if we've exceeded the retry limit
    if (currentRetry >= (subscription.options.retryCount || 0)) {
      console.error(`Retry limit reached for subscription ${subscription.id}`);
      return;
    }

    // Calculate delay with exponential backoff
    const baseDelay = subscription.options.retryDelayMs || 1000;
    const backoffFactor = subscription.options.retryBackoffFactor || 2;
    const delay = baseDelay * Math.pow(backoffFactor, currentRetry);

    // Schedule the retry
    setTimeout(async () => {
      try {
        // Create metadata for the retry
        const metadata: EventMetadata = {
          eventTime: new Date(),
          receivedTime: new Date(),
          processingDelay: delay,
          retryCount: currentRetry + 1,
        };

        // Invoke the handler
        subscription.lastInvoked = new Date();
        await (subscription.handler as EventHandler<E>)(payload, metadata);
      } catch (error) {
        subscription.errorCount++;
        subscription.lastError =
          error instanceof Error ? error : new Error(String(error));

        console.error(
          `Error in retry ${currentRetry + 1} for subscription ${subscription.id}:`,
          error,
        );

        // Schedule another retry
        this.retryEvent(subscription, payload, currentRetry + 1);
      }
    }, delay);
  }

  /**
   * Get subscription details
   */
  getSubscription(
    subscriptionId: string,
  ): Omit<Subscription<any>, "handler"> | undefined {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return undefined;

    // Return a copy without the handler function for safety
    const { handler, ...rest } = subscription;
    return rest;
  }

  /**
   * Get all active subscriptions for a specific event
   */
  getSubscriptionsForEvent(event: E): string[] {
    const subscriptions = this.subscriptionsByEvent.get(event);
    if (!subscriptions) return [];

    return Array.from(subscriptions).filter((id) => {
      const subscription = this.subscriptions.get(id);
      return subscription && subscription.active;
    });
  }

  /**
   * Get all active subscriptions
   */
  getAllSubscriptions(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.active) {
        const { handler, ...details } = subscription;
        result[id] = details;
      }
    }

    return result;
  }

  /**
   * Pause a subscription (temporarily disable it)
   */
  pauseSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
    }
  }

  /**
   * Resume a paused subscription
   */
  resumeSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = true;
    }
  }
}

// Export a singleton instance
export const advancedEventSubscriber = new AdvancedEventSubscriber();
// Replace with distributedEventBus when ready for production
// For now, we'll use it directly from the context it's created
// distributedEventBus
