/**
 * Error Handling Strategies for Event Bus
 *
 * This module provides various error handling strategies for handling
 * failures in event processing and message delivery.
 */

import { AppEvent } from "./eventTypes";

/**
 * Error handling strategy interface
 */
export interface ErrorHandlingStrategy {
  /**
   * Handle an error that occurred during event processing
   * @param error The error that occurred
   * @param eventType The type of event that was being processed
   * @param context Additional context information
   * @returns True if error was handled, false otherwise
   */
  handleError(
    error: Error,
    eventType: AppEvent,
    context: Record<string, any>,
  ): Promise<boolean>;

  /**
   * Get the list of event types this strategy applies to
   */
  getApplicableEvents(): (AppEvent | string)[];
}

/**
 * Retry with exponential backoff strategy
 */
export class RetryStrategy implements ErrorHandlingStrategy {
  private maxRetries: number;
  private initialDelay: number;
  private retryAttempts: Map<string, number> = new Map();

  constructor(maxRetries = 3, initialDelay = 1000) {
    this.maxRetries = maxRetries;
    this.initialDelay = initialDelay;
  }

  async handleError(
    error: Error,
    eventType: AppEvent,
    context: Record<string, any>,
  ): Promise<boolean> {
    const eventId = context.eventId || "unknown";
    const key = `${eventType}-${eventId}`;

    // Get current retry count
    const currentRetries = this.retryAttempts.get(key) || 0;

    if (currentRetries >= this.maxRetries) {
      console.log(
        `[RetryStrategy] Max retries (${this.maxRetries}) exceeded for event ${eventType} (${eventId})`,
      );
      return false; // Can't handle this error anymore
    }

    // Calculate delay with exponential backoff and jitter
    const delay =
      this.initialDelay *
      Math.pow(2, currentRetries) *
      (0.75 + Math.random() * 0.5);

    console.log(
      `[RetryStrategy] Retrying event ${eventType} (${eventId}) in ${delay}ms (attempt ${currentRetries + 1}/${this.maxRetries})`,
    );

    // Update retry count
    this.retryAttempts.set(key, currentRetries + 1);

    // Wait and then indicate that we handled the error
    await new Promise((resolve) => setTimeout(resolve, delay));
    return true;
  }

  getApplicableEvents(): AppEvent[] {
    // Apply to all event types
    return Object.values(AppEvent);
  }
}

/**
 * Dead Letter Queue strategy
 * Moves failed events to a dead letter queue for later processing
 */
export class DeadLetterQueueStrategy implements ErrorHandlingStrategy {
  private dlq: Map<string, any[]> = new Map();

  async handleError(
    error: Error,
    eventType: AppEvent,
    context: Record<string, any>,
  ): Promise<boolean> {
    const eventId = context.eventId || "unknown";
    const event = context.event;

    if (!event) {
      console.warn(
        `[DeadLetterQueueStrategy] No event provided in context for ${eventType} (${eventId})`,
      );
      return false;
    }

    // Add to the appropriate DLQ
    if (!this.dlq.has(eventType)) {
      this.dlq.set(eventType, []);
    }

    const queue = this.dlq.get(eventType)!;
    queue.push({
      event,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[DeadLetterQueueStrategy] Added event ${eventType} (${eventId}) to dead letter queue`,
    );

    // In a real implementation, we would persist the DLQ to a database
    // For now, just log the DLQ size
    console.log(
      `[DeadLetterQueueStrategy] DLQ size for ${eventType}: ${queue.length}`,
    );

    return true;
  }

  getApplicableEvents(): AppEvent[] {
    // Apply only to specific events
    return [
      AppEvent.LOCATION_CREATED,
      AppEvent.LOCATION_UPDATED,
      AppEvent.LOCATION_DELETED,
      AppEvent.LOCATION_APPROVED,
      AppEvent.LOCATION_REJECTED,
    ];
  }

  /**
   * Get all events from the DLQ for a specific event type
   */
  getEvents(eventType: AppEvent): any[] {
    return this.dlq.get(eventType) || [];
  }

  /**
   * Reprocess an event from the DLQ
   */
  removeEvent(eventType: AppEvent, eventId: string): boolean {
    const queue = this.dlq.get(eventType);
    if (!queue) return false;

    const initialLength = queue.length;
    this.dlq.set(
      eventType,
      queue.filter((item) => item.event.id !== eventId),
    );

    return this.dlq.get(eventType)!.length < initialLength;
  }

  /**
   * Clear all events from the DLQ for a specific event type
   */
  clearEvents(eventType: AppEvent): void {
    this.dlq.set(eventType, []);
  }
}

/**
 * Notification strategy
 * Sends notifications about failed events
 */
export class NotificationStrategy implements ErrorHandlingStrategy {
  // In a real implementation, this would be replaced with actual notification services
  private notifyAdmins: (message: string, context: any) => Promise<void>;

  constructor() {
    // Mock implementation
    this.notifyAdmins = async (message, context) => {
      console.log(
        `[NotificationStrategy] ADMIN NOTIFICATION: ${message}`,
        context,
      );
    };
  }

  async handleError(
    error: Error,
    eventType: AppEvent,
    context: Record<string, any>,
  ): Promise<boolean> {
    const eventId = context.eventId || "unknown";
    const severity = this.getSeverity(eventType);

    // Only send notifications for important events
    if (severity === "high") {
      await this.notifyAdmins(
        `Critical event processing failure: ${eventType} (${eventId})`,
        {
          error: error.message,
          eventType,
          eventId,
          timestamp: new Date().toISOString(),
        },
      );
    }

    // This strategy doesn't actually handle the error, it just notifies about it
    return false;
  }

  getApplicableEvents(): AppEvent[] {
    // Apply to critical events only
    return [
      AppEvent.LOCATION_APPROVED,
      AppEvent.LOCATION_REJECTED,
      AppEvent.SYSTEM_ERROR,
    ];
  }

  private getSeverity(eventType: AppEvent): "low" | "medium" | "high" {
    switch (eventType) {
      case AppEvent.SYSTEM_ERROR:
        return "high";
      case AppEvent.LOCATION_APPROVED:
      case AppEvent.LOCATION_REJECTED:
        return "medium";
      default:
        return "low";
    }
  }
}

// Create singleton instances
export const retryStrategy = new RetryStrategy();
export const deadLetterQueueStrategy = new DeadLetterQueueStrategy();
export const notificationStrategy = new NotificationStrategy();

// Export a function to register all strategies
export function registerErrorHandlingStrategies(errorHandler: any): void {
  errorHandler.registerStrategy(retryStrategy);
  errorHandler.registerStrategy(deadLetterQueueStrategy);
  errorHandler.registerStrategy(notificationStrategy);
}
