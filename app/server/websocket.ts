"use server";

import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// Connected clients storage
const clients = new Map<string, WebSocket>();

// Messages storage (temporary in-memory for this implementation)
type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  organizationId?: string;
  chatRoomId?: string;
};

const messages: ChatMessage[] = [];

/**
 * Initialize the WebSocket server
 * @param httpServer The HTTP server instance
 */
export function initializeWebSocketServer(httpServer: HTTPServer) {
  console.log("Initializing WebSocket server...");

  // Create a WebSocket server instance on a different path than Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    // Generate a unique client ID
    const clientId = Math.random().toString(36).substring(2, 15);

    console.log(`WebSocket connection established. Client ID: ${clientId}`);

    // Store the client connection
    clients.set(clientId, ws);

    // Send the last 50 messages to the client for immediate chat history
    const recentMessages = messages.slice(-50);
    if (recentMessages.length > 0) {
      ws.send(
        JSON.stringify({
          type: "chat_history",
          messages: recentMessages,
        }),
      );
    }

    // Handle incoming messages
    ws.on("message", (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        if (data.type === "chat_message") {
          const message: ChatMessage = {
            id: Math.random().toString(36).substring(2, 15),
            sender: data.sender || "Anonymous",
            content: data.content,
            timestamp: Date.now(),
            organizationId: data.organizationId,
            chatRoomId: data.chatRoomId,
          };

          // Store the message
          messages.push(message);

          // Limit stored messages to prevent memory issues
          if (messages.length > 1000) {
            messages.shift();
          }

          // Broadcast to all connected clients
          const messageStr = JSON.stringify({
            type: "chat_message",
            message,
          });

          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(messageStr);
            }
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log(`WebSocket connection closed. Client ID: ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Send a welcome message
    ws.send(
      JSON.stringify({
        type: "system_message",
        message: {
          id: "welcome",
          sender: "System",
          content: "Welcome to the Rishi chat system!",
          timestamp: Date.now(),
        },
      }),
    );
  });

  console.log("WebSocket server initialized successfully");

  return wss;
}
