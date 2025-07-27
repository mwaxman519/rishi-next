# System Architecture

## Overview

The Rishi platform is built as a modern web application with a clean separation of concerns, following industry best practices for scalability, maintainability, and performance. This document provides a high-level overview of the system architecture.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     Client (Browser)                         │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                   Next.js Application                        │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐  │
│  │                 │    │                 │    │          │  │
│  │  React Frontend │    │  API Routes     │    │ Middleware│  │
│  │                 │    │                 │    │          │  │
│  └────────┬────────┘    └────────┬────────┘    └─────┬────┘  │
│           │                      │                   │       │
│           │                      │                   │       │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌─────▼────┐  │
│  │                 │    │                 │    │          │  │
│  │  UI Components  │    │  Service Layer  │    │   Auth   │  │
│  │                 │    │                 │    │          │  │
│  └─────────────────┘    └────────┬────────┘    └──────────┘  │
│                                  │                           │
└──────────────────────────────────┼───────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                       Data Layer                             │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐  │
│  │                 │    │                 │    │          │  │
│  │  Repositories   │    │   Drizzle ORM   │    │ Postgres │  │
│  │                 │    │                 │    │   (Neon) │  │
│  └─────────────────┘    └─────────────────┘    └──────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend Layer

- **React**: Frontend library for building user interfaces
- **Next.js**: React framework for server-rendered applications
- **React Query**: Data fetching and state management
- **UI Components**: Custom components and Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling

### Service Layer

- **API Routes**: Next.js API routes for handling HTTP requests
- **Service Modules**: Business logic organized by domain
- **Event Bus**: Internal event system for decoupled communication
- **Google Calendar Integration**: External API integration for calendar sync

### Data Layer

- **Repositories**: Data access patterns for each domain entity
- **Drizzle ORM**: Type-safe database access layer
- **Neon Database**: Serverless PostgreSQL database service

### Infrastructure

- **Authentication**: JWT-based authentication system
- **Role-Based Access Control (RBAC)**: Permission management system
- **Client Organization Management**: Multi-tenant isolation
- **Middleware**: Request processing and authentication checking
- **Error Handling**: Centralized error management
- **Logging**: Application event logging

## Design Patterns

The application implements several key design patterns:

1. **Repository Pattern**: Abstracts data access operations
2. **Service Pattern**: Encapsulates business logic
3. **Dependency Injection**: Loosely coupled components
4. **Event-Driven Architecture**: Communication via events
5. **Adapter Pattern**: Consistent interfaces for different implementations
6. **Strategy Pattern**: Swappable algorithms for different scenarios

## Database Design

The platform uses PostgreSQL with the following key tables:

- **users**: User accounts and authentication information
- **employees**: Healthcare provider information and profiles
- **facilities**: Healthcare facilities and client locations
- **availability_blocks**: Provider availability tracking
- **shifts**: Work assignments for providers
- **client_organizations**: Client organization information
- **client_users**: User-to-organization mapping with roles

For a detailed database schema, see the [Database Schema](./database-schema) document.

## API Architecture

The platform exposes a RESTful API with the following characteristics:

- **Resource-Based Endpoints**: Organized around domain resources
- **JWT Authentication**: Secure token-based authentication
- **RBAC Middleware**: Permission checking for all operations
- **Consistent Response Format**: Standardized success/error responses
- **Pagination Support**: For large collection endpoints
- **Validation**: Request validation using Zod schemas

## Authentication Flow

1. User registers or logs in via the authentication endpoints
2. Server validates credentials and issues a JWT token
3. Token is stored in an HTTP-only cookie for security
4. Token is verified on subsequent requests via middleware
5. Role and permission checks are performed as needed

## Deployment Architecture

The platform is deployed on Azure Static Web Apps with the following configuration:

1. **Frontend**: Static files served from CDN
2. **API Routes**: Deployed as Azure Functions
3. **Database**: Neon serverless PostgreSQL
4. **Authentication**: JWT authentication with Azure Functions
5. **CI/CD**: GitHub Actions pipeline for deployment

## Security Considerations

The platform implements several security measures:

1. **HTTP-Only Cookies**: Prevents JavaScript access to auth tokens
2. **CORS Configuration**: Restricts cross-origin requests
3. **Password Hashing**: Secure password storage
4. **Input Validation**: Prevents injection attacks
5. **RBAC System**: Fine-grained access control
6. **Data Isolation**: Multi-tenant data segregation
7. **Rate Limiting**: Prevents brute force attacks

## Scalability Considerations

The architecture is designed to scale horizontally:

1. **Stateless API**: Allows multiple server instances
2. **Serverless Database**: Scales with demand
3. **CDN Distribution**: Optimizes content delivery
4. **Caching Strategy**: Reduces database load
5. **Asynchronous Processing**: For long-running tasks

## Related Documents

- [Database Schema](./database-schema)
- [API Gateway](./api-gateway)
- [Service Patterns](./service-patterns)
- [Authentication Architecture](../features/authentication)
