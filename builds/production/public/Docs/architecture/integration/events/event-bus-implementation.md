# Event Bus Implementation

## Overview

The Event Bus is a core architectural component of the Rishi Workforce Management platform that enables asynchronous, event-driven communication between different parts of the application. This document details the implementation, interfaces, and usage patterns for the Event Bus system.

## Architecture

The Event Bus implementation follows a layered design pattern to support different deployment scenarios:

```
┌─────────────────────┐
│    Application      │
│    Components       │
└─────────┬───────────┘
          │ publish/subscribe
┌─────────▼───────────┐
│   EventBus Interface│
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  EventBus Adapters  │
├─────────────────────┤
│  LocalEventBus      │
│  RemoteEventBus     │
│  HybridEventBus     │
│  RetryableEventBus  │
└─────────────────────┘
```

## Implementation Components

### 1. EventBus Interface

The `EventBus` interface defines the contract for all event bus implementations:

```typescript
export interface EventBus {
  publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    metadata?: Record<string, any>,
  ): Promise<void>;

  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void;

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void;
}
```

### 2. LocalEventBus

The `LocalEventBus` implements in-memory, same-process event handling, optimized for modular monolith deployment:

```typescript
export class LocalEventBus implements EventBus {
  private handlers: Record<
    AppEvent,
    Array<(payload: any, metadata?: any) => void>
  > = {};

  publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    metadata?: Record<string, any>,
  ): Promise<void> {
    const eventHandlers = this.handlers[event] || [];

    for (const handler of eventHandlers) {
      try {
        handler(payload, metadata);
      } catch (error) {
        console.error(`Error handling event ${event}:`, error);
      }
    }

    return Promise.resolve();
  }

  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }

    this.handlers[event].push(handler);
  }

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    if (!this.handlers[event]) {
      return;
    }

    this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
  }
}
```

### 3. RemoteEventBus

The `RemoteEventBus` implements HTTP-based event distribution for microservices deployment:

```typescript
export class RemoteEventBus implements EventBus {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly eventsEndpoint: string = "/api/events",
  ) {}

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.apiClient.post(this.eventsEndpoint, {
      event,
      payload,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    });
  }

  // Subscribe and unsubscribe are implemented through WebSocket connection
  // This is a simplified version of the actual implementation
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    // Implementation details omitted for brevity
  }

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    // Implementation details omitted for brevity
  }
}
```

### 4. HybridEventBus

The `HybridEventBus` combines local and remote event handling for transitional architectures:

```typescript
export class HybridEventBus implements EventBus {
  constructor(
    private readonly localBus: LocalEventBus,
    private readonly remoteBus: RemoteEventBus,
    private readonly remoteEvents: Set<AppEvent> = new Set(),
  ) {}

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Always publish locally
    await this.localBus.publish(event, payload, metadata);

    // Publish remotely only for designated events
    if (this.remoteEvents.has(event)) {
      await this.remoteBus.publish(event, payload, metadata);
    }
  }

  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    this.localBus.subscribe(event, handler);

    if (this.remoteEvents.has(event)) {
      this.remoteBus.subscribe(event, handler);
    }
  }

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E], metadata?: any) => void,
  ): void {
    this.localBus.unsubscribe(event, handler);

    if (this.remoteEvents.has(event)) {
      this.remoteBus.unsubscribe(event, handler);
    }
  }
}
```

### 5. RetryableEventBus

The `RetryableEventBus` adds resilience with retry capabilities:

```typescript
export class RetryableEventBus implements EventBus {
  private pendingEvents: Array<{
    event: AppEvent;
    payload: any;
    metadata?: Record<string, any>;
    attempts: number;
    nextAttempt: number;
  }> = [];

  constructor(
    private readonly underlyingBus: EventBus,
    private readonly config: RetryConfig = {
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 60000,
      backoffFactor: 2,
      jitter: 0.1,
    },
  ) {
    this.startProcessing();
  }

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.underlyingBus.publish(event, payload, metadata);
    } catch (error) {
      // Queue for retry
      this.pendingEvents.push({
        event,
        payload,
        metadata,
        attempts: 1,
        nextAttempt: Date.now() + this.calculateDelay(1),
      });

      console.warn(`Event ${event} queued for retry. Error:`, error);
    }
  }

  // Retry calculation and processing logic omitted for brevity
}
```

