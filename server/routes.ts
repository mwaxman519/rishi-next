import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrganizationSchema, insertUserSchema } from "../shared/schema";
import { ZodError } from "zod";
import { createOrganizationApiRouter } from "./routes/organization-api";
import { v4 as uuidv4 } from "uuid";

// Mock WebSocket event subscriber for now
const webSocketEventSubscriber = {
  addConnection: (id: string, ws: any, userId?: string, orgId?: string) => {},
  subscribe: (id: string, events: string[]) => {},
  removeConnection: (id: string) => {},
  broadcast: (event: string, data: any) => {}
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Auth service routes
  app.get("/api/auth-service/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        success: true, 
        user: req.user,
        authenticated: true 
      });
    } else {
      res.json({ 
        success: false, 
        user: null,
        authenticated: false 
      });
    }
  });

  // Organization routes
  app.get("/api/organizations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const organization = await storage.getOrganization(req.params.id);

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Validate request data
      const validatedData = insertOrganizationSchema.parse(req.body);

      const organization = await storage.createOrganization(validatedData);
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }

      console.error("Error creating organization:", error);
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const orgId = parseInt(req.params.id);

      // Check if organization exists
      const existingOrg = await storage.getOrganization(orgId);
      if (!existingOrg) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Update organization
      const updatedOrg = await storage.updateOrganization(orgId, req.body);
      res.json(updatedOrg);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ error: "Failed to update organization" });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const orgId = parseInt(req.params.id);

      // Check if organization exists
      const existingOrg = await storage.getOrganization(orgId);
      if (!existingOrg) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Delete organization
      const result = await storage.deleteOrganization(orgId);

      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ error: "Failed to delete organization" });
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ error: "Failed to delete organization" });
    }
  });

  // User routes
  app.get("/api/organizations/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // TODO: Implement fetching users with proper filtering based on organization
      // This is a placeholder for now
      const mockUser = {
        id: 1,
        username: "admin",
        email: "admin@rishi.internal",
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin",
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(200).json([mockUser]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Mock endpoint for organization preferences
  app.get("/api/organizations/preferences", (req, res) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Returning mock preferences for development user");

      // Return mock preferences for development
      const mockPreferences = {
        theme: "dark",
        sidebar: "expanded",
        notifications: true,
        defaultView: "calendar",
        timezone: "America/Los_Angeles",
      };

      res.status(200).json(mockPreferences);
    } else {
      // In production, we would require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Would normally fetch real preferences here
      res.status(501).json({ error: "Not implemented in production yet" });
    }
  });

  // Role and permission routes
  app.get("/api/roles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/permissions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.get("/api/roles/:id/permissions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const roleId = parseInt(req.params.id);

      // Check if role exists
      const existingRole = await storage.getRole(roleId);
      if (!existingRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ error: "Failed to fetch role permissions" });
    }
  });

  // Mount organization-aware API routes
  // These routes include proper organization context and data isolation
  app.use("/api/org", createOrganizationApiRouter(storage));

  const httpServer = createServer(app);

  // Set up WebSocket server on a specific path to avoid conflicts with
  // Next.js built-in websockets for HMR
  // Set up WebSocket server on a specific path to avoid conflicts with Next.js
  // WebSockets used for HMR (Hot Module Replacement)
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
    // Skip verification for websocket upgrade requests
    // In production, would use proper authentication with tokens
    verifyClient: () => true,
    // Additional configuration for stability
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for performance.
      threshold: 1024, // Size (in bytes) below which messages should not be compressed.
    },
  });

  // Set up WebSocket server for real-time event distribution
  setupWebSocketServer(wss);

  return httpServer;
}

/**
 * Set up the WebSocket server for real-time event distribution
 *
 * @param wss WebSocket server instance
 */
