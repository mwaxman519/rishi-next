/**
 * Retryable Event Bus
 *
 * Extends the standard event bus with reliability features including:
 * - Message persistence
 * - Delivery guarantees
 * - Automatic retry for failed deliveries
 * - Dead letter queue for undeliverable messages
 */

import { AppEvent, EventPayload } from &quot;../../../../shared/events&quot;;
import { EventPublisher, EventSubscriber } from &quot;../distributedEventBus&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;

/**
 * Utility function to split an array into chunks of a specified size
 */
function chunks<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

// Message states
export type MessageState =
  | &quot;pending&quot;
  | &quot;processing&quot;
  | &quot;delivered&quot;
  | &quot;failed&quot;
  | &quot;dead-letter&quot;;

// Message with metadata for tracking
export interface EventMessage<E extends AppEvent = AppEvent> {
  id: string;
  event: E;
  payload: EventPayload[E];
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  state: MessageState;
  lastAttempt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Storage interface for persisting messages
export interface MessageStorage {
  saveMessage<E extends AppEvent>(message: EventMessage<E>): Promise<void>;
  getMessages(state: MessageState, limit?: number): Promise<EventMessage[]>;
  updateMessageState<E extends AppEvent>(
    id: string,
    state: MessageState,
    error?: string,
  ): Promise<void>;
  deleteMessage(id: string): Promise<void>;
}

// In-memory storage implementation (for development)
export class InMemoryMessageStorage implements MessageStorage {
  private messages: EventMessage[] = [];

  async saveMessage<E extends AppEvent>(
    message: EventMessage<E>,
  ): Promise<void> {
    this.messages.push(message);
  }

  async getMessages(state: MessageState, limit = 100): Promise<EventMessage[]> {
    return this.messages.filter((msg) => msg.state === state).slice(0, limit);
  }

  async updateMessageState<E extends AppEvent>(
    id: string,
    state: MessageState,
    error?: string,
  ): Promise<void> {
    const index = this.messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      this.messages[index] = {
        ...this.messages[index],
        state,
        lastAttempt: new Date().toISOString(),
        error,
      };
    }
  }

  async deleteMessage(id: string): Promise<void> {
    const index = this.messages.findIndex((msg) => msg.id === id);
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }
}

// Database-backed storage implementation
// This would use a database table to persist messages
export class DatabaseMessageStorage implements MessageStorage {
  async saveMessage<E extends AppEvent>(
    message: EventMessage<E>,
  ): Promise<void> {
    // In a real implementation, this would store the message in a database
    console.log(
      `[DB] Storing message ${message.id} for event ${message.event}`,
    );
    // Example SQL: INSERT INTO event_messages (id, event, payload, timestamp, retry_count, max_retries, state)
    //              VALUES (?, ?, ?, ?, ?, ?, ?)
  }

  async getMessages(state: MessageState, limit = 100): Promise<EventMessage[]> {
    // In a real implementation, this would query the database
    console.log(`[DB] Fetching ${limit} messages with state ${state}`);
    // Example SQL: SELECT * FROM event_messages WHERE state = ? LIMIT ?
    return [];
  }

  async updateMessageState<E extends AppEvent>(
    id: string,
    state: MessageState,
    error?: string,
  ): Promise<void> {
    // In a real implementation, this would update the message state in the database
    console.log(`[DB] Updating message ${id} to state ${state}`);
    // Example SQL: UPDATE event_messages SET state = ?, last_attempt = NOW(), error = ? WHERE id = ?
  }

  async deleteMessage(id: string): Promise<void> {
    // In a real implementation, this would delete the message from the database
    console.log(`[DB] Deleting message ${id}`);
    // Example SQL: DELETE FROM event_messages WHERE id = ?
  }
}

/**
 * RetryableEventBus
 *
 * Enhances the event bus with reliability features:
 * - Each event is wrapped in a message with metadata
 * - Messages are persisted to storage
 * - Failed deliveries are automatically retried with exponential backoff
 * - Undeliverable messages go to a dead letter queue
 * - Supports batch processing of messages
 * - Advanced error handling and logging
 */
export class RetryableEventBus implements EventPublisher, EventSubscriber {
  private storage: MessageStorage;
  private underlyingBus: EventPublisher & EventSubscriber;
  private processingInterval: NodeJS.Timeout | null = null;
  private retryInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private stats: {
    processedCount: number;
    successCount: number;
    failureCount: number;
    retryCount: number;
    deadLetterCount: number;
    lastProcessedTimestamp?: string;
  } = {
    processedCount: 0,
    successCount: 0,
    failureCount: 0,
    retryCount: 0,
    deadLetterCount: 0,
  };

