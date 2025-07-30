/**
 * Initialize WebSocket server integration with our application
 *
 * This module ensures the WebSocket service is properly set up during application startup
 * and integrates with the event system.
 */

import { Server } from &quot;http&quot;;
import { setupWebSocketServer } from &quot;./websocketServer&quot;;
import { webSocketEventSubscriber } from &quot;../infrastructure/messaging/webSocketEventSubscriber&quot;;
import { eventBus } from &quot;../infrastructure/messaging/distributedEventBus&quot;;

/**
 * Initialize WebSocket server and connect it to event bus
 *
 * @param httpServer The HTTP server instance to attach WebSocket server to
 */
export function initializeWebSocketService(httpServer: Server): void {
  console.log(&quot;[WebSocketService] Initializing WebSocket service&quot;);

  try {
    // Create and set up the WebSocket server
    const wss = setupWebSocketServer(httpServer);

    // Register WebSocket event subscriber with the event bus
    if (!eventBus.hasSubscriber(webSocketEventSubscriber)) {
      eventBus.subscribe(webSocketEventSubscriber);
      console.log(
        &quot;[WebSocketService] WebSocket event subscriber registered with event bus&quot;,
      );
    }

    console.log(
      &quot;[WebSocketService] WebSocket service successfully initialized&quot;,
    );
  } catch (error) {
    console.error(
      &quot;[WebSocketService] Failed to initialize WebSocket service:&quot;,
      error,
    );
    // In a production app, we would have more sophisticated error handling here
    // such as alerting, retry logic, or circuit breaker pattern
  }
}
