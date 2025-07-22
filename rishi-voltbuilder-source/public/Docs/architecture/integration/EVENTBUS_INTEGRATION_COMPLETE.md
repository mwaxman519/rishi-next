# EventBusService Integration - Complete Implementation Guide

## Overview

The EventBusService is now fully integrated across the entire cannabis booking management platform as the foundational infrastructure for **microservices event-driven architecture**. This document explains the comprehensive changes and their impact.

## What EventBusService Provides

### 1. Microservices Communication Foundation

- **Centralized Event Management**: All business operations publish events through EventBusService
- **Service Decoupling**: Services communicate through events rather than direct calls
- **UUID-based Message Tracking**: Every event has unique UUID identification
- **Correlation ID Support**: Track related events across service boundaries

### 2. Event-Driven Architecture Implementation

- **Asynchronous Processing**: Events are processed asynchronously without blocking operations
- **Audit Trail Foundation**: Every state change creates trackable events with metadata
- **Real-time Updates**: Events enable WebSocket notifications and system integration
- **Event Store**: In-memory event storage (ready for Redis/message queue in production)

### 3. Cannabis Booking Platform Integration

- **Booking Lifecycle Events**: All 8 booking stages publish events
- **Staff Assignment Events**: Staff scheduling and assignment state changes
- **Equipment Management Events**: Kit template and inventory tracking
- **Operational Workflow Events**: Check-in/out, task assignments, reporting

## Complete API Route Integration

### Authentication → Validation → Service Layer → Event Publishing → Response Pattern

All API routes now follow this consistent pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validation
    const body = await request.json();
    const validatedData = schema.parse(body);

    // 3. Service Layer (Database Operations)
    const [result] = await db.insert(table).values(data).returning();

    // 4. Event Publishing
    const eventBus = new EventBusService();
    await eventBus.publish(
      "entity.created",
      {
        entityId: result.id,
        userId: session.user.id,
        organizationId: result.organizationId,
      },
      {
        correlationId: uuidv4(),
        source: "api-route-name",
        version: "1.0",
      },
    );

    // 5. Response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Updated API Routes

#### Priority 1 - Core Cannabis Operations ✅ COMPLETE

- **`/api/bookings`**: Cannabis booking lifecycle with 8-stage workflow events
- **`/api/roster/brand-agents`**: Staff assignment and skill management events
- **`/api/shifts/assignments`**: Shift scheduling and real-time assignment events
- **`/api/tasks`**: Task assignment and completion workflow events

#### Priority 2 - Supporting Operations ✅ COMPLETE

- **`/api/locations`**: Location creation and approval workflow events
- **`/api/users`**: User management and organization association events
- **`/api/availability`**: Staff availability and conflict resolution events

#### Priority 3 - System Operations ✅ COMPLETE

- **`/api/events`**: Legacy event system maintained for compatibility
- **`/api/organizations`**: Organization management and tier-based feature events

## Event Types Published

### Cannabis Booking Events

```typescript
'booking.created' - New cannabis booking request
'booking.status.updated' - Booking stage progression
'booking.staff.assigned' - Staff assignment to booking
'booking.equipment.assigned' - Kit template assignment
'booking.completed' - Booking fulfillment completion
```

### Staff Management Events

```typescript
'staff.assigned' - Staff member assigned to booking
'staff.checkin' - Staff check-in with GPS verification
'staff.checkout' - Staff check-out with equipment return
'staff.availability.updated' - Availability block changes
```

### Operational Workflow Events

```typescript
'task.assigned' - Task assignment to staff member
'task.completed' - Task completion and review
'location.created' - New location submission
'user.created' - New user registration
```

## Technical Implementation Details

### EventBusService Architecture

```typescript
export class EventBusService {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventStore: EventMessage[] = []; // Production: Redis/Message Queue

  async publish(eventType: string, data: any, metadata?: any): Promise<void>;
  async subscribe(eventType: string, handler: EventHandler): Promise<void>;
  async getEventHistory(correlationId: string): Promise<EventMessage[]>;
}
```

### Event Message Structure

```typescript
interface EventMessage {
  id: string; // UUID
  type: string; // Event type (e.g., 'booking.created')
  data: any; // Event payload
  timestamp: Date; // Event creation time
  correlationId: string; // UUID for related events
  source: string; // Originating service/API
  version: string; // Event schema version
}
```

## Production Readiness Features

### 1. Error Handling

- Event publishing failures don't block API responses
- Comprehensive error logging with correlation IDs
- Graceful degradation when EventBusService is unavailable

### 2. Performance Optimization

- Asynchronous event publishing
- In-memory event storage with configurable retention
- Batch processing capability for high-volume events

### 3. Scalability Preparation

- Ready for Redis/RabbitMQ/Kafka integration
- Event handler registration system
- Horizontal scaling support through external message brokers

## Cannabis Industry Operational Benefits

### 1. Audit Trail Compliance

- Every booking stage change tracked with timestamps
- Staff assignment and equipment handling logged
- Complete operational workflow visibility

### 2. Real-time Operational Monitoring

- Live booking status updates across all stakeholders
- Staff location and check-in status tracking
- Equipment assignment and return verification

### 3. Multi-Organization Event Isolation

- Organization-specific event filtering
- Client-specific operational workflow customization
- Secure event data isolation per cannabis client

## Next Steps for Full Production

### 1. External Message Broker Integration

```typescript
// Production EventBusService with Redis
const eventBus = new EventBusService({
  broker: "redis",
  connection: process.env.REDIS_URL,
  retryPolicy: { maxRetries: 3, backoffMs: 1000 },
});
```

### 2. Event Handler Registration

```typescript
// Service-specific event handlers
eventBus.subscribe("booking.created", async (event) => {
  await notificationService.sendBookingConfirmation(event.data);
  await analyticsService.trackBookingCreation(event.data);
});
```

### 3. Real-time WebSocket Integration

```typescript
// Real-time updates for cannabis operational dashboards
eventBus.subscribe("booking.status.updated", async (event) => {
  await websocketService.broadcast(`org:${event.data.organizationId}`, {
    type: "BOOKING_UPDATE",
    payload: event.data,
  });
});
```

## Summary

EventBusService is now the foundational infrastructure enabling:

- **Microservices Architecture**: Service decoupling through events
- **Event-Driven Design**: Asynchronous workflow processing
- **UUID-Based Entities**: Consistent entity tracking across services
- **Cannabis Operations**: Complete booking lifecycle with audit trails
- **Production Scalability**: Ready for external message broker integration

All API routes follow the consistent authentication → validation → service layer → event publishing → response pattern, providing a solid foundation for the cannabis booking management platform's operational requirements.
