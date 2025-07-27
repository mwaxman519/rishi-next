# Serverless Architecture for Rishi

## Overview

Rishi is implemented as a fully serverless application designed for deployment on Azure Static Web Apps. This document outlines the architectural decisions and implementation details.

## Key Components

### Frontend

- **Next.js 15.2+**: Server-side rendered React application with App Router (version 15.2.2 or later)
- **React 19.0+**: Component-based UI library with latest React features (version 19.0.0 or later)
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Backend

- **Serverless Functions**: API routes implemented as Next.js serverless functions
- **Neon Database**: Serverless PostgreSQL database with automatic scaling
  - Connection via `@neondatabase/serverless` client for edge-compatible database connections
- **Drizzle ORM**: Type-safe database queries and schema definition

### Authentication

- **NextAuth.js**: Authentication framework with multiple provider support
- **JWT with jose**: For stateless authentication

### Calendar Systems

- Completely separate calendar systems for agents and clients
- **FullCalendar**: Advanced JavaScript calendar library
- **Agent Calendar**: For agent availability management
- **Client Calendar**: For appointment booking

## Serverless Architecture Benefits

1. **Automatic Scaling**: Resources scale based on demand
2. **Reduced Operations Overhead**: No server management required
3. **Cost Efficiency**: Pay only for resources used
4. **High Availability**: Distributed across multiple regions
5. **Simplified Deployment**: Continuous deployment through Azure Pipelines

## Neon Database Integration

Neon Database provides serverless PostgreSQL functionality, offering:

- Automatic scaling (scale to zero when not in use)
- Branching capabilities for development environments
- Edge-compatible connection API
- High performance through intelligent caching

## Microservices Approach

Even in a serverless environment, we maintain a microservices-inspired architecture:

- Clear service boundaries
- Domain-driven design
- Feature-first code organization
- Separation of concerns
