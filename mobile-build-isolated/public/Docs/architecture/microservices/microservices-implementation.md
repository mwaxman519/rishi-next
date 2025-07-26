# Microservices Architecture Implementation

## Overview

This document outlines how we're implementing a microservices-inspired architecture within our Next.js application. Instead of deploying separate services, we're using a "modular monolith" approach that maintains service boundaries within a single codebase.

## Architectural Approach

Our implementation follows these key principles:

1. **Service Boundaries**: Clear separation between different domains
2. **Domain-Driven Design**: Code organized around business domains
3. **Service Independence**: Minimal coupling between services
4. **API Contracts**: Well-defined interfaces between services

## Directory Structure

```
app/
├── api/                           # API Gateway layer
│   ├── auth/                      # Authentication endpoints
│   ├── users/                     # User management endpoints
│   ├── availability/              # Availability management endpoints
│   └── bookings/                  # Booking management endpoints
│
├── services/                      # Service layer - business logic
│   ├── auth/                      # Authentication service
│   │   ├── authService.ts         # Service implementation
│   │   ├── models.ts              # Domain models
│   │   └── repository.ts          # Data access layer
│   │
│   ├── users/                     # User management service
│   │   ├── userService.ts
│   │   ├── models.ts
│   │   └── repository.ts
│   │
│   ├── availability/              # Availability management service
│   │   ├── availabilityService.ts
│   │   ├── models.ts
│   │   └── repository.ts
│   │
│   └── bookings/                  # Booking management service
│       ├── bookingService.ts
│       ├── models.ts
│       └── repository.ts
│
├── shared/                        # Shared utilities and schemas
│   ├── schema.ts                  # Database schema
│   ├── types.ts                   # Shared type definitions
│   └── utils/                     # Shared utility functions
│
└── middleware.ts                  # Cross-cutting concerns
```

## Service Layer Pattern

Each service follows this pattern:

1. **API Layer** (`app/api/{service-name}/route.ts`):

   - Handles HTTP requests and responses
   - Validates incoming data
   - Calls appropriate service methods
   - Returns formatted responses

2. **Service Layer** (`app/services/{service-name}/service.ts`):

   - Implements business logic
   - Orchestrates operations across repositories
   - Handles domain-specific validation and rules
   - Returns domain objects

3. **Repository Layer** (`app/services/{service-name}/repository.ts`):
   - Provides data access abstraction
   - Implements database operations
   - Converts between database models and domain models

## Inter-Service Communication

Services communicate through:

1. **Direct Method Calls**: For synchronous operations within the same process
2. **Event Emitters**: For asynchronous, loosely-coupled operations

```typescript
// Example: Event-based communication
// In userService.ts
import { eventBus } from "@/shared/events";

async function createUser(userData) {
  // Create user in database
  const user = await userRepository.create(userData);

  // Emit event for other services
  eventBus.emit("user.created", user);

  return user;
}

// In notificationService.ts
import { eventBus } from "@/shared/events";

// Listen for events
eventBus.on("user.created", async (user) => {
  await sendWelcomeEmail(user.email);
});
```

## API Gateway Pattern

The API routes act as an API Gateway:

1. Routes incoming requests to appropriate services
2. Handles authentication and authorization
3. Logs requests for monitoring and auditing
4. Implements rate limiting and other cross-cutting concerns

```typescript
// Example: API Gateway pattern in auth/login/route.ts
import { authService } from "@/services/auth/authService";

export async function POST(request: Request) {
  // Parse and validate request
  const { username, password } = await request.json();

  // Call service layer
  const result = await authService.login(username, password);

  // Handle response
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  // Set auth cookie and return response
  return authService.createAuthResponse(result.user, result.token);
}
```

## Benefits of This Approach

1. **Maintainability**: Clear separation of concerns makes the codebase easier to understand and maintain
2. **Testability**: Services and repositories can be unit tested in isolation
3. **Flexibility**: Services can be extracted into separate deployments if needed
4. **Scalability**: Different parts of the application can be scaled independently
5. **Developer Experience**: Multiple developers can work on different services without conflicts

## Service Adapter Pattern Implementation

We've implemented a service adapter pattern that allows seamless switching between local and remote service implementations:

```typescript
// serviceAdapter.ts
export interface ServiceAdapter<T> {
  getService(): T;
}

// Local adapter - uses in-process service implementation
export class LocalServiceAdapter<T> implements ServiceAdapter<T> {
  constructor(private serviceInstance: T) {}

  getService(): T {
    return this.serviceInstance;
  }
}

// Remote adapter - uses HTTP client to call remote service
export class RemoteServiceAdapter<T extends object>
  implements ServiceAdapter<T>
{
  constructor(
    private baseUrl: string,
    private apiClient: ApiClient,
  ) {}

  getService(): T {
    // Return proxy object that converts method calls to HTTP requests
    return new Proxy({} as T, {
      get: (target, prop) => {
        return (...args: any[]) => {
          return this.apiClient.post(
            `${this.baseUrl}/${String(prop)}`,
            args[0],
          );
        };
      },
    });
  }
}
```

## Service Registry Implementation

We've implemented a service registry that provides a central configuration point for all services:

```typescript
// serviceRegistry.ts
export type ServiceConfig = {
  type: "local" | "remote";
  url?: string;
};

export const serviceConfigurations: Record<string, ServiceConfig> = {
  "user-service": { type: "local" },
  "availability-service": { type: "local" },
  "booking-service": { type: "local" },
  "notification-service": {
    type: "remote",
    url: "https://api.example.com/notifications",
  },
};

export function getServiceAdapter<T extends object>(
  serviceId: string,
  localInstance: T,
): ServiceAdapter<T> {
  const config = serviceConfigurations[serviceId];

  if (!config) {
    throw new Error(`Service configuration not found for: ${serviceId}`);
  }

  if (config.type === "local") {
    return new LocalServiceAdapter<T>(localInstance);
  } else {
    return new RemoteServiceAdapter<T>(config.url!, new DefaultApiClient());
  }
}
```

## Implementation Progress

1. ✅ **Phase 1**: Created service layer abstraction for existing API routes
2. ✅ **Phase 2**: Implemented repositories for each domain (users, availability, auth)
3. ✅ **Phase 3**: Added event-based communication between services
4. ✅ **Phase 4**: Enhanced API gateway functionality with auth middleware
5. ✅ **Phase 5**: Implemented service adapter pattern and service registry
6. 🔄 **Phase 6**: Creating documentation for service interfaces and integration points
7. 🔄 **Phase 7**: Adding monitoring and resilience patterns (circuit breakers, retries)
8. 📅 **Phase 8**: Extracting high-traffic services to separate deployments

## Current Implementation Status

- ✅ Authentication Service - Fully implemented with JWT authentication
- ✅ User Service - Fully implemented with repository pattern
- ✅ Availability Service - Fully implemented with repository pattern
- ✅ Google Calendar Integration - Implemented with OAuth and event synchronization
- 🔄 Booking Service - Partially implemented
- 📅 Notification Service - Planned for future implementation
- 📅 Reporting Service - Planned for future implementation
