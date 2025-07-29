# Event Schema for Booking-Events Integration

## Overview

This document defines the event schema for the integration between the Booking and Events/Activities systems. Events are the primary mechanism for communication between different parts of the system, enabling loose coupling and scalable, asynchronous processing.

## Event Structure

All events in the system follow this standard structure:

```typescript
interface BaseEvent<T> {
  id: string; // Unique identifier for the event instance
  type: EventType; // Type of event from the EventType enum
  timestamp: string; // ISO 8601 timestamp of when the event was created
  correlationId: string; // ID for tracking related events (often a booking or event ID)
  source: string; // Component that generated the event
  payload: T; // Type-specific payload data
  metadata?: {
    // Optional additional contextual information
    userId?: string; // User who triggered the event, if applicable
    requestId?: string; // Request ID for tracing
    version?: string; // Schema version
    [key: string]: any; // Additional metadata
  };
}
```

## Event Types

### 1. Booking Events

#### `BOOKING_CREATED`

Fired when a booking is initially created (often in draft state).

```typescript
interface BookingCreatedPayload {
  bookingId: string;
  clientId: string;
  title: string;
  status: "draft";
  createdBy: string;
}
```

#### `BOOKING_SUBMITTED`

Fired when a booking is submitted for review.

```typescript
interface BookingSubmittedPayload {
  bookingId: string;
  clientId: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  eventDates: string[]; // ISO dates of requested events
  recurrencePattern?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate: string;
  };
}
```

#### `BOOKING_APPROVED`

Fired when a booking is approved by an internal admin.

```typescript
interface BookingApprovedPayload {
  bookingId: string;
  clientId: string;
  title: string;
  approvedBy: string;
  approvedAt: string;
  notes?: string;
  eventDates: string[]; // ISO dates of approved events
}
```

#### `BOOKING_REJECTED`

Fired when a booking is rejected.

```typescript
interface BookingRejectedPayload {
  bookingId: string;
  clientId: string;
  rejectedBy: string;
  rejectedAt: string;
  reason: string;
  allowResubmission: boolean;
}
```

#### `BOOKING_CHANGES_REQUESTED`

Fired when changes are requested for a booking.

```typescript
interface BookingChangesRequestedPayload {
  bookingId: string;
  clientId: string;
  requestedBy: string;
  requestedAt: string;
  changes: {
    field: string;
    reason: string;
    suggestedValue?: string;
  }[];
}
```

#### `BOOKING_CANCELLED`

Fired when a booking is cancelled.

```typescript
interface BookingCancelledPayload {
  bookingId: string;
  clientId: string;
  cancelledBy: string;
  cancelledAt: string;
  reason: string;
  affectedEventIds: string[];
}
```

#### `BOOKING_UPDATED`

Fired when booking details are updated.

```typescript
interface BookingUpdatedPayload {
  bookingId: string;
  clientId: string;
  updatedBy: string;
  updatedAt: string;
  changedFields: string[];
  needsReapproval: boolean;
}
```

### 2. Event Instance Events

#### `EVENT_INSTANCES_GENERATED`

Fired when event instances are generated from an approved booking.

```typescript
interface EventInstancesGeneratedPayload {
  bookingId: string;
  clientId: string;
  eventIds: string[];
  generatedBy: string;
  generatedAt: string;
  totalEvents: number;
}
```

#### `EVENT_ASSIGNED_TO_MANAGER`

Fired when an event is assigned to a field manager.

```typescript
interface EventAssignedToManagerPayload {
  eventId: string;
  bookingId: string;
  managerId: string;
  assignedBy: string;
  assignedAt: string;
  eventDate: string;
  location: {
    id: string;
    name: string;
    address: string;
  };
}
```

#### `EVENT_PREPARATION_STARTED`

Fired when preparation for an event begins.

```typescript
interface EventPreparationStartedPayload {
  eventId: string;
  bookingId: string;
  startedBy: string;
  startedAt: string;
  preparationTasks: {
    id: string;
    description: string;
    assignedTo?: string;
    dueDate: string;
  }[];
}
```

#### `EVENT_READY`

Fired when all preparation tasks for an event are complete.

```typescript
interface EventReadyPayload {
  eventId: string;
  bookingId: string;
  readyBy: string;
  readyAt: string;
  staffAssigned: boolean;
  kitsAssigned: boolean;
  logisticsConfirmed: boolean;
  venueConfirmed: boolean;
}
```

#### `EVENT_STARTED`

Fired when an event begins execution.

```typescript
interface EventStartedPayload {
  eventId: string;
  bookingId: string;
  startedBy: string;
  startedAt: string;
  location: {
    id: string;
    name: string;
  };
  staffPresent: {
    userId: string;
    role: string;
    checkedInAt: string;
  }[];
}
```

#### `EVENT_COMPLETED`

Fired when an event is marked as complete.

