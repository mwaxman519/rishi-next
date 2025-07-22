# Booking System: Conceptual Summary

## Key Entities and Relationships

### 1. Booking

A booking represents a client's request for brand activation services. It can be for a single event or a recurring series of events.

**Key Characteristics:**

- Created by client organizations
- Can be single or recurring (e.g., weekly staff training for 6 weeks)
- Contains all specification information
- Follows an approval workflow
- Acts as the container for one or multiple events
- Represents the contractual agreement

### 2. Event

An event is a specific scheduled occurrence of a booking. A single booking may generate multiple events.

**Key Characteristics:**

- Specific date and time window (e.g., 3-hour session on a specific day)
- Specific location
- Has its own execution status
- Managed primarily by Field Managers
- Contains one or more activities
- Staff check-in/check-out applies at the event level

### 3. Activity

An activity is a specific promotional action performed during an event.

**Key Characteristics:**

- Connected to a specific event
- Has defined type (e.g., product demo, sampling, training)
- Requires specific kit templates
- Has staff assignments
- Has measurable outcomes

## User Responsibilities

### Client User

- Creates and submits booking requests
- Specifies event details including:
  - Event type (promo, staff training, store visit, etc.)
  - Location selection
  - Date and time (single or recurring pattern)
  - Kit template selection
  - Number of staff needed
  - Expected outcomes
- Manages their booking requests
- Views reports on completed events

### Internal Admin

- Reviews and approves/rejects booking requests
- May request changes to client bookings
- Has oversight of all bookings and events
- Monitors system performance
- Handles invoicing based on completed events

### Field Manager

- Takes over events after booking approval
- Assigns appropriate staff to events
- Coordinates kit preparation and logistics
- Performs venue call-ahead confirmation
- Handles day-of-event issues and exceptions
- Ensures complete reporting on event execution
- Manages staff check-in/check-out

### Brand Agent

- Executes assigned activities during events
- Checks in/out at event location
- Follows activity guidelines
- Documents execution with photos/metrics
- Reports any issues to Field Manager

## Workflow States

### Booking States

1. **Draft** - Initial creation, not yet submitted
2. **Pending** - Submitted for review
3. **Changes Requested** - Needs client updates
4. **Approved** - Accepted and ready for execution
5. **Rejected** - Declined by internal admin
6. **Cancelled** - Called off after approval
7. **Completed** - All associated events finished

### Event States

1. **Scheduled** - Created from approved booking
2. **Confirmed** - Post venue call-ahead check
3. **In Progress** - Currently being executed
4. **Completed** - Execution finished
5. **Cancelled** - Called off before execution
6. **Reported** - Final metrics submitted

### Activity States

1. **Planned** - Created and associated with event
2. **Staffed** - Staff assigned to activity
3. **In Progress** - Currently being executed
4. **Completed** - Execution finished
5. **Reported** - Performance metrics submitted

## Data Relationships Overview

```
Organizations (1) --> (Many) Bookings (1) --> (Many) Events (1) --> (Many) Activities
                                                                       |
                                                                       V
Staff (Many) <----------------------------------------------------- (Many)

Kits (Many) <------------------------------------------------------- (Many)
```

## Key Considerations

1. **Recurring Events**

   - A single booking can generate multiple events based on a recurrence pattern
   - Each event in a series can be managed individually
   - Individual events can be rescheduled or cancelled without affecting the entire series

2. **Resource Allocation**

   - Staff assignments happen at the activity level
   - Kit templates are selected at the booking level
   - Actual kit instances are assigned at the event/activity level

3. **Reporting Path**

   - Metrics are collected at the activity level
   - Aggregated at the event level
   - Can be viewed across the entire booking series
   - Provides both individual occurrence and series-wide analytics

4. **Mobile Execution**

   - Field staff uses mobile interface for event management
   - Check-in/check-out functionality requires location verification
   - Photo documentation and metrics collection happens through mobile app
   - Real-time issue reporting and resolution tracking

5. **Budget Tracking**
   - Future implementation (longer-term roadmap)
   - Will track costs against allocated resources
   - Will provide financial reporting on ROI
   - Will support client invoicing based on executed events
