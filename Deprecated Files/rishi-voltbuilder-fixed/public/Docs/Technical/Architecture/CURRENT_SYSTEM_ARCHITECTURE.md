# Rishi Platform - Current System Architecture

## Overview

The Rishi Platform is a comprehensive workforce management system for cannabis operations, built with Next.js 15.3.2 and deployed on Replit Autoscale. After extensive optimization, the platform now operates with a clean 1.8GB footprint (reduced from 26GB) and zero deployment warnings.

## System Architecture

### Frontend Architecture

- **Framework**: Next.js 15.3.2 with App Router
- **TypeScript**: Strict type checking with comprehensive definitions
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context for authentication and organization switching
- **Routing**: Next.js App Router with nested layouts

### Backend Architecture

- **API Structure**: Next.js API routes (143 endpoints)
- **Database**: Neon PostgreSQL serverless with connection pooling
- **ORM**: Drizzle ORM with typed schema definitions
- **Authentication**: Custom JWT-based system with role-based access control
- **Event System**: EventBusService for microservices communication
- **Service Layer**: Repository pattern with event-driven architecture

### Key System Components

#### Authentication System

- JWT token management with refresh mechanisms
- Role-based access control (RBAC) with 6 user roles:
  - super_admin
  - internal_admin
  - internal_field_manager
  - brand_agent
  - client_manager
  - client_user
- Organization context switching
- Secure middleware for route protection

#### Database Schema (Drizzle ORM)

- **Users**: Authentication and profile management
- **Organizations**: Multi-tenant structure with tiered services
- **Bookings**: Cannabis operational scheduling
- **Locations**: Geographic management with Google Maps integration
- **Staff Management**: Field managers, brand agents, team members
- **Kit Templates**: Equipment and material management
- **Activity Management**: Event-specific resource allocation

#### EventBusService Architecture

- Centralized event publishing for all state changes
- UUID-based event tracking with correlation IDs
- Microservices communication infrastructure
- Audit trail generation for operational tracking
- Real-time update propagation

## File Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (143 endpoints)
│   ├── auth/              # Authentication pages
│   ├── bookings/          # Booking management
│   ├── components/        # React components
│   ├── dashboard/         # Role-based dashboards
│   ├── inventory/         # Kit and equipment management
│   ├── locations/         # Location management
│   ├── staff/             # Staff management
│   └── layout.tsx         # Root layout
├── shared/                # Shared utilities
│   ├── schema.ts          # Drizzle database schema
│   ├── events.ts          # EventBus definitions
│   └── navigation-structure.tsx
├── server/                # Server utilities
├── types/                 # TypeScript definitions
├── public/                # Static assets
└── Docs/                  # Documentation
```

## Core Dependencies

### Production Dependencies (149 total)

- **Next.js**: 15.3.2 - React framework
- **React**: 18.2.0 - UI library
- **Drizzle ORM**: Database operations
- **@neondatabase/serverless**: PostgreSQL connection
- **@radix-ui/\***: UI component primitives (24 packages)
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety
- **Jose**: JWT token handling
- **Google Maps APIs**: Location services
- **PostHog**: Analytics tracking

### Key Features

- Multi-organization support with data isolation
- Tiered service model (Staff Leasing, Event Staffing, White-label)
- Google Maps integration for location management
- Comprehensive booking and scheduling system
- Real-time staff assignment and tracking
- Role-based dashboard interfaces
- Mobile-responsive design with theme switching

## Current Operational State

### Performance Metrics

- **Build Time**: ~3-5 seconds for incremental builds
- **Module Count**: 601 modules (optimized from 1298+)
- **Storage Usage**: 1.8GB (93% reduction from 26GB)
- **API Endpoints**: 143 fully functional routes
- **Zero Console Errors**: All 404 asset errors eliminated

### Asset Management

- Favicon system using `/favicon.ico`
- All logo references standardized to existing assets
- Removed 26+ unused binary assets from repository
- Optimized Git repository with clean history

### Environment Configuration

- Development environment on port 5000
- Replit Autoscale compatible configuration
- PostgreSQL connection via environment variables
- CORS handling for cross-origin requests
