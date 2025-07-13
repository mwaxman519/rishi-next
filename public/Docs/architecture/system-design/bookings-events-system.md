# Bookings & Events System Architecture

## Overview

The Rishi platform provides a comprehensive booking and event management system that enables clients to request brand activations at dispensary locations, and allows internal users to manage, approve, and execute these requests. This document outlines the architecture, workflows, and implementation plan for this critical system.

## Conceptual Model

### Core Concepts

1. **Booking**:

   - A client request for brand activation at a specific location
   - Represents the initial request and negotiation phase
   - Contains all details needed to plan and execute the event
   - Has a clear lifecycle from creation to approval/rejection

2. **Event**:

   - The scheduled occurrence of an approved booking
   - Includes specific staff assignments and resources
   - Has operational details for execution
   - Transitions through states: planned, in-progress, completed, canceled

3. **Calendar**:
   - Unified view showing all bookings, events, and availability
   - Provides visualization across different time horizons
   - Supports filtering by various criteria
   - Enables resource scheduling and optimization

## User Personas & Journeys

### Client User Journey

1. **Create Booking Request**:

   - Navigate to Bookings > Create Booking
   - Complete multi-step form with event details
   - Select location, date/time, and activation type
   - Submit for approval

2. **Manage Booking Requests**:

   - View all bookings on Bookings Dashboard
   - Filter by status, date range, or location
   - Receive notifications on status changes
   - Modify or cancel pending bookings

3. **View Scheduled Events**:
   - See approved bookings as events on calendar
   - Get details on assigned staff and resources
   - Access post-event reports and analytics

### Internal User Journey (Brand Agent/Field Manager)

1. **Review Booking Requests**:

   - Receive notification of new booking requests
   - Review details and check resource availability
   - Approve, request changes, or reject bookings
   - Add internal notes and budget allocations

2. **Staff Assignment**:

   - Assign appropriate staff to approved bookings
   - Check availability and qualifications
   - Confirm assignments and notify staff
   - Adjust assignments as needed

3. **Event Execution**:
   - Check-in at event location
   - Record attendance and activity metrics
   - Document with photos and notes
   - Complete post-event reporting

### Super Admin Journey

1. **System Oversight**:

   - View all bookings and events across organizations
   - Monitor approval processes and timelines
   - Address bottlenecks or issues
   - Access comprehensive analytics

2. **Resource Management**:
   - Manage global availability of locations
   - Oversee staff utilization across regions
   - Allocate resources based on demand
   - Implement optimization strategies

## UI/UX Architecture

### Client-Facing Interfaces

1. **Booking Creation**:

   - Multi-step wizard interface
   - Interactive calendar for date selection
   - Map-based location selection
   - Package recommendation engine
   - Real-time validation and guidance

2. **Booking Management Dashboard**:

   - Status-based card views
   - Timeline visualization
   - Filter and search capabilities
   - Action buttons for common tasks
   - Notification center

3. **Event Calendar**:
   - Month/week/day views
   - Color-coded by status
   - Detail expansion on click
   - Export and sharing options
   - Integration with external calendars

### Internal Management Interfaces

1. **Approval Workflow UI**:

   - Queue-based interface for pending approvals
   - Side-by-side comparison views
   - Inline editing capabilities
   - Comment and feedback system
   - Batch approval options

2. **Staff Assignment Interface**:

   - Drag-and-drop calendar interface
   - Availability visualization
   - Conflict detection
   - Qualification matching
   - Workload balancing indicators

3. **Resource Management**:
   - Inventory tracking dashboards
   - Resource allocation calendar
   - Utilization metrics
   - Maintenance and availability tracking
   - Budget monitoring

## API Architecture

### Core Services

1. **Booking Service**:

   - `GET /api/bookings`: List all bookings with filtering
   - `POST /api/bookings`: Create new booking
   - `GET /api/bookings/{id}`: Get specific booking details
   - `PUT /api/bookings/{id}`: Update booking details
   - `DELETE /api/bookings/{id}`: Cancel booking
   - `POST /api/bookings/{id}/approve`: Approve booking
   - `POST /api/bookings/{id}/reject`: Reject booking

2. **Event Service**:

   - `GET /api/events`: List all events with filtering
   - `POST /api/events`: Create event from booking
   - `GET /api/events/{id}`: Get event details
   - `PUT /api/events/{id}`: Update event details
   - `POST /api/events/{id}/check-in`: Staff check-in
   - `POST /api/events/{id}/check-out`: Staff check-out
   - `POST /api/events/{id}/complete`: Mark event complete

