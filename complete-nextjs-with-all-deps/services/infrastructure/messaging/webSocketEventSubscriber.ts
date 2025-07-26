import WebSocket from "ws";
import { EventMessage } from "./eventTypes";

/**
 * WebSocketEventSubscriber
 * Manages WebSocket connections and subscriptions for real-time event notifications
 */
export class WebSocketEventSubscriber {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private userToConnectionId: Map<string, string> = new Map();
  private organizationSubscriptions: Map<string, Set<string>> = new Map();

  /**
   * Add a new WebSocket connection
   * @param connectionId Unique identifier for the connection
   * @param socket WebSocket connection
   * @param userId User ID associated with the connection
   * @param organizationId Organization ID associated with the connection (optional)
   */
  addConnection(
    connectionId: string,
    socket: WebSocket,
    userId: string,
    organizationId?: string,
  ): void {
    this.connections.set(connectionId, socket);
    this.subscriptions.set(connectionId, new Set());
    this.userToConnectionId.set(userId, connectionId);

    // If organization ID is provided, associate the connection with the organization
    if (organizationId) {
      if (!this.organizationSubscriptions.has(organizationId)) {
        this.organizationSubscriptions.set(organizationId, new Set());
      }
      this.organizationSubscriptions.get(organizationId)?.add(connectionId);
    }

    console.log(
      `WebSocket connection added: ${connectionId} for user ${userId}`,
    );
  }

  /**
   * Remove a WebSocket connection
   * @param connectionId Unique identifier for the connection to remove
   * @param userId User ID associated with the connection
   * @param organizationId Organization ID associated with the connection (optional)
   */
  removeConnection(
    connectionId: string,
    userId?: string,
    organizationId?: string,
  ): void {
    this.connections.delete(connectionId);
    this.subscriptions.delete(connectionId);

    // Remove user mapping if provided
    if (userId) {
      this.userToConnectionId.delete(userId);
    }

    // Remove from organization subscriptions if provided
    if (organizationId && this.organizationSubscriptions.has(organizationId)) {
      this.organizationSubscriptions.get(organizationId)?.delete(connectionId);

      // Clean up empty organization sets
      if (this.organizationSubscriptions.get(organizationId)?.size === 0) {
        this.organizationSubscriptions.delete(organizationId);
      }
    }

    console.log(`WebSocket connection removed: ${connectionId}`);
  }

  /**
   * Subscribe a connection to specific event types
   * @param connectionId Unique identifier for the connection
   * @param eventTypes Array of event types to subscribe to
   */
  subscribe(connectionId: string, eventTypes: string[]): void {
    const subscriptionSet = this.subscriptions.get(connectionId);

    if (subscriptionSet) {
      eventTypes.forEach((eventType) => {
        subscriptionSet.add(eventType);
      });

      console.log(
        `Connection ${connectionId} subscribed to events: ${eventTypes.join(", ")}`,
      );
    } else {
      console.warn(`Cannot subscribe: Connection ${connectionId} not found`);
    }
  }

  /**
   * Unsubscribe a connection from specific event types
   * @param connectionId Unique identifier for the connection
   * @param eventTypes Array of event types to unsubscribe from
   */
  unsubscribe(connectionId: string, eventTypes: string[]): void {
    const subscriptionSet = this.subscriptions.get(connectionId);

    if (subscriptionSet) {
      eventTypes.forEach((eventType) => {
        subscriptionSet.delete(eventType);
      });

      console.log(
        `Connection ${connectionId} unsubscribed from events: ${eventTypes.join(", ")}`,
      );
    } else {
      console.warn(`Cannot unsubscribe: Connection ${connectionId} not found`);
    }
  }

  /**
   * Publish an event to all subscribers
   * @param event Event message to publish
   * @param targetUserId Optional user ID to target the event to a specific user
   * @param targetOrgId Optional organization ID to target the event to users in a specific organization
   */
  publish(
    event: EventMessage,
    targetUserId?: string,
    targetOrgId?: string,
  ): void {
    const message = JSON.stringify({
      type: "event",
      data: event,
    });

    // Handle user-targeted events
    if (targetUserId) {
      const connectionId = this.userToConnectionId.get(targetUserId);
      if (connectionId) {
        this.sendToConnection(connectionId, message, event.type);
      }
      return;
    }

    // Handle organization-targeted events
    if (targetOrgId && this.organizationSubscriptions.has(targetOrgId)) {
      const connectionIds =
        this.organizationSubscriptions.get(targetOrgId) || new Set();
      connectionIds.forEach((connectionId) => {
        this.sendToConnection(connectionId, message, event.type);
      });
      return;
    }

    // Broadcast to all subscribers
    this.connections.forEach((socket, connectionId) => {
      this.sendToConnection(connectionId, message, event.type);
    });
  }

  /**
   * Send a message to a specific connection if they're subscribed to the event type
   * @param connectionId Connection ID
   * @param message Message to send
   * @param eventType Event type
   */
  private sendToConnection(
    connectionId: string,
    message: string,
    eventType: string,
  ): void {
    const socket = this.connections.get(connectionId);
    const subscriptions = this.subscriptions.get(connectionId);

    if (
      socket &&
      subscriptions &&
      (subscriptions.has(eventType) || subscriptions.has("*"))
    ) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
        console.log(`Event sent to connection ${connectionId}: ${eventType}`);
      } else {
        console.warn(
          `Cannot send to connection ${connectionId}: Socket not open`,
        );
      }
    }
  }

  /**
   * Get all current connections
   * @returns Map of connections
   */
  getConnections(): Map<string, WebSocket> {
    return this.connections;
  }

  /**
   * Get all current subscriptions
   * @returns Map of subscriptions
   */
  getSubscriptions(): Map<string, Set<string>> {
    return this.subscriptions;
  }
}

// Create singleton instance
export const webSocketEventSubscriber = new WebSocketEventSubscriber();
