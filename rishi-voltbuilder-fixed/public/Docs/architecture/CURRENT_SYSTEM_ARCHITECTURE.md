# Current System Architecture - Rishi Platform

## Overview

The Rishi Platform is a comprehensive workforce management system built on **Next.js 15.3.5 serverless architecture** with **microservices** and **event bus** integration, specifically designed for cannabis industry operations.

## Architectural Pattern: Next.js Serverless + Microservices + Event Bus

### Core Architecture Components

#### 1. Next.js Serverless Foundation
- **Framework**: Next.js 15.3.5 with App Router
- **Deployment**: Static export mode for production (Vercel/Azure)
- **API Routes**: Automatically converted to serverless functions
- **Database**: Neon PostgreSQL serverless with connection pooling

#### 2. Microservices Layer
```
/app/api/
├── auth-service/          # Authentication & Authorization
├── organization-service/  # Organization management
├── booking-service/      # Booking & event management
├── inventory-service/    # Inventory & kit management
├── user-service/         # User management
├── location-service/     # Location management
└── event-service/        # Event bus integration
```

#### 3. Event Bus Integration
- **Service**: EventBusService with UUID correlation tracking
- **Pattern**: Publish-subscribe for all state changes
- **Events**: All CRUD operations publish events for audit trails
- **Integration**: Ready for Event Grid conversion in Azure

## Business Model Implementation

### Core Staff Equipment (HR Managed)
```
Core Items:
- Black polo shirts
- Folding tables
- Neoprene tablecloths
```

### Brand-Specific Kit System
```
Kit Templates → Kit Instances → Location Tracking → Consumption → Replenishment
```

#### 1. Kit Templates
- Created collaboratively by Rishi + client
- Brand-specific configurations
- Region-targeted (states/areas)
- Predetermined item specifications

#### 2. Kit Instances
- Physical instances deployed in field
- Location tracking and assignment
- Status monitoring (available, in_use, needs_replenishment)
- Condition tracking

#### 3. Inventory Management
- Consumable item tracking
- Automatic replenishment workflows
- Cost tracking and approval processes
- Supplier management

## Database Schema Architecture

### Core Tables

#### Users & Organizations
```sql
users                    # Authentication & profiles
organizations           # Multi-tenant organization structure
userOrganizations      # User-organization relationships
organizationSettings   # Organization-specific configurations
```

#### Booking & Event Management
```sql
bookings               # Client bookings and activations
activities            # Event activities
locations             # Geographic locations (Google Maps)
activityTypes         # Types of activities
```

#### NEW: Inventory & Kit System
```sql
-- Inventory Management
inventoryItems         # Items available for kits (consumables)
kitTemplates          # Brand + region specific templates
kitTemplateItems      # Items required in each template
kitInstances          # Physical kit instances in field
kitInstanceItems      # Current items in each instance
consumptionLogs       # Track consumption during bookings
replenishmentRequests # Request workflow for restocking
replenishmentRequestItems # Specific items to replenish
```

## API Architecture

### Service Layer Pattern
```typescript
Request → Authentication → Validation → Service Layer → Event Publishing → Response
```

### Key Services

#### 1. InventoryService
- Kit template management
- Instance tracking
- Consumption logging
- Replenishment workflows

#### 2. BookingService
- Event booking management
- Kit assignment
- Activity tracking
- Status management

#### 3. OrganizationService
- Multi-tenant management
- User organization relationships
- Settings and configurations

#### 4. EventBusService
- Event publishing and subscription
- UUID correlation tracking
- Audit trail generation
- Cross-service communication

## Authentication & Authorization

### JWT-Based Authentication
- NextAuth.js integration
- Role-based access control (RBAC)
- Organization context switching
- Secure cookie management

### Role Hierarchy
```
super_admin           # Platform administrators
internal_admin        # Rishi internal staff
internal_field_manager # Regional managers
brand_agent          # Field representatives
client_manager       # Client organization managers
client_user          # Client organization users
```

### Permission System
- Granular permissions (manage:organizations, view:kits, etc.)
- Role-based permission inheritance
- Organization-specific contexts
- PermissionGuard components for UI protection

## Frontend Architecture

### Component Structure
```
/app/components/
├── ui/              # Shadcn/ui components
├── navigation/      # Navigation components
├── rbac/           # Permission-based components
├── forms/          # Form components
└── layout/         # Layout components
```

### State Management
- React Context for authentication
- TanStack Query for server state
- Organization context switching
- Theme management

## Event-Driven Architecture

### Event Types
```typescript
// Booking events
BOOKING_CREATED
BOOKING_UPDATED
BOOKING_COMPLETED

// Kit events
KIT_ASSIGNED
KIT_CONSUMED
KIT_REPLENISHMENT_REQUESTED

// User events
USER_AUTHENTICATED
USER_ORGANIZATION_SWITCHED
```

### Event Flow
1. Service layer publishes events
2. EventBusService handles distribution
3. Other services subscribe to relevant events
4. Audit logs automatically generated
5. Real-time notifications triggered

## Deployment Architecture

### Environment Strategy
```
Development  → Replit workspace (local development)
Staging     → Replit Autoscale (testing environment)
Production  → Vercel/Azure (static export)
```

### Database Strategy
```
Development  → rishinext_dev
Staging     → rishinext_staging  
Production  → rishinext (production)
```

### Security Implementation
- Environment-specific secrets
- Database connection pooling
- CORS configuration
- Rate limiting
- Input validation

## Performance Optimizations

### Database Optimizations
- Connection pooling with Neon
- Efficient query patterns
- Proper indexing strategies
- Batch operations for bulk updates

### Frontend Optimizations
- Static export for production
- Component lazy loading
- Efficient bundle splitting
- Optimized API calls

## Cannabis Industry Compliance

### Location Management
- Google Maps integration
- State-specific regulations
- Dispensary location tracking
- Regional kit deployment

### Audit Requirements
- Complete event tracking
- User action logging
- Inventory consumption records
- Compliance reporting

## Current System Status

### Completed Features
- ✅ Authentication system with RBAC
- ✅ Organization management
- ✅ Booking and event management
- ✅ NEW: Complete inventory/kit system
- ✅ Location management with Google Maps
- ✅ Event bus integration
- ✅ Multi-environment deployment

### Architecture Compliance
- ✅ Next.js serverless foundation
- ✅ Microservices service layer
- ✅ Event bus integration
- ✅ UUID correlation tracking
- ✅ Proper authentication middleware
- ✅ Business model implementation

### Next Steps
- Database migration for new inventory tables
- Kit management UI implementation
- Replenishment workflow automation
- Advanced analytics and reporting
- Mobile PWA development

---

**Last Updated**: January 9, 2025
**Architecture Version**: 2.0 (Post-Inventory System Implementation)
**Compliance**: Next.js Serverless + Microservices + Event Bus Pattern