3. **Calendar Service**:

   - `GET /api/calendar`: Get calendar data with filters
   - `GET /api/calendar/availability`: Check availability
   - `POST /api/calendar/conflicts`: Check for conflicts
   - `GET /api/calendar/recommendations`: Get scheduling recommendations

4. **Notification Service**:
   - `POST /api/notifications`: Create notification
   - `GET /api/notifications`: Get user's notifications
   - `PUT /api/notifications/{id}/read`: Mark as read
   - `GET /api/notifications/preferences`: Get notification preferences
   - `PUT /api/notifications/preferences`: Update preferences

### Event-Driven Architecture

The system uses an event-driven architecture for real-time updates and integration:

1. **Event Types**:

   - `booking.created`: New booking request created
   - `booking.updated`: Booking details modified
   - `booking.status_changed`: Booking status transition
   - `event.created`: New event created from booking
   - `event.assigned`: Staff assigned to event
   - `event.started`: Event check-in recorded
   - `event.completed`: Event marked as complete
   - `availability.changed`: Resource availability updated

2. **Event Handlers**:
   - Notification dispatchers
   - Analytics recalculation
   - Calendar updates
   - External system synchronization

## Database Schema

### Core Tables

1. **Bookings Table**:

   ```sql
   CREATE TABLE bookings (
     id UUID PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     client_organization_id UUID REFERENCES organizations(id),
     location_id UUID REFERENCES locations(id),
     activity_type_id UUID REFERENCES activity_types(id),
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     start_time TIME,
     end_time TIME,
     budget DECIMAL(10,2),
     attendee_estimate INTEGER,
     status VARCHAR(50) DEFAULT 'pending',
     priority VARCHAR(50) DEFAULT 'normal',
     notes TEXT,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP,
     approved_by UUID REFERENCES users(id),
     approved_at TIMESTAMP,
     rejected_by UUID REFERENCES users(id),
     rejected_at TIMESTAMP,
     rejection_reason TEXT
   );
   ```

2. **Events Table**:

   ```sql
   CREATE TABLE events (
     id UUID PRIMARY KEY,
     booking_id UUID REFERENCES bookings(id),
     title VARCHAR(255) NOT NULL,
     description TEXT,
     location_id UUID REFERENCES locations(id),
     start_datetime TIMESTAMP NOT NULL,
     end_datetime TIMESTAMP NOT NULL,
     status VARCHAR(50) DEFAULT 'scheduled',
     actual_attendees INTEGER,
     notes TEXT,
     created_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP,
     completed_at TIMESTAMP,
     completion_notes TEXT
   );
   ```

