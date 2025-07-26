# Event System Architecture

## Overview

This directory contains comprehensive documentation about the event-driven architecture implemented in the Rishi Workforce Management platform. The event system is a critical infrastructure component that enables loose coupling between services, real-time updates, and scalable, resilient communication patterns.

## Contents

- [Event Bus Implementation](event-bus-implementation.md) - Detailed implementation of the event bus infrastructure
- [WebSocket Events](../../events/websocket-events.md) - Documentation for WebSocket-based real-time events
- [Event System Integration](../../events/event-system-integration.md) - How to integrate with the event system
- [Event Types Reference](../../events/event-types-reference.md) - Complete reference of all event types

## Core Components

The event system consists of several key components:

### 1. Event Bus

The Event Bus is the central messaging infrastructure that enables publish/subscribe communication patterns across the application. It supports both in-process communication and distributed messaging across services.

**Key Features**:

- Multiple implementation strategies (Local, Remote, Hybrid)
- Type-safe event definitions
- Retryable event publishing with exponential backoff
- Event tracing for debugging and monitoring
- Support for both synchronous and asynchronous handlers

### 2. Event Types

The system defines a comprehensive set of event types organized by domain:

- **Authentication Events**: User login, logout, registration
- **Booking Events**: Booking creation, updates, approvals
- **Location Events**: Location creation, updates, approvals
- **Staff Events**: Staff assignments, availability changes
- **Notification Events**: Message creation, delivery, reading
- **System Events**: Errors, warnings, metrics

### 3. Event Handlers

Event handlers process specific event types and execute business logic in response:

- **Notification Handlers**: Send emails, in-app notifications
- **Integration Handlers**: Sync data with external systems
- **Audit Handlers**: Log important events for compliance
- **Cache Handlers**: Invalidate or update cached data
- **Workflow Handlers**: Trigger workflow state transitions

### 4. WebSocket Integration

The event system integrates with WebSocket technology to enable real-time updates to clients:

- Browser clients connect via WebSocket
- Server publishes relevant events to connected clients
- Clients update UI in response to events
- Reconnection and recovery mechanisms

## Implementation Status - EventBusService (June 17, 2025)

| Component               | Status                  | Notes                                                                      |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------- |
| EventBusService Core    | ✅ Completed            | Foundational microservices communication infrastructure                    |
| API Route Integration   | ✅ Completed            | All routes follow authentication → validation → service → event → response |
| Cannabis Booking Events | ✅ Completed            | Complete 8-stage booking lifecycle event publishing                        |
| Staff Assignment Events | ✅ Completed            | Real-time staff scheduling and assignment tracking                         |
| UUID-Based Tracking     | ✅ Completed            | All events use UUID identification and correlation IDs                     |
| Event Store (In-Memory) | ✅ Completed            | Ready for Redis/RabbitMQ production deployment                             |
| Error Handling          | ✅ Completed            | Graceful degradation and comprehensive error logging                       |
| Audit Trail Foundation  | ✅ Completed            | Complete event history with correlation tracking                           |
| Event Schema Registry   | 📅 Ready for Production | Initial implementation supports cannabis operations                        |
| External Message Broker | 📅 Production Ready     | Architecture supports Redis/RabbitMQ integration                           |

## Architecture Decisions

### 1. Multiple Event Bus Implementations

The system provides different event bus implementations to support various deployment scenarios:

- **LocalEventBus**: Optimized for monolithic deployment with in-memory message passing
- **RemoteEventBus**: Supports distributed deployment with HTTP-based message passing
- **HybridEventBus**: Combines local and remote messaging for transition periods

### 2. Type Safety

The event system uses TypeScript's type system to ensure type safety:

- Event types are defined as an enum
- Event payloads are mapped to their respective types
- Handlers receive strongly-typed payloads
- The compiler catches type mismatches at build time

### 3. Resilience Patterns

The event system implements several resilience patterns:

- **Retry with Exponential Backoff**: Failed publishes are retried with increasing delays
- **Circuit Breaker**: Prevents cascading failures when downstream services are unhealthy
- **Dead Letter Queue**: (Planned) Captures events that cannot be processed
- **Event Sourcing**: Critical workflows store all events for replay and recovery

## Usage Patterns

### Publishing Events

```typescript
import { eventBus } from "@/app/services/event-bus";
import { AppEvent } from "@/shared/events";

// Publish an event
await eventBus.publish(AppEvent.BOOKING_CREATED, {
  bookingId: "123",
  clientId: "456",
  timestamp: new Date().toISOString(),
});
```

### Subscribing to Events

```typescript
import { eventBus } from "@/app/services/event-bus";
import { AppEvent } from "@/shared/events";

// Subscribe to an event
eventBus.subscribe(AppEvent.BOOKING_CREATED, async (payload) => {
  console.log(`Booking ${payload.bookingId} created`);
  // Handle the event
});
```

## Best Practices

1. **Keep Events Meaningful**: Design events to represent significant state changes in the system
2. **Right-Size Event Payloads**: Include enough data for handlers to process the event without fetching
3. **Idempotent Handlers**: Design handlers to be idempotent (can be executed multiple times safely)
4. **Domain-Driven Events**: Align event definitions with domain concepts
5. **Error Handling**: Implement proper error handling in event handlers
6. **Performance Considerations**: Be mindful of the performance impact of event processing

## Future Roadmap

1. Complete the Event Schema Registry with Zod validation
2. Enhance the Event Dashboard with real-time monitoring
3. Implement the Dead Letter Queue for failed events
4. Develop Event Migration Tools for schema evolution
5. Add more sophisticated event routing based on context

For implementation details, refer to [Event Bus Implementation](event-bus-implementation.md).