```typescript
interface EventCompletedPayload {
  eventId: string;
  bookingId: string;
  completedBy: string;
  completedAt: string;
  actualStartTime: string;
  actualEndTime: string;
  staffParticipated: {
    userId: string;
    role: string;
    hoursWorked: number;
  }[];
  outcomes: {
    metExpectations: boolean;
    metrics: Record<string, number>;
    notes: string;
  };
}
```

#### `EVENT_CANCELLED`

Fired when an event is cancelled.

```typescript
interface EventCancelledPayload {
  eventId: string;
  bookingId: string;
  cancelledBy: string;
  cancelledAt: string;
  reason: string;
  notifyClient: boolean;
}
```

#### `EVENT_RESCHEDULED`

Fired when an event is rescheduled.

```typescript
interface EventRescheduledPayload {
  eventId: string;
  bookingId: string;
  rescheduledBy: string;
  rescheduledAt: string;
  originalDate: string;
  newDate: string;
  reason: string;
  notifyStaff: boolean;
  notifyClient: boolean;
}
```

#### `EVENT_ISSUE_REPORTED`

Fired when an issue with an event is reported.

```typescript
interface EventIssueReportedPayload {
  eventId: string;
  bookingId: string;
  reportedBy: string;
  reportedAt: string;
  issueType: "venue" | "staff" | "kit" | "logistics" | "client" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  immediateActionTaken?: string;
}
```

### 3. Activity Events

#### `ACTIVITY_CREATED`

Fired when an activity is created for an event.

```typescript
interface ActivityCreatedPayload {
  activityId: string;
  eventId: string;
  bookingId: string;
  createdBy: string;
  createdAt: string;
  activityType: string;
  description: string;
  duration: number; // in minutes
  requiredKitTemplateIds: string[];
  requiredStaffRoles: string[];
}
```

#### `ACTIVITY_ASSIGNED`

Fired when staff is assigned to an activity.

```typescript
interface ActivityAssignedPayload {
  activityId: string;
  eventId: string;
  assignmentId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  role: string;
  instructions?: string;
}
```

#### `ACTIVITY_STARTED`

Fired when an activity begins execution.

```typescript
interface ActivityStartedPayload {
  activityId: string;
  eventId: string;
  startedBy: string;
  startedAt: string;
  kitsInUse: string[];
  staffExecuting: string[];
}
```

#### `ACTIVITY_COMPLETED`

Fired when an activity is marked as complete.

```typescript
interface ActivityCompletedPayload {
  activityId: string;
  eventId: string;
  completedBy: string;
  completedAt: string;
  outcomes: {
    metrics: Record<string, number>;
    notes: string;
    photoUrls?: string[];
  };
}
```

#### `ACTIVITY_ISSUE_REPORTED`

Fired when an issue with an activity is reported.

```typescript
interface ActivityIssueReportedPayload {
  activityId: string;
  eventId: string;
  reportedBy: string;
  reportedAt: string;
  issueType: string;
  description: string;
  impactLevel: "minor" | "moderate" | "major";
  photoUrls?: string[];
}
```

### 4. Staff Assignment Events

#### `STAFF_ASSIGNMENT_CREATED`

Fired when a staff assignment is created.

```typescript
interface StaffAssignmentCreatedPayload {
  assignmentId: string;
  eventId: string;
  activityId?: string;
  userId: string;
  role: string;
  createdBy: string;
  createdAt: string;
  startTime: string;
  endTime: string;
  instructions?: string;
}
```

#### `STAFF_ASSIGNMENT_OFFERED`

Fired when a staff assignment is offered to a brand agent.

```typescript
interface StaffAssignmentOfferedPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  offeredAt: string;
  offeredBy: string;
  responseDeadline: string;
  location: {
    id: string;
    name: string;
    address: string;
  };
  compensation?: {
    rate: number;
    currency: string;
    estimatedHours: number;
  };
}
```

#### `STAFF_ASSIGNMENT_ACCEPTED`

Fired when a brand agent accepts an assignment.

```typescript
interface StaffAssignmentAcceptedPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  acceptedAt: string;
  notes?: string;
}
```

#### `STAFF_ASSIGNMENT_REJECTED`

Fired when a brand agent rejects an assignment.

```typescript
interface StaffAssignmentRejectedPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  rejectedAt: string;
  reason: string;
  isAvailableForFuture: boolean;
}
```

#### `STAFF_CHECKED_IN`

Fired when a staff member checks in to an event.

```typescript
interface StaffCheckedInPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  checkedInAt: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  verificationMethod: "gps" | "qrcode" | "manager" | "other";
}
```

#### `STAFF_CHECKED_OUT`

Fired when a staff member checks out from an event.

```typescript
interface StaffCheckedOutPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  checkedOutAt: string;
  hoursWorked: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  feedback?: string;
}
```

#### `STAFF_NO_SHOW`

Fired when a staff member fails to show up for an assignment.

