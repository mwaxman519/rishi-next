/**
 * WebSocket Event Subscriber
 *
 * Broadcasts events to connected WebSocket clients based on their subscription filters
 * This allows for real-time updates to be pushed to clients when certain events occur
 */

import { EventSubscriber } from &quot;./distributedEventBus&quot;;
import { AppEvent, Event } from &quot;./eventTypes&quot;;

// Simple in-memory structure to track WebSocket connections for this subscriber
interface WebSocketClient {
  id: string;
  send: (data: any) => void;
  subscriptions: Set<string>;
  userId: string | undefined;
  organizationId: string | undefined;
}

export class WebSocketEventSubscriber implements EventSubscriber {
  private clients: Map<string, WebSocketClient> = new Map();

  constructor() {
    console.log(&quot;[WebSocketEventSubscriber] Initializing&quot;);
  }

  /**
   * Get all event types this subscriber is interested in
   */
  getSubscribedEvents(): AppEvent[] {
    return [
      AppEvent.LOCATION_CREATED,
      AppEvent.LOCATION_UPDATED,
      AppEvent.LOCATION_APPROVED,
      AppEvent.LOCATION_REJECTED,
      AppEvent.LOCATION_DELETED,
      AppEvent.SYSTEM_NOTIFICATION,
    ];
  }

  /**
   * Handle an incoming event by broadcasting to relevant clients
   */
  async handleEvent<T>(event: Event<T>): Promise<void> {
    console.log(
      `[WebSocketEventSubscriber] Broadcasting event: ${event.type}`,
      { eventId: event.id },
    );

    try {
      if (this.clients.size === 0) {
        console.log(
          `[WebSocketEventSubscriber] No connected clients, skipping broadcast`,
        );
        return;
      }

      // Prepare a simplified version of the event for broadcasting
      const broadcastEvent = {
        type: event.type,
        payload: this.sanitizePayload(event.type, event.payload),
        timestamp: event.timestamp,
      };

      let deliveryCount = 0;

      // Broadcast to all clients that are subscribed to this event type
      for (const client of this.clients.values()) {
        if (this.shouldDeliverToClient(client, event)) {
          try {
            client.send(
              JSON.stringify({
                type: &quot;event&quot;,
                data: broadcastEvent,
              }),
            );
            deliveryCount++;
          } catch (sendError) {
            console.error(
              `[WebSocketEventSubscriber] Error sending to client ${client.id}:`,
              sendError,
            );
            // We may want to remove this client if sending consistently fails
          }
        }
      }

      console.log(
        `[WebSocketEventSubscriber] Event broadcast complete. Delivered to ${deliveryCount}/${this.clients.size} clients`,
      );
    } catch (error) {
      console.error(
        `[WebSocketEventSubscriber] Error broadcasting event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Register a new WebSocket client
   */
  registerClient(
    clientId: string,
    sendFunction: (data: any) => void,
    options: {
      userId?: string;
      organizationId?: string;
      initialSubscriptions?: string[];
    } = {},
  ): void {
    console.log(`[WebSocketEventSubscriber] Registering client: ${clientId}`);

    const subscriptions = new Set<string>(options.initialSubscriptions || []);

    // If no specific subscriptions were provided, subscribe to all events by default
    if (subscriptions.size === 0) {
      this.getSubscribedEvents().forEach((event) => subscriptions.add(event));
    }

    this.clients.set(clientId, {
      id: clientId,
      send: sendFunction,
      subscriptions,
      userId: options.userId,
      organizationId: options.organizationId,
    });

    console.log(
      `[WebSocketEventSubscriber] Client registered: ${clientId} with ${subscriptions.size} subscriptions`,
    );
  }

  /**
   * Remove a WebSocket client when they disconnect
   */
  removeClient(clientId: string): boolean {
    console.log(`[WebSocketEventSubscriber] Removing client: ${clientId}`);
    return this.clients.delete(clientId);
  }

  /**
   * Update a client's subscriptions
   */
  updateClientSubscriptions(
    clientId: string,
    subscriptions: string[],
  ): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    client.subscriptions = new Set(subscriptions);
    console.log(
      `[WebSocketEventSubscriber] Updated subscriptions for client ${clientId}: ${subscriptions.length} events`,
    );
    return true;
  }

  /**
   * Check if an event should be delivered to a specific client
   */
  private shouldDeliverToClient<T>(
    client: WebSocketClient,
    event: Event<T>,
  ): boolean {
    // Check if client is subscribed to this event type
    if (!client.subscriptions.has(event.type)) {
      return false;
    }

    // Check organization-specific filters
    if (
      client.organizationId &&
      event.metadata?.targetOrganizationId &&
      event.metadata.targetOrganizationId !== client.organizationId
    ) {
      return false;
    }

    // Check user-specific filters
    if (
      client.userId &&
      event.metadata?.targetUserId &&
      event.metadata.targetUserId !== client.userId
    ) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize the payload to ensure only public fields are sent
   * This prevents leaking sensitive data to clients
   */
  private sanitizePayload(eventType: string, payload: any): any {
    // Strip any sensitive fields based on the event type
    if (!payload) return {};

    const sanitized = { ...payload };

    // Remove fields that should not be broadcast
    const sensitiveFields = [
      &quot;password&quot;,
      &quot;token&quot;,
      &quot;secret&quot;,
      &quot;authorization&quot;,
      &quot;privateKey&quot;,
      &quot;accessToken&quot;,
      &quot;refreshToken&quot;,
    ];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  /**
   * Get all connected clients (for debugging/monitoring)
   */
  getStats(): {
    clientCount: number;
    activeSubscriptions: Record<string, number>;
  } {
    const activeSubscriptions: Record<string, number> = {};

    // Count how many clients are subscribed to each event type
    for (const client of this.clients.values()) {
      for (const eventType of client.subscriptions) {
        activeSubscriptions[eventType] =
          (activeSubscriptions[eventType] || 0) + 1;
      }
    }

    return {
      clientCount: this.clients.size,
      activeSubscriptions,
    };
  }
}

// Create a singleton instance
export const webSocketEventSubscriber = new WebSocketEventSubscriber();
