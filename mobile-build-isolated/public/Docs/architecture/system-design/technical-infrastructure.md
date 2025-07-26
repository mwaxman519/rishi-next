# Technical Infrastructure

This document describes the technical infrastructure components implemented in the Rishi platform to ensure reliability, resilience, and scalability.

## Table of Contents

1. [Message Bus/Event System](#message-busevent-system)

   - [Overview](#overview)
   - [Components](#components)
   - [Event Publishing](#event-publishing)
   - [Event Subscription](#event-subscription)
   - [Reliability Features](#reliability-features)
   - [Usage Examples](#usage-examples)

2. [Circuit Breaker Pattern](#circuit-breaker-pattern)

   - [Overview](#overview-1)
   - [States](#states)
   - [Configuration](#configuration)
   - [Fallbacks](#fallbacks)
   - [Health Monitoring](#health-monitoring)
   - [Usage Examples](#usage-examples-1)

3. [Service Health Monitoring](#service-health-monitoring)
   - [Overview](#overview-2)
   - [Health Status](#health-status)
   - [Monitoring Dashboard](#monitoring-dashboard)
   - [Alerts](#alerts)
   - [Integration with Circuit Breakers](#integration-with-circuit-breakers)

---

## Message Bus/Event System

### Overview

The Message Bus/Event System provides a robust mechanism for communication between services in our architecture. It enables loose coupling between components and supports asynchronous processing.

Our implementation includes:

- Event publishing with guaranteed delivery
- Advanced event subscription management
- Automatic retry logic for failed messages
- Dead letter queue for undeliverable messages
- Batch processing capabilities

### Components

The system consists of several key components:

1. **RetryableEventBus** (`app/services/infrastructure/messaging/retryableEventBus.ts`)

   - Enhances the standard event bus with reliability features
   - Persists messages to ensure delivery
   - Automatically retries failed deliveries
   - Tracks message states throughout their lifecycle

2. **EventSubscriber** (`app/services/infrastructure/messaging/eventSubscriber.ts`)

   - Provides advanced subscription management
   - Supports batch processing of events
   - Implements filtering
   - Handles retry logic for failed handlers

3. **Message Storage**
   - Interface for storing and retrieving messages
   - Implementations for in-memory and database persistence
   - Tracks message state and metadata

### Event Publishing

Events are published through the RetryableEventBus:

```typescript
// Publish an event with retry capability
await retryableBus.publish(
  "user.created", // Event type
  { id: "123", username: "johndoe", role: "user" }, // Payload
  {
    immediate: true, // Try to publish immediately
    maxRetries: 5, // Override default max retries
  },
);
```

Events are durably stored before attempting delivery, ensuring that no events are lost even if the system crashes.

### Event Subscription

Subscriptions can be registered to receive specific events:

```typescript
// Subscribe to an event
subscriber.subscribe(
  "user.created", // Event type
  async (payload, metadata) => {
    // Process the event payload
    console.log(`User created: ${payload.id} (${payload.username})`);
  },
  {
    // Optional subscription options
    retryCount: 3,
    retryDelayMs: 1000,
    filter: (event, payload) => payload.role !== "admin",
  },
);
```

Batch processing is also supported for higher throughput:

```typescript
// Subscribe to batch process events
subscriber.subscribeBatch(
  "availability.created",
  async (payloads, metadata) => {
    // Process multiple events at once
    console.log(`Processing ${payloads.length} availability records`);
  },
  {
    batchSize: 10,
    batchTimeoutMs: 30000, // Process after 30s even if not full
  },
);
```

### Reliability Features

The Message Bus implements several reliability features:

1. **Message Persistence**

   - Events are stored durably before processing
   - Message state is tracked (pending, processing, delivered, failed, dead-letter)
   - Recovery from crashes is automatic

2. **Automatic Retry**

   - Failed deliveries are retried automatically
   - Configurable retry policy (count, delay, backoff)
   - Dead letter queue for undeliverable messages

3. **Monitoring**
   - Tracks message delivery statistics
   - Monitors subscriber health
   - Provides visibility into the message pipeline

### Usage Examples

See `app/services/infrastructure/examples.ts` for complete usage examples of the Message Bus/Event System.

---

## Circuit Breaker Pattern

### Overview

The Circuit Breaker pattern prevents cascading failures by detecting when services are failing and temporarily blocking requests to allow recovery time. Our implementation provides:

- Detection of service failures
- Automatic temporary service isolation
- Fallback mechanisms
- Integration with health monitoring

### States

A circuit breaker has three states:

1. **CLOSED**

   - Normal operation
   - Requests pass through to the service
   - Failures are tracked

2. **OPEN**

   - Circuit is broken
   - Requests are blocked from reaching the service
   - Fallback is used (if provided)
   - Automatically transitions to HALF_OPEN after a timeout

3. **HALF_OPEN**
   - Testing if the service has recovered
   - Limited requests are allowed through
   - Success threshold returns to CLOSED
   - Any failure returns to OPEN

### Configuration

Circuit breakers are highly configurable:

```typescript
const circuitBreaker = new CircuitBreaker(
  "user-service", // Service name
  async (userId) => {
    // Protected function
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error("Service error");
    return await response.json();
  },
  {
    failureThreshold: 3, // Open after 3 failures
    resetTimeout: 30000, // Try half-open after 30s
    halfOpenSuccessThreshold: 2, // Close after 2 successes
    timeout: 2000, // 2s timeout for calls
    monitorInterval: 60000, // Check health every minute
    onStateChange: (from, to) => {
      console.log(`Circuit state changed from ${from} to ${to}`);
    },
  },
);
```

### Fallbacks

Fallbacks provide alternatives when a service is unavailable:

```typescript
const circuitBreaker = new CircuitBreaker(
  "user-service",
  getUserFromApi,
  circuitOptions,
  async (error, userId) => {
    // Fallback implementation
    console.log(`Using fallback for user ${userId}`);
    return getFromCache(userId) || { id: userId, name: "Unknown" };
  },
);
```

### Health Monitoring

Circuit breakers integrate with the Service Health Monitor:

```typescript
serviceHealthMonitor.registerService({
  id: "user-service",
  name: "User Management Service",
  description: "Handles user authentication and profiles",
  circuitBreaker: userServiceCircuitBreaker,
  tags: ["api", "auth"],
});
```

### Usage Examples

See `app/services/infrastructure/examples.ts` for complete usage examples of the Circuit Breaker pattern.

---

## Service Health Monitoring

### Overview

The Service Health Monitoring system provides centralized monitoring of service health across the platform. It features:

- Regular health checks of registered services
- Health status dashboard
- Alert mechanism for service degradation
- Integration with circuit breakers

### Health Status

Services can have one of four health statuses:

1. **HEALTHY** - Service is operating normally
2. **DEGRADED** - Service is experiencing issues but still functioning
3. **UNHEALTHY** - Service is unavailable or critically failing
4. **UNKNOWN** - Health status could not be determined

Health is determined through:

- Custom health check functions
- HTTP health endpoints
- Circuit breaker state
- Manual status updates

### Monitoring Dashboard

A comprehensive dashboard (`app/components/dashboard/ServiceHealthDashboard.tsx`) provides:

- Overall system health status
- Individual service health cards
- Circuit breaker state indicators
- Response time and uptime metrics
- Filtering by health status

### Alerts

The health monitoring system can trigger alerts:

```typescript
serviceHealthMonitor.setAlertConfig({
  enabled: true,
  handler: (serviceId, status, message) => {
    // Send alert
    notifyAdmins(`Service ${serviceId} is ${status}: ${message}`);
    // Log alert
    logAlert(serviceId, status, message);
  },
  minInterval: 60000, // Prevent alert storms
});
```

### Integration with Circuit Breakers

Health monitoring integrates with circuit breakers:

1. Circuit state changes update health status
2. Health status can influence circuit decisions
3. Combined reporting provides complete system visibility

---

## Implementation Details

For implementation details, see:

- `app/services/infrastructure/messaging/retryableEventBus.ts`
- `app/services/infrastructure/messaging/eventSubscriber.ts`
- `app/services/infrastructure/circuit-breaker/circuitBreaker.ts`
- `app/services/infrastructure/circuit-breaker/serviceHealthMonitor.ts`
- `app/components/dashboard/ServiceHealthDashboard.tsx`
- `app/services/infrastructure/examples.ts`