```typescript
interface StaffNoShowPayload {
  assignmentId: string;
  eventId: string;
  userId: string;
  reportedBy: string;
  reportedAt: string;
  consequenceLevel: "warning" | "penalty" | "removal";
  notes?: string;
}
```

### 5. Kit Management Events

#### `KIT_ASSIGNED_TO_ACTIVITY`

Fired when a kit is assigned to an activity.

```typescript
interface KitAssignedToActivityPayload {
  kitAssignmentId: string;
  activityId: string;
  eventId: string;
  kitTemplateId: string;
  kitInstanceId?: string; // May be null if not assigned yet
  assignedBy: string;
  assignedAt: string;
  quantity: number;
  notes?: string;
}
```

#### `KIT_PREPARED`

Fired when a kit has been prepared for an event.

```typescript
interface KitPreparedPayload {
  kitAssignmentId: string;
  activityId: string;
  eventId: string;
  kitInstanceId: string;
  preparedBy: string;
  preparedAt: string;
  components: {
    id: string;
    name: string;
    quantity: number;
    condition: "excellent" | "good" | "fair" | "poor";
  }[];
  notes?: string;
}
```

#### `KIT_CHECKED_OUT`

Fired when a kit is checked out for use.

```typescript
interface KitCheckedOutPayload {
  kitAssignmentId: string;
  activityId: string;
  eventId: string;
  kitInstanceId: string;
  checkedOutBy: string;
  checkedOutAt: string;
  checkedOutTo: string;
  expectedReturnDate: string;
}
```

#### `KIT_RETURNED`

Fired when a kit is returned after an event.

```typescript
interface KitReturnedPayload {
  kitAssignmentId: string;
  activityId: string;
  eventId: string;
  kitInstanceId: string;
  returnedBy: string;
  returnedAt: string;
  receivedBy: string;
  condition: "excellent" | "good" | "fair" | "poor" | "damaged";
  missingComponents?: string[];
  damagedComponents?: {
    id: string;
    description: string;
    severity: "minor" | "moderate" | "severe";
  }[];
  notes?: string;
}
```

#### `KIT_ISSUE_REPORTED`

Fired when an issue with a kit is reported.

```typescript
interface KitIssueReportedPayload {
  kitAssignmentId: string;
  activityId: string;
  eventId: string;
  kitInstanceId: string;
  reportedBy: string;
  reportedAt: string;
  issueType: "missing" | "damaged" | "insufficient" | "quality" | "other";
  description: string;
  impactLevel: "minor" | "moderate" | "major";
  photoUrls?: string[];
  needsImmediate: boolean;
}
```

### 6. Location Events

#### `LOCATION_CONFIRMED`

Fired when a location is confirmed for an event.

```typescript
interface LocationConfirmedPayload {
  eventId: string;
  locationId: string;
  confirmedBy: string;
  confirmedAt: string;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
  };
  specialInstructions?: string;
  accessDetails?: string;
}
```

#### `LOCATION_ISSUE_REPORTED`

Fired when an issue with a location is reported.

```typescript
interface LocationIssueReportedPayload {
  eventId: string;
  locationId: string;
  reportedBy: string;
  reportedAt: string;
  issueType: "access" | "facilities" | "space" | "safety" | "other";
  description: string;
  impactLevel: "minor" | "moderate" | "major";
  photoUrls?: string[];
  needsImmediate: boolean;
}
```

## Event Routing

Events are routed based on their type to appropriate handlers. The following diagram illustrates the primary event routing patterns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   BOOKING       │     │     EVENT       │     │    ACTIVITY     │
│    EVENTS       │────►│    EVENTS       │────►│     EVENTS      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  NOTIFICATION   │     │    WORKFLOW     │     │   REPORTING     │
│    HANDLERS     │     │    HANDLERS     │     │    HANDLERS     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Implementation Guidelines

When implementing event handlers, follow these guidelines:

1. **Idempotency**: Handlers must be idempotent (can safely be called multiple times)
2. **Error Handling**: Implement proper error handling and retries
3. **Event Validation**: Validate event structure and payload before processing
4. **Loose Coupling**: Keep handlers focused on specific responsibilities
5. **Audit Trail**: Log all event processing for audit purposes
6. **Performance**: Design handlers to be performant, especially for high-volume events

## Event Storage

Critical events should be stored for audit and recovery purposes:

1. **Event Log**: All events are stored in a dedicated event log
2. **Retention Policy**: Events are retained according to the following policy:
   - Booking events: 7 years
   - Event instance events: 3 years
   - Activity events: 1 year
   - Staff assignment events: 3 years
   - Kit management events: 1 year

## Event Monitoring

The event system includes monitoring capabilities:

1. **Event Throughput**: Monitor the rate of events processed
2. **Processing Latency**: Track time from event emission to handler completion
3. **Error Rates**: Monitor handler errors and retries
4. **Event Backlog**: Track unprocessed event queue length
