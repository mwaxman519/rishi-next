# Updated Bookings & Events System Architecture

## Revised Conceptual Model

### Core Concepts

1. **Booking**:

   - A client request for brand activation(s)
   - Can represent a single event or recurring series of events
   - Contains all details needed to plan and execute events
   - Has a lifecycle from creation through approval/rejection to completion

2. **Event**:

   - A specific occurrence of an approved booking
   - Single events have a 1:1 relationship with bookings
   - Recurring bookings generate multiple event occurrences
   - Each event has a specific date, time window, and location
   - Transitions through states: scheduled → in-progress → completed

3. **Activity**:

   - Specific promotional actions performed during an event
   - Multiple activities can be associated with a single event
   - Each has defined execution parameters, staff assignments, and resources

4. **Resource Allocation**:
   - Staff hours required for event execution
   - Kit templates selected for the activities
   - Equipment and materials needed
   - _Note: Budget allocation to be implemented in future phases_

## User Role Responsibilities

### Client User

1. **Event Request & Specification**:

   - Select event type (promo, staff training, store visit, etc.)
   - Choose single occurrence or recurring pattern
   - Specify location(s)
   - Select kit template(s) to be used
   - Define number of Rishi staff needed
   - Specify promotional details & expected outcomes
   - _Not responsible for: staff selection, logistics planning_

2. **Booking Management**:
   - View all requested bookings and their status
   - Modify pending booking requests
   - Cancel upcoming events if needed
   - View reports and outcomes from completed events

### Field Manager

1. **Execution Planning**:

   - Assign appropriate staff to approved events
   - Coordinate kit preparation and resource allocation
   - Contact venue to confirm event details ("call-ahead")
   - Plan logistics for event execution
   - _Not responsible for: initial event planning/booking_

2. **Issue Management**:

   - Address turnaways, kit issues, venue problems
   - Re-assign staff as needed for absences
   - Document issues and resolution steps
   - Ensure complete activity reporting

3. **Venue Coordination**:
   - Pre-event confirmation with location
   - Ensure venue readiness for brand activation
   - Facilitate any special requirements
   - Maintain venue relationship management

### Internal Admin

1. **Booking Approval**:

   - Review client booking requests
   - Check resource availability and feasibility
   - Approve, request changes, or reject bookings
   - Ensure alignment with service agreements

2. **Oversight & Reporting**:
   - Monitor overall booking and event status
   - Track completion rates and performance
   - Generate client reports and analytics
   - Review issues and resolution patterns

## Data Model Relationships

```
Organizations (1) --> (Many) Bookings (1) --> (Many) Event Occurrences (1) --> (Many) Activities
Activities (Many) <-- (Many) Brand Agents (per occurrence)
Activities (Many) <-- (Many) Kits (per occurrence)
Locations (1) <-- (Many) Event Occurrences
```

### Key Entity Details

#### Booking

- Title and description
- Client organization reference
- Event type (promo, training, store visit, etc.)
- Pattern (single or recurring with frequency)
- Status (pending, approved, rejected, completed)
- Start/end dates (for recurring series)
- Notes and special requirements
- Approval information
- Created by/at information

#### Event Occurrence

- Reference to parent booking
- Specific date and time window (e.g., 3-hour slot)
- Location reference
- Status (scheduled, in-progress, completed, canceled)
- Assigned staff
- Specific resources
- Check-in/check-out information
- Completion details and metrics

#### Activity

- Reference to event occurrence
- Activity type
- Required kit template
- Execution details
- Target outcomes
- Actual results and metrics
- Staff assignments

## Booking Form Requirements

The booking form should collect the following information:

1. **Basic Information**:

   - Event title
   - Date(s) and time(s)
   - Single or recurring pattern
   - Location(s)
   - Primary contact

2. **Event Classification**:

   - Event type selection:
     - Promotional Event
     - Staff Training
     - Store Visit
     - Dab Bar
     - Festival/Show
     - Other (with description)
   - Priority level

3. **Resource Requirements**:

   - Number of Rishi staff needed
   - Kit template selection
   - Special equipment requests
   - Hour allocation per staff member

4. **Execution Details**:

   - Promotional specifics
   - Required activities
   - Special instructions
   - Regulatory considerations

5. **Success Criteria**:
   - KPIs to track
   - Target goals
   - Expected outcomes

## Development Roadmap

### Immediate Phase (Current Focus)

1. **Complete Booking Management**

   - Implement the booking form with all required fields
   - Support recurring event bookings
   - Add approval workflow and status transitions
   - Create booking detail view with all client specifications

2. **Event Occurrence Management**

   - Implement event generation from bookings (single and recurring)
   - Create event management views for field managers
   - Add staff assignment functionality
   - Develop call-ahead checklist and confirmation workflow

3. **Activity Tracking**

   - Complete activity management for events
   - Implement activity detail views
   - Support multiple activities per event
   - Add activity outcomes tracking

4. **Staff Assignment System**
   - Build brand agent assignment interface
   - Implement staff scheduling with availability checks
   - Create mobile check-in/check-out functionality
   - Add notification system for assignments

### Mid-Term Phase

1. **Kit Template Management**

   - Complete client-specific kit template creation
   - Build kit inventory tracking
   - Implement kit allocation to events
   - Add reporting on kit usage

2. **Location Management Enhancements**

   - Complete approval workflow for locations
   - Add venue details and constraints
   - Implement location notes and history
   - Enhance map visualization

3. **Reporting System**
   - Build comprehensive event reports
   - Implement KPI tracking against targets
   - Create client-facing reporting dashboards
   - Add trend analysis for recurring events

### Longer-Term Roadmap

1. **Financial Management**

   - Budget Allocation & Tracking
   - Cost analysis per event type
   - Resource utilization tracking
   - Client contract management

2. **Advanced Analytics**

   - Performance benchmarking
   - Predictive resource planning
   - ROI calculation
   - Market trend analysis

3. **Integration Capabilities**
   - Client CRM integrations
   - Inventory management systems
   - Marketing campaign platforms
   - Automated reporting delivery

## Technical Implementation Notes

The implementation will adhere to the following principles:

1. **Mobile-First Design**:

   - All interfaces must work seamlessly on mobile devices
   - Field staff will primarily use mobile interfaces for check-in/out and reporting

2. **Role-Specific Experiences**:

   - Each user role sees a tailored navigation and feature set
   - System applies appropriate access controls based on role

3. **Real-Time Updates**:

   - Status changes, assignments, and notifications must propagate in real-time
   - Field staff receives immediate notification of assignments or changes

4. **Consistent Terminology**:

   - Use clear and consistent terms across the application:
     - "Booking" for the client request (single or series)
     - "Event" for a specific occurrence with date/time/location
     - "Activity" for specific promotional actions within an event

5. **Integration with Location Management**:
   - Leverage existing location management system
   - Maintain clear separation between admin location management and client-facing functions
