# Architecture Documentation

This directory contains documentation about the architecture of the Rishi Workforce Management platform.

## System Architecture

- [Authentication System](authentication-system.md) - Comprehensive documentation of the authentication and authorization system
- [Authentication RBAC System](authentication-rbac-system.md) - Role-Based Access Control implementation details
- [Authentication Architecture V2](authentication-architecture-v2.md) - Updated authentication architecture

## Core Principles

The Rishi platform architecture follows these core principles:

1. **Modular Design** - Components are loosely coupled and independently deployable
2. **Event-Driven Architecture** - System components communicate via events
3. **Microservices** - Core functionality is split into distinct, specialized services
4. **API-First Development** - All functionality is exposed through well-defined APIs
5. **Progressive Enhancement** - The system works on basic devices and enhances with capabilities
6. **Responsive UI** - The interface adapts to different screen sizes and devices

## System Components

The platform consists of several core components:

- **Authentication System** - User authentication and authorization
- **Location Management** - Handling of physical locations and regions
- **Booking System** - Event and booking management with recurrence support
- **Staff Management** - Staff profiles, availability, and assignments
- **Client Management** - Client information and preferences
- **Reporting System** - Analytics and reporting capabilities
- **Notification System** - User notifications via various channels

## Technology Stack

The platform is built using the following technologies:

- **Frontend**: Next.js, React, TailwindCSS, Shadcn UI
- **Backend**: Next.js API Routes, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket for event notifications
- **Maps Integration**: Google Maps Platform
- **State Management**: TanStack Query
- **Form Management**: React Hook Form with Zod validation
- **Authentication**: Custom solution with NextAuth.js

## Deployment Architecture

The application is deployed using a scalable architecture:

- **Frontend**: Static assets served through a CDN
- **Backend**: Serverless functions for API endpoints
- **Database**: Managed PostgreSQL instance
- **WebSockets**: Dedicated WebSocket service for real-time communication
- **Asset Storage**: Cloud storage for user uploads and static assets

## Security Architecture

Security is implemented at multiple levels:

- **Authentication**: Secure user identification with JWTs and session management
- **Authorization**: Role-based permissions system for access control
- **Data Protection**: Encrypted storage and transport of sensitive data
- **API Security**: Rate limiting, CORS, and request validation
- **Attack Prevention**: Measures against XSS, CSRF, and injection attacks

## Development Workflow

For information about the development workflow, see the [Development Guides](../development-guides/README.md).
