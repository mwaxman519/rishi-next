/**
 * Initialize WebSocket server integration with our application
 *
 * This module ensures the WebSocket service is properly set up during application startup
 * and integrates with the event system.
 */

import { Server } from "http";
import { setupWebSocketServer } from "./websocketServer";
import { webSocketEventSubscriber } from "../infrastructure/messaging/webSocketEventSubscriber";
import { eventBus } from "../infrastructure/messaging/distributedEventBus";

/**
 * Initialize WebSocket server and connect it to event bus
 *
 * @param httpServer The HTTP server instance to attach WebSocket server to
 */
export function initializeWebSocketService(httpServer: Server): void {
  console.log("[WebSocketService] Initializing WebSocket service");

  try {
    // Create and set up the WebSocket server
    const wss = setupWebSocketServer(httpServer);

    // Register WebSocket event subscriber with the event bus
    if (!eventBus.hasSubscriber(webSocketEventSubscriber)) {
      eventBus.subscribe(webSocketEventSubscriber);
      console.log(
        "[WebSocketService] WebSocket event subscriber registered with event bus",
      );
    }

    console.log(
      "[WebSocketService] WebSocket service successfully initialized",
    );
  } catch (error) {
    console.error(
      "[WebSocketService] Failed to initialize WebSocket service:",
      error,
    );
    // In a production app, we would have more sophisticated error handling here
    // such as alerting, retry logic, or circuit breaker pattern
  }
}
