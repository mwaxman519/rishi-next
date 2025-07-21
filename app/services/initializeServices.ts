/**
 * Initialize application services
 *
 * This module is responsible for initializing various services during application startup.
 * It registers event handlers, starts background jobs, and sets up any required infrastructure.
 */

import { registerLocationEventHandler } from "./locations/locationEventHandler";
import { registerErrorHandlingStrategies } from "./infrastructure/messaging/errorHandlingStrategies";
import { webSocketEventSubscriber } from "./infrastructure/messaging/webSocketEventSubscriber";
import {
  locationEventBus,
  connectLocationEventBusToWebSockets,
  setupLocationEventLogging,
} from "./infrastructure/messaging/locationEvents";

// Enhanced error handling with custom error handler
import { eventBus } from "./infrastructure/messaging/distributedEventBus";
import { webSocketEventPublisher } from "./infrastructure/messaging/webSocketEventPublisher";

let initialized = false;

/**
 * Simple error handler for the event bus
 */
export class ErrorHandler {
  private strategies: any[] = [];

  registerStrategy(strategy: any) {
    this.strategies.push(strategy);
    console.log(
      `[ErrorHandler] Registered strategy: ${strategy.constructor.name}`,
    );
  }

  async handleError(
    error: Error,
    eventType: string,
    context: Record<string, any>,
  ) {
    console.log(
      `[ErrorHandler] Processing error for event ${eventType} with ${this.strategies.length} strategies`,
    );

    let handled = false;

    // Apply strategies that are relevant for this event type
    for (const strategy of this.strategies) {
      if (strategy.getApplicableEvents().includes(eventType)) {
        try {
          const result = await strategy.handleError(error, eventType, context);
          if (result) {
            handled = true;
            console.log(
              `[ErrorHandler] Error handled by ${strategy.constructor.name}`,
            );
          }
        } catch (strategyError) {
          console.error(
            `[ErrorHandler] Strategy ${strategy.constructor.name} failed:`,
            strategyError,
          );
        }
      }
    }

    return handled;
  }
}

// Create a singleton error handler
export const errorHandler = new ErrorHandler();

// In Node.js we can make it globally accessible
// This allows our modules to access it directly
// In a proper implementation, we would use a service registry or dependency injection
declare global {
  namespace NodeJS {
    interface Global {
      errorHandler: ErrorHandler;
    }
  }
}

// Make errorHandler globally available for other modules
(global as any).errorHandler = errorHandler;

/**
 * Initialize all application services
 */
export function initializeServices() {
  if (initialized) {
    console.log("[Services] Services already initialized, skipping");
    return;
  }

  console.log("[Services] Initializing application services...");

  try {
    // Register error handling strategies
    registerErrorHandlingStrategies(errorHandler);

    // Register event handlers and subscribers
    registerLocationEventHandler();

    // Register WebSocket event subscriber
    eventBus.subscribe(webSocketEventSubscriber);
    console.log("[Services] WebSocket event subscriber registered");

    // Connect location event bus to WebSocket publisher
    connectLocationEventBusToWebSockets(webSocketEventPublisher);
    console.log(
      "[Services] Location event bus connected to WebSocket publisher",
    );

    // Setup location event logging
    setupLocationEventLogging();
    console.log("[Services] Location event logging enabled");

    // Initialize event bus monitoring
    setupEventBusMonitoring();

    // Initialize other services
    // initializeSearchIndexing();
    // initializeNotifications();
    // initializeBackgroundJobs();

    initialized = true;
    console.log("[Services] All services successfully initialized");
  } catch (error) {
    console.error("[Services] Error initializing services:", error);
    throw error;
  }
}

/**
 * Set up monitoring for the event bus
 */
function setupEventBusMonitoring() {
  // Disabled aggressive monitoring that was contributing to excessive edge requests
  console.log('[EventBus] Monitoring disabled to prevent excessive edge requests');
  
  // Only log circuit breaker state on events, not on timers
  // setInterval(() => {
  //   const state = eventBus.getCircuitBreakerState();
  //   console.log(`[EventBus Monitor] Circuit breaker state: ${state}`);
  // }, 60000); // Check every minute

  // In production, monitoring should be event-driven, not timer-based
  // - React to actual events rather than polling
  // - Use circuit breaker state changes as triggers
  // - Monitor through application events, not background intervals
}
