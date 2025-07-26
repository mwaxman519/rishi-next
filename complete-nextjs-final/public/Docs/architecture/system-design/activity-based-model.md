# Activity-Based Model

## Overview

The Activity-Based Model is a core architectural concept in the Rishi platform that provides a flexible, extensible framework for managing all bookable work units across different organization types. This document explains the design principles, components, and implementation details of this model.

## Transition from Event-Only to Activity-Based

### Previous Limitations

The previous event-centric model had several limitations:

- Limited to traditional events like promotions and trade shows
- Inflexible structure that couldn't accommodate different types of work
- Difficult to extend for specialized workflows like secret shopping
- Separate systems needed for different types of bookable work

### Benefits of Activity-Based Model

The new activity-based approach offers significant advantages:

1. **Unified Framework**: Common structure for all types of bookable work
2. **Extensibility**: New activity types can be added without schema changes
3. **Customization**: Organization-specific metadata schemas for each type
4. **Simplified Architecture**: Consistent assignment, scheduling, and resource management
5. **Improved Reporting**: Cross-activity analysis and comprehensive dashboards
6. **Better Client Experience**: Single interface for all activity types

## Core Components

### Activity Types

Activity types define the categories of work that can be scheduled and assigned in the system. Each type can have its own metadata schema, workflow, and UI components.

**Default System Types:**

- Event: Traditional promotional events, trade shows, etc.
- Secret Shopping: Covert retail assessment activities
- Merchandising: Product arrangement and stocking activities
- Logistics: Transportation and inventory movement
- Training: Educational and skill development sessions
- Other: Miscellaneous activities

**Characteristics:**

- UUID-based identifiers
- Optional organization association (null for system types)
- JSON schema for type-specific metadata
- UI configuration for icons and colors
- Active/inactive status

### Activities

Activities are the central bookable units in the system, representing specific instances of work to be done.

**Key Features:**

- Type-specific metadata (conforming to the type's schema)
- Location association (optional for virtual activities)
- Organization and brand associations
- Scheduling information (dates, times, recurrence)
- Resource requirements
- Budget and priority settings
- Approval workflow states

### Activity Assignments

Activity assignments connect users to activities, defining their roles, compensation, and specific responsibilities.

**Key Features:**

- Role designation (lead, assistant, supervisor, etc.)
- Status tracking (pending, accepted, declined, completed)
- Time tracking with check-in/check-out
- Custom time slots (can override activity times)
- Feedback and rating collection
- Compensation tracking

### Activity Kits

Activity kits track physical resources needed for activities, linking kit templates or specific kit instances to activities.

**Key Features:**

- Quantity tracking
- Status management (needed, allocated, delivered, etc.)
- Assignment to specific users for accountability
- Notes for special requirements

## Database Schema

The model is implemented with the following core tables:

1. **activity_types**: Defines the categories of work
2. **activities**: Represents individual bookable units of work
3. **activity_assignments**: Connects users to activities
4. **activity_kits**: Associates physical resources with activities

All tables use UUID primary keys for compatibility with the rest of the system, and proper foreign key relationships maintain data integrity.

## Type System and Metadata

One of the most powerful features of the activity-based model is the dynamic metadata schema system:

1. Each activity type defines a JSON schema that specifies what additional fields are required
2. Activities store type-specific data in their metadata JSON field
3. The UI can adapt to show different forms based on the activity type
4. Validation ensures that metadata conforms to the type's schema
5. Reports can be generated with type-specific fields

## Implementation Considerations

### Service Architecture

The activity system is implemented using our service-oriented architecture:

- **Activities Service**: Core CRUD operations for activities and types
- **Assignment Service**: Managing staff assignments to activities
- **Resources Service**: Kit allocation and inventory management

Each service communicates through our resilient message bus system and implements the circuit breaker pattern for fault tolerance.

### UI Components

The following UI components are planned to support the activity-based model:

1. **Activity Type Selector**: For choosing the type when creating activities
2. **Type-Specific Forms**: Dynamic forms based on the selected type
3. **Activity Calendar**: Unified view with filtering by type
4. **Assignment Dashboard**: Staff view of assigned activities
5. **Resource Allocation Interface**: For managing kits and equipment

### Migration Path

For existing event data, we've established a migration path:

1. Events will be mapped to the "Event" activity type
2. Existing event fields will be preserved in the metadata
3. Event-specific logic will be maintained through type-specific handlers

## Future Enhancements

Future enhancements to the activity-based model include:

1. **Custom Activity Types**: Allow organizations to define their own types
2. **Workflow Automation**: Type-specific approval and notification workflows
3. **Advanced Scheduling**: AI-powered scheduling optimization
4. **Analytics**: Comprehensive reporting across all activity types
5. **Mobile Support**: Type-specific mobile experiences

## Conclusion

The activity-based model represents a significant architectural advancement for the Rishi platform, providing the flexibility needed to support diverse organization types and work patterns. By unifying all bookable work under a common framework while allowing for type-specific customization, we've created a system that can scale with the business needs while maintaining consistency in the user experience.
