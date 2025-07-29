# Booking System Documentation

## Overview

This directory contains comprehensive documentation for the Booking System module within the Rishi Workforce Management platform. The Booking System is a critical component that enables clients to create and manage bookings for events and services, with support for both single events and recurring series.

## Document Index

1. **[Architecture Review](./architecture-review.md)**

   - Comprehensive architectural analysis of the Booking System
   - Evaluation against industry best practices and patterns
   - Strengths, improvement areas, and recommendations
   - API design, database schema, and integration points

2. **[Implementation Details](./implementation.md)**

   - Technical implementation of the Booking System
   - Frontend components and form implementation
   - Backend services and API endpoints
   - Event-driven communication patterns
   - Data model and validation strategies

3. **[Booking System Summary](../booking-system-summary.md)**

   - Conceptual overview of the Booking System
   - Key entities and relationships
   - User responsibilities and workflows
   - State management and transitions

4. **[Bookings Events System](../bookings-events-system.md)**

   - Event-driven architecture for booking events
   - Event types and handlers
   - Integration with other services

5. **[Updated Bookings Events Model](../updated-bookings-events-model.md)**
   - Latest event model for the booking system
   - Changes and improvements to the event system

## Integration with Other Services

The Booking System integrates with several other services within the platform:

- **Location Management Service**: For location validation and selection
- **Staff Management Service**: For assigning staff to booking activities
- **Calendar Service**: For calendar visualization and integration
- **Notification Service**: For alerts and communications
- **Client Management Service**: For client association and permissions

## Development Guidelines

When working on the Booking System, please follow these guidelines:

1. All changes should maintain the existing event-driven architecture
2. Frontend components should be placed in `/components/bookings/`
3. API routes should be placed in `/app/api/bookings/`
4. Event handlers should be registered in `/app/events/booking-events.ts`
5. Business logic should be extracted into service classes in `/app/services/`
6. Database operations should use Drizzle ORM with our defined schema
7. All new features should include appropriate documentation updates

## Recent Updates

The most recent update to the Booking System includes:

- Enhanced date picker with improved styling and accessibility
- Improved error handling through centralized error service
- Real-time title generation based on form field changes
- Support for recurring events with flexible scheduling options
- Calendar invite generation for participants
