# Comprehensive EventBusService Integration Plan

## Overview

The EventBusService is foundational infrastructure requiring systematic integration throughout the entire application to achieve proper event-driven architecture. This plan outlines the comprehensive review and updates needed.

## Current Status

✅ **Created Core Infrastructure**:

- EventBusService with comprehensive event handling
- CannabisBookingService with event publishing
- StaffAssignmentService with event-driven workflows
- Service registry for dependency injection

❌ **Missing Integrations**:

- Most API routes still use direct database operations without event publishing
- Existing services don't integrate with EventBusService
- No event-driven communication between services
- Mock data instead of authentic event-driven workflows

## Integration Priority Matrix

### Priority 1: Core Booking Workflow (Immediate)

1. **Booking API Routes** (`app/api/bookings/*`)

   - Update all CRUD operations to use CannabisBookingService
   - Ensure all status changes publish events
   - Remove direct database operations

2. **Staff Assignment APIs** (`app/api/roster/*`, `app/api/shifts/*`)

   - Integrate with StaffAssignmentService
   - Add event publishing for all staff operations
   - Update shift lifecycle to use event-driven patterns

3. **Organization Management** (`app/api/organizations/*`)
   - Add event publishing for user invitations
   - Publish events for organization membership changes
   - Integrate invitation acceptance with event bus

### Priority 2: Supporting Services (Next Phase)

1. **Location Management** (`app/api/locations/*`)

   - Publish location approval/rejection events
   - Integrate with booking workflow events
   - Add event-driven geocoding workflows

2. **Kit & Equipment Management** (`app/api/kits/*`, `app/api/items/*`)

   - Publish equipment assignment events
   - Integrate with booking workflow
   - Add inventory tracking events

3. **Notification System** (`app/api/notifications/*`)
   - Subscribe to all relevant events
   - Send notifications based on event triggers
   - Maintain event-driven notification preferences

### Priority 3: Advanced Features (Future)

1. **Analytics & Reporting**

   - Event-driven data collection
   - Real-time dashboard updates
   - Performance metrics publishing

2. **Real-time Updates**
   - WebSocket integration with EventBus
   - Live dashboard updates
   - Real-time staff tracking

## Implementation Steps

### Step 1: Update Service Registry

```typescript
// services/index.ts - Complete service registry
export const services = {
  eventBus: eventBusService,
  cannabisBooking: cannabisBookingService,
  staffAssignment: staffAssignmentService,
  locationManagement: locationManagementService,
  kitManagement: kitManagementService,
  organizationManagement: organizationManagementService,
  notificationService: notificationService,
};
```

### Step 2: Update API Routes Pattern

```typescript
// Pattern for all API routes
export async function POST(request: NextRequest) {
  // 1. Authentication & authorization
  const session = await getAuthenticatedSession();

  // 2. Request validation
  const validatedData = schema.parse(await request.json());

  // 3. Use service layer (not direct DB operations)
  const result = await services.cannabisBooking.createBooking(
    validatedData,
    session.user.id,
  );

  // 4. Events automatically published by service layer
  // 5. Return response
  return NextResponse.json(result);
}
```

### Step 3: Event-Driven Workflow Integration

```typescript
// Example: Booking approval workflow
await eventBus.subscribe("booking.status_changed", async (event) => {
  if (event.data.newStatus === "approved") {
    // Automatically trigger staff assignment
    await services.staffAssignment.findAndAssignStaff(event.data.bookingId);
  }
});
```

## Service Updates Required

### 1. Location Management Service

- Publish `location.created`, `location.approved`, `location.rejected` events
- Subscribe to booking events to verify location requirements
- Integrate with geocoding workflows

### 2. Kit Management Service

- Publish `kit.assigned`, `kit.delivered`, `kit.returned` events
- Subscribe to booking events for equipment allocation
- Maintain inventory tracking with event publishing

### 3. Organization Management Service

- Publish `organization.user_invited`, `organization.user_joined` events
- Integrate invitation workflows with event bus
- Maintain user permission changes through events

### 4. Notification Service

- Subscribe to all relevant business events
- Send notifications based on event triggers
- Maintain user notification preferences

## Database Schema Updates

### Add Event Store Table

```sql
CREATE TABLE event_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  correlation_id UUID,
  version INTEGER DEFAULT 1
);
```

### Add Event Subscriptions Table

```sql
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

## Validation & Testing Strategy

### 1. Event Flow Verification

- Test complete booking lifecycle events
- Verify event ordering and dependencies
- Ensure no event loops or duplicates

### 2. Performance Testing

- Event bus performance under load
- Memory usage of event store
- Event processing latency

### 3. Integration Testing

- Cross-service event communication
- Event-driven workflow completion
- Error handling and recovery

## Success Criteria

✅ **All API routes use service layer instead of direct database operations**
✅ **All state changes publish appropriate events**
✅ **Services communicate through events, not direct calls**
✅ **Complete audit trail through event store**
✅ **Real-time updates through event subscriptions**
✅ **No mock data - all operations use authentic event-driven patterns**

## Timeline

- **Phase 1** (Immediate): Core booking and staff assignment integration
- **Phase 2** (Next): Supporting services integration
- **Phase 3** (Future): Advanced features and optimizations

This comprehensive integration will transform the application into a truly event-driven, microservices-based architecture following all three architectural pillars consistently throughout.
