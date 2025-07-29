import { EventBus } from "./eventBus";
import { DistributedEventBus } from "./distributedEventBus";
import { WebSocketEventPublisher } from "./webSocketEventPublisher";

// Define location event types
export type LocationEventType =
  | "location.created"
  | "location.updated"
  | "location.deleted"
  | "location.status.updated"
  | "location.approval.requested"
  | "location.approval.approved"
  | "location.approval.rejected";

// Define event payload types
export interface LocationEventBase {
  type: LocationEventType;
  payload: any;
  metadata: {
    userId: string;
    organizationId?: string;
    timestamp: string;
  };
}

// Status change event
export interface LocationStatusUpdatedEvent extends LocationEventBase {
  type: "location.status.updated";
  payload: {
    locationId: string;
    newStatus: string;
    updatedBy: string;
  };
}

// Create event
export interface LocationCreatedEvent extends LocationEventBase {
  type: "location.created";
  payload: {
    locationId: string;
    createdBy: string;
  };
}

// Update event
export interface LocationUpdatedEvent extends LocationEventBase {
  type: "location.updated";
  payload: {
    locationId: string;
    updatedBy: string;
    changes: string[]; // List of fields that were changed
  };
}

// Delete event
export interface LocationDeletedEvent extends LocationEventBase {
  type: "location.deleted";
  payload: {
    locationId: string;
    deletedBy: string;
  };
}

// Approval requested event
export interface LocationApprovalRequestedEvent extends LocationEventBase {
  type: "location.approval.requested";
  payload: {
    locationId: string;
    requestedBy: string;
    requestedAt: string;
  };
}

// Approval approved event
export interface LocationApprovalApprovedEvent extends LocationEventBase {
  type: "location.approval.approved";
  payload: {
    locationId: string;
    approvedBy: string;
    approvedAt: string;
    previousStatus?: string;
  };
}

// Approval rejected event
export interface LocationApprovalRejectedEvent extends LocationEventBase {
  type: "location.approval.rejected";
  payload: {
    locationId: string;
    rejectedBy: string;
    rejectedAt: string;
    reason?: string;
  };
}

// Union type of all location events
export type LocationEvent =
  | LocationCreatedEvent
  | LocationUpdatedEvent
  | LocationDeletedEvent
  | LocationStatusUpdatedEvent
  | LocationApprovalRequestedEvent
  | LocationApprovalApprovedEvent
  | LocationApprovalRejectedEvent;

// Create a dedicated event bus for location events
export const locationEventBus = new DistributedEventBus<LocationEvent>();

// Connect location event bus to WebSocket publisher to broadcast events
export function connectLocationEventBusToWebSockets(
  webSocketPublisher: WebSocketEventPublisher,
) {
  locationEventBus.subscribe(async (event) => {
    // For some events, we want to notify specific users or organizations
    const userSpecificEvents: LocationEventType[] = [
      "location.approval.requested",
      "location.approval.approved",
      "location.approval.rejected",
    ];

    // Broadcast to all connected clients
    await webSocketPublisher.publishEvent({
      type: event.type,
      payload: event.payload,
      metadata: {
        ...event.metadata,
        timestamp: event.metadata.timestamp || new Date().toISOString(),
        eventId: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      },
    });
  });
}

// Optional: add logging for location events
export function setupLocationEventLogging() {
  locationEventBus.subscribe((event) => {
    console.log(`[Location Event] ${event.type}:`, {
      payload: event.payload,
      user: event.metadata.userId,
      org: event.metadata.organizationId,
      time: event.metadata.timestamp,
    });
  });
}