3. **Event Assignments Table**:

   ```sql
   CREATE TABLE event_assignments (
     id UUID PRIMARY KEY,
     event_id UUID REFERENCES events(id),
     user_id UUID REFERENCES users(id),
     role VARCHAR(50) NOT NULL,
     status VARCHAR(50) DEFAULT 'assigned',
     check_in_time TIMESTAMP,
     check_out_time TIMESTAMP,
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

4. **Event Resources Table**:
   ```sql
   CREATE TABLE event_resources (
     id UUID PRIMARY KEY,
     event_id UUID REFERENCES events(id),
     resource_type VARCHAR(50) NOT NULL,
     resource_id UUID NOT NULL,
     quantity INTEGER DEFAULT 1,
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

## Implementation Plan

### Phase 1: Conceptual Framework Restructuring

1. **Establish Clear Conceptual Model**:

   - Finalize terminology and relationships between Bookings and Events
   - Document domain model with clear entity definitions
   - Update database schema to reflect conceptual model

2. **Information Architecture Update**:

   - Revise navigation structure to reflect conceptual model
   - Establish consistent naming conventions across UI
   - Implement appropriate access controls for each user role

3. **Navigation Refinement**:
   - Update all navigation components to use consistent terminology
   - Ensure intuitive placement of features based on user role
   - Provide contextual navigation where appropriate

### Phase 2: Enhanced Booking Experience (Client-Focused)

1. **Booking Creation Experience**:

   - Enhance multi-step form with improved validation
   - Add location selection with map interface
   - Implement date/time selection with availability checking
   - Create package recommendation system

2. **Booking Management Dashboard**:

   - Develop filterable, sortable booking list
   - Create status-based views with appropriate actions
   - Implement search functionality
   - Add booking details view with timeline

3. **Booking Notifications**:
   - Create notification templates for booking status changes
   - Implement in-app notification center
   - Add email notification system
   - Provide notification preferences management

### Phase 3: Internal Event Management (Staff-Focused)

1. **Approval Workflow Enhancement**:

   - Implement multi-level approval process
   - Create approval dashboard for managers
   - Add commenting and feedback system
   - Implement audit trail for approval actions

2. **Staff Assignment System**:

   - Develop availability tracking for staff
   - Create assignment interface with drag-and-drop
   - Implement conflict detection and resolution
   - Add qualification matching system

3. **Resource Management Integration**:
   - Implement kit inventory tracking
   - Create resource allocation system
   - Add budget tracking and reconciliation
   - Develop digital asset management for event materials

### Phase 4: Calendar & Scheduling Optimization

1. **Unified Calendar System**:

   - Develop integrated calendar view for bookings and events
   - Implement multiple view options (day, week, month)
   - Add filtering and search capabilities
   - Create resource-based calendar views

2. **Optimization Engine**:

   - Implement scheduling recommendation algorithm
   - Create travel optimization for field staff
   - Develop staff utilization balancing
   - Add budget optimization features

3. **External Calendar Integration**:
   - Implement Google Calendar integration
   - Add Microsoft Outlook support
   - Create iCalendar feeds
   - Develop mobile calendar app integration

### Phase 5: Reporting & Analytics

1. **Operational Dashboards**:

   - Create booking volume and trend reports
   - Implement staff utilization metrics
   - Develop location performance analytics
   - Add approval efficiency tracking

2. **Client-Facing Analytics**:

   - Implement ROI calculation for events
   - Create performance comparison tools
   - Develop geographic distribution visualization
   - Add seasonal performance analysis

3. **Forecasting Tools**:
   - Create demand prediction models
   - Implement resource requirement forecasting
   - Develop budget projection tools
   - Add capacity planning features

## Technical Implementation Details

### Frontend Components

1. **Booking Form Components**:

   - `BookingStepperForm`: Multi-step form container
   - `BasicInfoStep`: First step for basic booking details
   - `LocationSelectionStep`: Map-based location selection
   - `DateTimeSelectionStep`: Calendar-based date/time selection
   - `ResourceSelectionStep`: Kit and resource selection
   - `ReviewSubmitStep`: Final review and submission

2. **Calendar Components**:

   - `CalendarContainer`: Main calendar container
   - `MonthView`: Month calendar grid
   - `WeekView`: Week calendar timeline
   - `DayView`: Day detailed schedule
   - `EventCard`: Rendered event in calendar
   - `ResourceCalendar`: Resource-specific calendar

3. **Dashboard Components**:
   - `BookingsDashboard`: Main bookings dashboard
   - `StatusFilterTabs`: Status-based filtering
   - `BookingsList`: Sortable booking list
   - `BookingCard`: Individual booking display
   - `BookingTimeline`: Status timeline visualization
   - `NotificationCenter`: User notification display

### Backend Services

1. **Booking Service**:

   - Handles CRUD operations for bookings
   - Manages booking workflow and status transitions
   - Validates booking data and availability
   - Processes approval workflows

2. **Event Service**:

   - Creates events from approved bookings
   - Manages event lifecycle and status changes
   - Handles staff assignments and check-ins
   - Processes event completion and reporting

3. **Calendar Service**:

   - Provides calendar data for various views
   - Checks availability and conflicts
   - Generates scheduling recommendations
   - Synchronizes with external calendars

4. **Notification Service**:
   - Dispatches notifications based on system events
   - Manages user notification preferences
   - Handles email and push notification delivery
   - Maintains notification history and read status

### Integration Points

1. **Location Services**:

   - Map integration for location selection
   - Geofencing for check-in verification
   - Travel time estimation
   - Location availability management

2. **Staff Management**:

   - Availability tracking integration
   - Qualification and skill matching
   - Performance monitoring
   - Workload balancing

3. **Resource Management**:

   - Kit inventory integration
   - Equipment tracking
   - Budget management
   - Digital asset management

4. **Analytics Platform**:
   - Data aggregation and processing
   - Visualization components
   - Export and reporting functionality
   - Predictive analytics integration

## Conclusion

The Bookings & Events system represents a core functional area of the Rishi platform. By implementing this comprehensive architecture, we will deliver an intuitive, powerful, and flexible system that meets the needs of all user roles and provides exceptional value to clients and internal teams alike.

The phased implementation approach will allow for continuous improvement and feedback, ensuring that each component meets user needs and integrates seamlessly with the rest of the platform.
