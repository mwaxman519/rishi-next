&quot;use server&quot;;

import { Server as HTTPServer } from &quot;http&quot;;
import { WebSocketServer, WebSocket } from &quot;ws&quot;;

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
  console.log(&quot;Initializing WebSocket server...&quot;);

  // Create a WebSocket server instance on a different path than Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: &quot;/ws&quot; });

  wss.on(&quot;connection&quot;, (ws, req) => {
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
          type: &quot;chat_history&quot;,
          messages: recentMessages,
        }),
      );
    }

    // Handle incoming messages
    ws.on(&quot;message&quot;, (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        if (data.type === &quot;chat_message&quot;) {
          const message: ChatMessage = {
            id: Math.random().toString(36).substring(2, 15),
            sender: data.sender || &quot;Anonymous&quot;,
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
            type: &quot;chat_message&quot;,
            message,
          });

          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(messageStr);
            }
          });
        }
      } catch (error) {
        console.error(&quot;Error processing WebSocket message:&quot;, error);
      }
    });

    // Handle client disconnect
    ws.on(&quot;close&quot;, () => {
      console.log(`WebSocket connection closed. Client ID: ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on(&quot;error&quot;, (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Send a welcome message
    ws.send(
      JSON.stringify({
        type: &quot;system_message&quot;,
        message: {
          id: &quot;welcome&quot;,
          sender: &quot;System&quot;,
          content: &quot;Welcome to the Rishi chat system!&quot;,
          timestamp: Date.now(),
        },
      }),
    );
  });

  console.log(&quot;WebSocket server initialized successfully&quot;);

  return wss;
}
