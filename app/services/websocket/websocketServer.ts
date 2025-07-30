/**
 * WebSocket Server for real-time event broadcasting
 *
 * This module sets up a WebSocket server alongside the HTTP server to facilitate
 * real-time bidirectional communication with connected clients.
 */

import { Server as WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import type { Server } from "http";
import { webSocketEventSubscriber } from "../infrastructure/messaging/webSocketEventSubscriber";

/**
 * Initialize and set up WebSocket server
 * @param httpServer The HTTP server to attach the WebSocket server to
 */
export function setupWebSocketServer(httpServer: Server) {
  console.log("[WebSocketServer] Setting up WebSocket server");

  // Create WebSocket server attached to the HTTP server with a specific path
  // to avoid conflicts with other WebSocket connections (like Next.js HMR)
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
    // Skip client verification in dev but would be added in production
    verifyClient: (info, callback) => {
      // In production, we would validate the client's auth token here
      // For development, allow all connections
      callback(true);
    },
  });

  // Handle new WebSocket connections
  wss.on("connection", (ws, req) => {
    // Generate a unique ID for this client
    const clientId = uuidv4();
    const ip = req.socket.remoteAddress || "unknown";

    console.log(`[WebSocketServer] Client connected: ${clientId} from ${ip}`);

    // Extract auth information (in a real app, we'd validate the token here)
    const params = new URLSearchParams(req.url?.split("?")[1] || "");
    const userId = params.get("userId") || undefined;
    const organizationId = params.get("organizationId") || undefined;

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
        initialSubscriptions: params.get("events")?.split(","),
      },
    );

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
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

      // Check if we haven't received a pong in too long
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
    ws.on("pong", () => {
      lastHeartbeat = Date.now();
    });

    // Handle incoming messages from the client
    ws.on("message", (message) => {
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
            type: "error",
            error: "Invalid message format",
          }),
        );
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      console.log(`[WebSocketServer] Client disconnected: ${clientId}`);

      // Clean up resources
      clearInterval(pingInterval);
      webSocketEventSubscriber.removeClient(clientId);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`[WebSocketServer] Error with client ${clientId}:`, error);
    });
  });

  // Server-level error handler
  wss.on("error", (error) => {
    console.error("[WebSocketServer] Server error:", error);
  });

  console.log("[WebSocketServer] WebSocket server initialized");
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
    case "subscribe":
      // Update client's event subscriptions
      if (Array.isArray(message.events)) {
        webSocketEventSubscriber.updateClientSubscriptions(
          clientId,
          message.events,
        );
      }
      break;

    case "auth":
      // In a real app, we'd validate the token and update the client's auth status
      // This is a simplified example
      console.log(`[WebSocketServer] Client ${clientId} auth attempt`);
      break;

    case "heartbeat":
      // Client can send heartbeats to keep the connection alive
      // We don't need to do anything here as the connection is already active
      break;

    default:
      console.warn(
        `[WebSocketServer] Unknown message type from ${clientId}: ${message.type}`,
      );
  }
}