## Event Schema Registry

The Event Schema Registry maintains type definitions and validation for all events:

```typescript
export enum AppEvent {
  // Authentication events
  USER_LOGGED_IN = "user.logged_in",
  USER_LOGGED_OUT = "user.logged_out",
  USER_REGISTERED = "user.registered",

  // Booking events
  BOOKING_CREATED = "booking.created",
  BOOKING_UPDATED = "booking.updated",
  BOOKING_CANCELLED = "booking.cancelled",
  BOOKING_APPROVED = "booking.approved",
  BOOKING_REJECTED = "booking.rejected",

  // Location events
  LOCATION_CREATED = "location.created",
  LOCATION_UPDATED = "location.updated",
  LOCATION_DELETED = "location.deleted",
  LOCATION_APPROVED = "location.approved",

  // Staff events
  STAFF_ASSIGNED = "staff.assigned",
  STAFF_UNASSIGNED = "staff.unassigned",
  STAFF_AVAILABILITY_CHANGED = "staff.availability_changed",

  // Notification events
  NOTIFICATION_CREATED = "notification.created",
  NOTIFICATION_READ = "notification.read",

  // System events
  SYSTEM_ERROR = "system.error",
  SYSTEM_WARNING = "system.warning",
  SYSTEM_INFO = "system.info",
}

export type EventPayload = {
  [AppEvent.USER_LOGGED_IN]: {
    userId: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
  // Other event payloads defined similarly
};
```

## Usage Examples

### Publishing Events

```typescript
// In a service or component
import { eventBus } from "@/app/services/event-bus";
import { AppEvent } from "@/shared/events";

async function createBooking(bookingData: BookingCreateDto): Promise<Booking> {
  // Create booking in the database
  const booking = await bookingRepository.create(bookingData);

  // Publish event
  await eventBus.publish(AppEvent.BOOKING_CREATED, {
    bookingId: booking.id,
    clientId: booking.clientId,
    eventDate: booking.eventDate,
    createdBy: booking.createdBy,
    timestamp: new Date().toISOString(),
  });

  return booking;
}
```

### Subscribing to Events

```typescript
// In a service initialization file
import { eventBus } from "@/app/services/event-bus";
import { AppEvent } from "@/shared/events";

function initializeNotificationSystem() {
  // Subscribe to booking events
  eventBus.subscribe(AppEvent.BOOKING_CREATED, async (payload) => {
    // Send notification to relevant users
    await notificationService.sendBookingCreatedNotification(
      payload.bookingId,
      payload.clientId,
    );
  });

  // Subscribe to other events
  // ...
}
```

## Implementation Status

| Component             | Status         | Notes                                                 |
| --------------------- | -------------- | ----------------------------------------------------- |
| Local Event Bus       | ✅ Completed   | Used for in-memory events in modular monolith         |
| Remote Event Bus      | ✅ Completed   | HTTP-based implementation for distributed services    |
| Hybrid Event Bus      | ✅ Completed   | Transitional implementation for migration             |
| Event Schema Registry | 🔄 In Progress | Initial implementation available for core events      |
| Event Tracing         | ✅ Completed   | OpenTelemetry integration for event observability     |
| Event Dashboard       | 🔄 In Progress | Basic visualization available, enhancing metrics      |
| Event Sourcing        | ✅ Completed   | Implemented for critical financial workflows          |
| Dead Letter Queue     | 📅 Planned     | Design complete, implementation scheduled for Q2 2025 |
| Retry Mechanism       | ✅ Completed   | Exponential backoff strategy implemented              |
| Event Migration Tools | 📅 Planned     | Scheduled for implementation in Q3 2025               |

## Future Enhancements

1. **Complete Event Schema Registry**

   - Implement full Zod validation for all event types
   - Add versioning support for events
   - Create automatic documentation generation

2. **Enhance Event Dashboard**

   - Add real-time event monitoring
   - Implement event replay capability
   - Create visualization for event flows

3. **Implement Dead Letter Queue**

   - Add support for handling failed events
   - Create admin interface for managing DLQ
   - Implement automatic retry from DLQ

4. **Develop Event Migration Tools**
   - Support for event schema evolution
   - Backward compatibility handling
   - Event transformation pipelines
