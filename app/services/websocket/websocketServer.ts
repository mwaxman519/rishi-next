/**
 * WebSocket Server for real-time event broadcasting
 *
 * This module sets up a WebSocket server alongside the HTTP server to facilitate
 * real-time bidirectional communication with connected clients.
 */

import { Server as WebSocketServer } from &quot;ws&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import type { Server } from &quot;http&quot;;
import { webSocketEventSubscriber } from &quot;../infrastructure/messaging/webSocketEventSubscriber&quot;;

/**
 * Initialize and set up WebSocket server
 * @param httpServer The HTTP server to attach the WebSocket server to
 */
export function setupWebSocketServer(httpServer: Server) {
  console.log(&quot;[WebSocketServer] Setting up WebSocket server&quot;);

  // Create WebSocket server attached to the HTTP server with a specific path
  // to avoid conflicts with other WebSocket connections (like Next.js HMR)
  const wss = new WebSocketServer({
    server: httpServer,
    path: &quot;/ws&quot;,
    // Skip client verification in dev but would be added in production
    verifyClient: (info, callback) => {
      // In production, we would validate the client's auth token here
      // For development, allow all connections
      callback(true);
    },
  });

  // Handle new WebSocket connections
  wss.on(&quot;connection&quot;, (ws, req) => {
    // Generate a unique ID for this client
    const clientId = uuidv4();
    const ip = req.socket.remoteAddress || &quot;unknown&quot;;

    console.log(`[WebSocketServer] Client connected: ${clientId} from ${ip}`);

    // Extract auth information (in a real app, we'd validate the token here)
    const params = new URLSearchParams(req.url?.split(&quot;?&quot;)[1] || "&quot;);
    const userId = params.get(&quot;userId&quot;) || undefined;
    const organizationId = params.get(&quot;organizationId&quot;) || undefined;

    // Keep track of authentication state
    let isAuthenticated = !!userId;
    let lastHeartbeat = Date.now();

    // Register with the event subscriber
    webSocketEventSubscriber.registerClient(
      clientId,
      (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(data);
        }
      },
      {
        userId,
        organizationId,
        // Events this client is interested in (or empty for all)
        initialSubscriptions: params.get(&quot;events&quot;)?.split(&quot;,&quot;),
      },
    );

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: &quot;connected&quot;,
        clientId,
        authenticated: isAuthenticated,
        timestamp: new Date().toISOString(),
      }),
    );

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      // Check if client is still connected
      if (ws.readyState !== ws.OPEN) {
        clearInterval(pingInterval);
        return;
      }

      // Check if we haven&apos;t received a pong in too long
      if (Date.now() - lastHeartbeat > 30000) {
        // 30 seconds
        console.log(`[WebSocketServer] Client ${clientId} timed out`);
        ws.terminate();
        clearInterval(pingInterval);
        return;
      }

      // Send a ping
      ws.ping();
    }, 15000); // Every 15 seconds

    // Handle pong responses
    ws.on(&quot;pong&quot;, () => {
      lastHeartbeat = Date.now();
    });

    // Handle incoming messages from the client
    ws.on(&quot;message&quot;, (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(
          `[WebSocketServer] Received message from ${clientId}:`,
          data.type,
        );

        handleClientMessage(clientId, data, {
          userId,
          organizationId,
          isAuthenticated,
        });
      } catch (error) {
        console.error(
          `[WebSocketServer] Error processing message from ${clientId}:`,
          error,
        );
        ws.send(
          JSON.stringify({
            type: &quot;error&quot;,
            error: &quot;Invalid message format&quot;,
          }),
        );
      }
    });

    // Handle disconnection
    ws.on(&quot;close&quot;, () => {
      console.log(`[WebSocketServer] Client disconnected: ${clientId}`);

      // Clean up resources
      clearInterval(pingInterval);
      webSocketEventSubscriber.removeClient(clientId);
    });

    // Handle errors
    ws.on(&quot;error&quot;, (error) => {
      console.error(`[WebSocketServer] Error with client ${clientId}:`, error);
    });
  });

  // Server-level error handler
  wss.on(&quot;error&quot;, (error) => {
    console.error(&quot;[WebSocketServer] Server error:&quot;, error);
  });

  console.log(&quot;[WebSocketServer] WebSocket server initialized&quot;);
  return wss;
}

/**
 * Handle messages received from clients
 */
function handleClientMessage(
  clientId: string,
  message: any,
  context: {
    userId?: string;
    organizationId?: string;
    isAuthenticated: boolean;
  },
) {
  switch (message.type) {
    case &quot;subscribe&quot;:
      // Update client's event subscriptions
      if (Array.isArray(message.events)) {
        webSocketEventSubscriber.updateClientSubscriptions(
          clientId,
          message.events,
        );
      }
      break;

    case &quot;auth&quot;:
      // In a real app, we'd validate the token and update the client's auth status
      // This is a simplified example
      console.log(`[WebSocketServer] Client ${clientId} auth attempt`);
      break;

    case &quot;heartbeat":
      // Client can send heartbeats to keep the connection alive
      // We don&apos;t need to do anything here as the connection is already active
      break;

    default:
      console.warn(
        `[WebSocketServer] Unknown message type from ${clientId}: ${message.type}`,
      );
  }
}
