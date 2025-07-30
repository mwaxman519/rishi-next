/**
 * DEPRECATED: Use AdvancedEventBus instead
 * This file provides backwards compatibility for existing imports
 */

// Re-export the advanced event bus for backwards compatibility
export { advancedEventBus as distributedEventBus } from &quot;./AdvancedEventBus&quot;;

// Legacy interfaces for backwards compatibility
export interface EventPublisher {
  publish<E extends string>(
    event: E,
    payload: any,
    options?: any,
  ): Promise<boolean>;
}

export interface EventSubscriber {
  subscribe<E extends string>(
    event: E,
    handler: (payload: any, metadata?: any) => void,
  ): void;
  unsubscribe<E extends string>(
    event: E,
    handler: (payload: any, metadata?: any) => void,
  ): void;
}

export interface EventBus extends EventPublisher, EventSubscriber {}