  constructor(
    bus: EventPublisher & EventSubscriber,
    storage: MessageStorage = new InMemoryMessageStorage(),
    private config: {
      processingIntervalMs: number;
      retryIntervalMs: number;
      healthCheckIntervalMs: number;
      defaultMaxRetries: number;
      batchSize: number;
      retryBackoffFactor: number;
      retryInitialDelayMs: number;
      maxConcurrentProcessing: number;
    } = {
      processingIntervalMs: 5000,
      retryIntervalMs: 60000,
      healthCheckIntervalMs: 300000, // 5 minutes
      defaultMaxRetries: 3,
      batchSize: 10,
      retryBackoffFactor: 2,
      retryInitialDelayMs: 1000,
      maxConcurrentProcessing: 5,
    },
  ) {
    this.underlyingBus = bus;
    this.storage = storage;

    // Start processing and retry timers
    this.startProcessing();
    this.startRetrying();
    this.startHealthCheck();
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(async () => {
      if (!this.paused) {
        try {
          await this.processMessages();
        } catch (error) {
          console.error(&quot;Error in message processing loop:&quot;, error);
        }
      }
    }, this.config.processingIntervalMs);
  }

  private startRetrying(): void {
    this.retryInterval = setInterval(async () => {
      if (!this.paused) {
        try {
          await this.retryFailedMessages();
        } catch (error) {
          console.error(&quot;Error in message retry loop:&quot;, error);
        }
      }
    }, this.config.retryIntervalMs);
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.logHealthStatus();
    }, this.config.healthCheckIntervalMs);
  }

  private logHealthStatus(): void {
    const now = new Date().toISOString();
    console.log(`[RetryableEventBus] Health status at ${now}:`, {
      ...this.stats,
      isProcessingPaused: this.paused,
    });
  }

  private async processMessages(): Promise<void> {
    // Get pending messages from storage
    const messages = await this.storage.getMessages(
      &quot;pending&quot;,
      this.config.batchSize,
    );

    if (messages.length === 0) {
      return; // Nothing to process
    }

    // Process messages in parallel with concurrency limit
    const processChunks = chunks(messages, this.config.maxConcurrentProcessing);

    for (const chunk of processChunks) {
      await Promise.all(chunk.map((message) => this.processMessage(message)));
    }

    this.stats.lastProcessedTimestamp = new Date().toISOString();
  }

  private async processMessage(message: EventMessage): Promise<void> {
    // Mark as processing
    await this.storage.updateMessageState(message.id, &quot;processing&quot;);
    this.stats.processedCount++;

    try {
      // Attempt to publish to underlying bus
      const success = await this.underlyingBus.publish(
        message.event,
        message.payload,
        { retry: false }, // Prevent the underlying bus from also retrying
      );

      if (success) {
        // If successful, mark as delivered and remove from storage
        await this.storage.updateMessageState(message.id, &quot;delivered&quot;);
        await this.storage.deleteMessage(message.id);
        this.stats.successCount++;
      } else {
        // If unsuccessful, mark as failed
        await this.storage.updateMessageState(
          message.id,
          &quot;failed&quot;,
          &quot;Publishing failed - received false from bus&quot;,
        );
        this.stats.failureCount++;
      }
    } catch (error) {
      // If exception, mark as failed with error
      this.stats.failureCount++;
      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error);

      await this.storage.updateMessageState(message.id, &quot;failed&quot;, errorMessage);

      console.error(
        `Error processing message ${message.id} for event ${message.event}:`,
        errorMessage,
      );
    }
  }

  private async retryFailedMessages(): Promise<void> {
    // Get failed messages from storage
    const failedMessages = await this.storage.getMessages(&quot;failed&quot;);

    if (failedMessages.length === 0) {
      return; // Nothing to retry
    }

    // Process each failed message with exponential backoff
    for (const message of failedMessages) {
      // Calculate if enough time has passed for this retry attempt
      const lastAttemptTime = message.lastAttempt
        ? new Date(message.lastAttempt).getTime()
        : 0;

      const backoffMs = this.calculateBackoffDelay(message.retryCount);
      const now = Date.now();

      // Skip if not enough time has elapsed since the last attempt
      if (now - lastAttemptTime < backoffMs) {
        continue;
      }

      if (message.retryCount >= message.maxRetries) {
        // If max retries reached, move to dead letter queue
        await this.storage.updateMessageState(
          message.id,
          &quot;dead-letter&quot;,
          `Max retries (${message.maxRetries}) exceeded`,
        );
        this.stats.deadLetterCount++;
        console.error(
          `Message ${message.id} for event ${message.event} moved to dead letter queue after ${message.retryCount} attempts`,
        );
      } else {
        // Otherwise, update retry count and return to pending state
        const updatedMessage: EventMessage = {
          ...message,
          retryCount: message.retryCount + 1,
          state: &quot;pending&quot;,
          lastAttempt: new Date().toISOString(),
        };

        await this.storage.saveMessage(updatedMessage);
        this.stats.retryCount++;

        const nextBackoff = this.calculateBackoffDelay(
          updatedMessage.retryCount,
        );
        console.log(
          `Retrying message ${message.id} for event ${message.event}, ` +
            `attempt ${updatedMessage.retryCount} of ${message.maxRetries} ` +
            `(next retry in ${Math.round(nextBackoff / 1000)}s if failed)`,
        );
      }
    }
  }

  /**
   * Calculate the backoff delay for a specific retry attempt using exponential backoff
   */
  private calculateBackoffDelay(retryCount: number): number {
    return (
      this.config.retryInitialDelayMs *
      Math.pow(this.config.retryBackoffFactor, retryCount)
    );
  }

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    options?: {
      maxRetries?: number;
      immediate?: boolean;
      priority?: &quot;high&quot; | &quot;normal&quot; | &quot;low&quot;;
      metadata?: Record<string, any>;
    },
  ): Promise<boolean> {
    const message: EventMessage<E> = {
      id: uuidv4(),
      event,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: options?.maxRetries ?? this.config.defaultMaxRetries,
      state: &quot;pending&quot;,
      // Add additional metadata if provided
      ...(options?.metadata ? { metadata: options.metadata } : {}),
    };

    try {
      // Save message to storage first for durability
      await this.storage.saveMessage(message);

      // If immediate flag is set, attempt to publish right away
      if (options?.immediate) {
        return await this.publishImmediately(message);
      }

      // Message will be processed by the background process
      return true;
    } catch (error) {
      console.error(`Error queuing message for event ${event}:`, error);
      return false;
    }
  }

  /**
   * Try to publish a message immediately instead of waiting for the process loop
   */
  private async publishImmediately<E extends AppEvent>(
    message: EventMessage<E>,
  ): Promise<boolean> {
    try {
      // Mark as processing
      await this.storage.updateMessageState(message.id, &quot;processing&quot;);

      // Attempt to publish
      const success = await this.underlyingBus.publish(
        message.event,
        message.payload,
      );

      if (success) {
        // If successful, mark as delivered and remove from storage
        await this.storage.updateMessageState(message.id, &quot;delivered&quot;);
        await this.storage.deleteMessage(message.id);
        this.stats.successCount++;
        return true;
      } else {
        // If unsuccessful, mark as failed but keep in queue for retry
        await this.storage.updateMessageState(
          message.id,
          &quot;failed&quot;,
          &quot;Immediate publishing failed&quot;,
        );
        this.stats.failureCount++;
        return false;
      }
    } catch (error) {
      // If exception, mark as failed with error
      this.stats.failureCount++;
      await this.storage.updateMessageState(
        message.id,
        &quot;failed&quot;,
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  // The subscriber methods delegate to the underlying bus
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    this.underlyingBus.subscribe(event, handler);
  }

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    this.underlyingBus.unsubscribe(event, handler);
  }

  // Operations management methods

  /**
   * Pause message processing (useful during maintenance or high load)
   */
  pauseProcessing(): void {
    this.paused = true;
    console.log(&quot;[RetryableEventBus] Message processing paused&quot;);
  }

  /**
   * Resume message processing
   */
  resumeProcessing(): void {
    this.paused = false;
    console.log(&quot;[RetryableEventBus] Message processing resumed&quot;);
  }

  /**
   * Get the current status of the event bus
   */
  getStatus(): Record<string, any> {
    return {
      paused: this.paused,
      stats: { ...this.stats },
      config: { ...this.config },
    };
  }

  // Cleanup resources
  dispose(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Additional utility for manual management of the dead letter queue
export class DeadLetterQueueHandler {
  constructor(private storage: MessageStorage) {}

  async getDeadLetterMessages(limit = 100): Promise<EventMessage[]> {
    return this.storage.getMessages(&quot;dead-letter&quot;, limit);
  }

  async requeueMessage(id: string): Promise<void> {
    const messages = await this.storage.getMessages(&quot;dead-letter&quot;);
    const message = messages.find((msg) => msg.id === id);

    if (message) {
      // Reset the message for reprocessing
      const updatedMessage: EventMessage = {
        ...message,
        state: &quot;pending&quot;,
        retryCount: 0,
        lastAttempt: new Date().toISOString(),
        error: undefined,
      };

      await this.storage.saveMessage(updatedMessage);
      console.log(
        `Requeued dead letter message ${id} for event ${message.event}`,
      );
    } else {
      throw new Error(`Dead letter message with ID ${id} not found`);
    }
  }

  async deleteDeadLetterMessage(id: string): Promise<void> {
    await this.storage.deleteMessage(id);
    console.log(`Deleted dead letter message ${id}`);
  }

  async purgeDeadLetterQueue(): Promise<void> {
    const messages = await this.storage.getMessages(&quot;dead-letter&quot;);
    for (const message of messages) {
      await this.storage.deleteMessage(message.id);
    }
    console.log(`Purged ${messages.length} messages from dead letter queue`);
  }
}