function setupWebSocketServer(wss: any) {
  console.log(
    "[WebSocketServer] Initializing WebSocket server for event distribution",
  );

  wss.on("connection", (ws: any, req: any) => {
    // Generate a unique ID for this client
    const connectionId = uuidv4();
    const ip = req.socket.remoteAddress || "unknown";

    console.log(
      `[WebSocketServer] Client connected: ${connectionId} from ${ip}`,
    );

    // Extract auth information and query parameters
    const params = new URLSearchParams(req.url?.split("?")[1] || "");
    const userId = params.get("userId") || undefined;
    const organizationId = params.get("organizationId") || undefined;

    // Keep track of authentication state
    const isAuthenticated = !!userId;
    let lastHeartbeat = Date.now();

    // Register connection with the event subscriber
    if (userId) {
      webSocketEventSubscriber.addConnection(
        connectionId,
        ws,
        userId,
        organizationId,
      );

      // If events parameter is provided, subscribe to those events
      const events = params.get("events")?.split(",");
      if (events && events.length > 0) {
        webSocketEventSubscriber.subscribe(connectionId, events);
      }
    }

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
        connectionId,
        authenticated: isAuthenticated,
        timestamp: new Date().toISOString(),
      }),
    );

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      // Check if client is still connected
      if (ws.readyState !== 1) {
        // WebSocket.OPEN = 1
        clearInterval(pingInterval);
        return;
      }

      // Check if we haven't received a pong in too long
      if (Date.now() - lastHeartbeat > 30000) {
        // 30 seconds
        console.log(`[WebSocketServer] Client ${connectionId} timed out`);
        try {
          // Close with code 1000 (normal closure)
          ws.close(1000, "Connection timeout");
        } catch (err: any) {
          console.error(
            `[WebSocketServer] Error closing connection: ${err?.message || "Unknown error"}`,
          );
        }
        clearInterval(pingInterval);
        return;
      }

      // Send a ping-type message instead of using the ping method
      try {
        ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      } catch (err: any) {
        console.error(
          `[WebSocketServer] Error sending ping: ${err?.message || "Unknown error"}`,
        );
      }
    }, 15000); // Every 15 seconds

    // Instead of using ws.on('pong'), monitor for pong-type messages

    // Handle incoming messages from the client
    ws.addEventListener("message", (event: any) => {
      try {
        // Update heartbeat timestamp for any message received
        lastHeartbeat = Date.now();

        // Try to parse the message
        const data =
          typeof event.data === "string" ? event.data : event.data.toString();
        const message = JSON.parse(data);

        // If this is a pong response to our ping, just update heartbeat
        if (message.type === "pong") {
          return;
        }

        console.log(
          `[WebSocketServer] Received message from ${connectionId}:`,
          message.type,
        );

        // Handle subscription requests
        if (message.type === "subscribe" && Array.isArray(message.events)) {
          webSocketEventSubscriber.subscribe(connectionId, message.events);

          // Confirm subscription
          ws.send(
            JSON.stringify({
              type: "subscription_confirmed",
              events: message.events,
              connectionId,
              timestamp: new Date().toISOString(),
            }),
          );

          console.log(
            `[WebSocketServer] Client ${connectionId} subscribed to events:`,
            message.events,
          );
        }

        // Handle unsubscription requests
        if (message.type === "unsubscribe" && Array.isArray(message.events)) {
          webSocketEventSubscriber.unsubscribe(connectionId, message.events);

          // Confirm unsubscription
          ws.send(
            JSON.stringify({
              type: "unsubscription_confirmed",
              events: message.events,
              connectionId,
              timestamp: new Date().toISOString(),
            }),
          );

          console.log(
            `[WebSocketServer] Client ${connectionId} unsubscribed from events:`,
            message.events,
          );
        }

        // Handle ping/heartbeat messages to keep connection alive
        if (message.type === "ping" || message.type === "heartbeat") {
          lastHeartbeat = Date.now(); // Update heartbeat timestamp
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (error) {
        console.error("[WebSocketServer] Error processing message:", error);

        // Inform client of error
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
            timestamp: new Date().toISOString(),
          }),
        );
      }
    });

    // Handle disconnection
    ws.addEventListener("close", () => {
      console.log(`[WebSocketServer] Client disconnected: ${connectionId}`);

      // Clean up resources
      clearInterval(pingInterval);
      webSocketEventSubscriber.removeConnection(
        connectionId,
        userId,
        organizationId,
      );
    });

    // Handle WebSocket errors
    ws.on("error", (error: Error) => {
      console.error(
        `[WebSocketServer] Error with client ${connectionId}:`,
        error,
      );

      // Clean up resources on error as well
      clearInterval(pingInterval);
      webSocketEventSubscriber.removeConnection(
        connectionId,
        userId,
        organizationId,
      );
    });
  });

  // Log when the WebSocket server is ready
  wss.on("listening", () => {
    console.log("[WebSocketServer] Server is listening for connections on /ws");
  });

  // Handle server errors
  wss.on("error", (error: Error) => {
    console.error("[WebSocketServer] Server error:", error);
  });
}
