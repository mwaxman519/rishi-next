# Microservices Architecture Documentation

## Overview

The Cannabis Workforce Management Platform implements a "microservices-ready" architecture using the Service Adapter Pattern. This architecture allows the application to start as a modular monolith and gradually transition to a distributed microservices architecture without significant code changes.

## Service Adapter Pattern

The service adapter pattern provides an abstraction layer between service consumers and service implementations, allowing the application to switch between local and remote service implementations transparently.

### Core Components

#### 1. Service Interfaces

Each domain service has a well-defined interface that specifies the contract for all implementations:

```typescript
// app/services/availability/serviceAdapter.ts
export interface IAvailabilityService {
  getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse>;
  getAvailabilityBlockById(id: number): Promise<AvailabilityResponse>;
  createAvailabilityBlock(
    data: CreateAvailabilityRequest,
  ): Promise<AvailabilityResponse>;
  updateAvailabilityBlock(
    id: number,
    data: UpdateAvailabilityRequest,
  ): Promise<AvailabilityResponse>;
  deleteAvailabilityBlock(
    id: number,
    deleteSeries?: boolean,
  ): Promise<ServiceResponse<{ success: boolean; count?: number }>>;
  checkForConflicts(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeBlockId?: number,
  ): Promise<ConflictCheckResponse>;
}
```

#### 2. Service Adapter Interface

The generic `ServiceAdapter` interface defines how to obtain a service instance:

```typescript
// app/services/infrastructure/serviceAdapter.ts
export interface ServiceAdapter<T> {
  getService(): T;
}
```

#### 3. Local Service Adapter

The `LocalServiceAdapter` provides access to in-process service implementations:

```typescript
// app/services/infrastructure/serviceAdapter.ts
export class LocalServiceAdapter<T> implements ServiceAdapter<T> {
  constructor(private serviceInstance: T) {}

  getService(): T {
    return this.serviceInstance;
  }
}
```

#### 4. Remote Service Adapter

The `RemoteServiceAdapter` provides access to remote service implementations via HTTP:

```typescript
// app/services/infrastructure/serviceAdapter.ts
export class RemoteServiceAdapter<T extends object>
  implements ServiceAdapter<T>
{
  constructor(
    private baseUrl: string,
    private apiClient: ApiClient,
  ) {}

  getService(): T {
    // Create a proxy object that makes HTTP requests for each method call
    return new Proxy({} as T, {
      get: (target, prop) => {
        return async (...args: any[]) => {
          const method = prop.toString();
          const url = `${this.baseUrl}/${method}`;
          return this.apiClient.post(url, { args });
        };
      },
    });
  }
}
```

#### 5. API Client Interface

The `ApiClient` interface abstracts HTTP communication:

```typescript
// app/services/infrastructure/serviceAdapter.ts
export interface ApiClient {
  get<T>(url: string, options?: any): Promise<T>;
  post<T>(url: string, data: any, options?: any): Promise<T>;
  put<T>(url: string, data: any, options?: any): Promise<T>;
  delete<T>(url: string, options?: any): Promise<T>;
}
```

#### 6. Default API Client

The `DefaultApiClient` implements the API client using the Fetch API:

```typescript
// app/services/infrastructure/serviceAdapter.ts
export class DefaultApiClient implements ApiClient {
  async get<T>(url: string, options?: any): Promise<T> {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return await response.json();
  }

  // Other method implementations...
}
```

## Service Registry

The service registry centralizes the configuration of all services and provides factory functions to obtain service instances:

```typescript
// app/services/infrastructure/serviceRegistry.ts
export type ServiceConfig = {
  type: "local" | "remote";
  url?: string;
};

export const serviceConfigurations: Record<string, ServiceConfig> = {
  availability: { type: "local" },
  users: { type: "local" },
  googleCalendar: { type: "local" },
  // Future configurations
  // 'analytics': { type: 'remote', url: 'https://analytics-api.example.com' }
};
```

### Service Provider Factory

```typescript
// app/services/infrastructure/serviceRegistry.ts
export function getServiceAdapter<T extends object>(
  serviceId: string,
  localInstance: T,
): ServiceAdapter<T> {
  const config = serviceConfigurations[serviceId] || { type: "local" };

  if (config.type === "local") {
    return new LocalServiceAdapter<T>(localInstance);
  } else {
    return new RemoteServiceAdapter<T>(config.url!, new DefaultApiClient());
  }
}

export function createServiceProvider<T extends object>(
  serviceId: string,
  localInstance: T,
): () => T {
  return () => {
    return getServiceAdapter<T>(serviceId, localInstance).getService();
  };
}
```

### Async Service Provider

For cases where server-side dynamic imports are needed:

```typescript
// app/services/infrastructure/serviceRegistry.ts
export function createAsyncServiceProvider<T extends object>(
  serviceId: string,
): () => Promise<T> {
  return async () => {
    const config = serviceConfigurations[serviceId] || { type: "local" };

    if (config.type === "local") {
      // Dynamically import the local service
      // This prevents server-side code from being bundled into client components
      const module = await import(
        `../../../app/services/${serviceId}/${serviceId}Service`
      );
      return module[`${serviceId}Service`];
    } else {
      // Remote service implementation
      return new RemoteServiceAdapter<T>(
        config.url!,
        new DefaultApiClient(),
      ).getService();
    }
  };
}
```

## API Gateway Pattern

The Next.js API routes function as API gateways that delegate to the appropriate service:

```typescript
// app/api/availability/route.ts
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    // Additional parameter extraction...

    // Create query options
    const options = {
      userId: parseInt(userId),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || undefined,
    };

    // Get the availability service asynchronously
    const availabilityService = await getAvailabilityService();

    // Call the service
    const result = await availabilityService.getAvailabilityBlocks(options);

    // Return standardized response
    return NextResponse.json(
      {
        success: true,
        data: result.data || [],
      },
      { status: 200 },
    );
  } catch (error) {
    // Error handling...
  }
}
```

## Service Implementations

Each domain service has its own implementation that contains the business logic:

```typescript
// app/services/availability/availabilityService.ts
class AvailabilityService implements IAvailabilityService {
  async getAvailabilityBlocks(
    options: AvailabilityQueryOptions,
  ): Promise<AvailabilitiesResponse> {
    try {
      // Implementation with repository access
      const blocks = await availabilityRepository.findAll(options);

      return {
        success: true,
        data: blocks,
      };
    } catch (error) {
      // Error handling...
    }
  }

  // Other method implementations...
}

export const availabilityService = new AvailabilityService();
```

## Usage in Components

Consuming components use the service adapter pattern to access services:

```typescript
// Client-side component
import { createAsyncServiceProvider } from "@/services/infrastructure/serviceRegistry";
import { IAvailabilityService } from "@/services/availability/serviceAdapter";

// Create an async service provider for the availability service
const getAvailabilityService =
  createAsyncServiceProvider<IAvailabilityService>("availability");

// Component using the service
export default function AvailabilityComponent({ userId }) {
  const [blocks, setBlocks] = useState([]);

  async function loadAvailability() {
    // Get the service asynchronously
    const availabilityService = await getAvailabilityService();

    // Call service methods
    const result = await availabilityService.getAvailabilityBlocks({
      userId,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    });

    if (result.success) {
      setBlocks(result.data);
    }
  }

  // Component implementation...
}
```

## Distributed Event Bus

The architecture includes a distributed event bus for asynchronous communication between services:

```typescript
// app/services/infrastructure/distributedEventBus.ts
export interface EventPublisher {
  publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<boolean>;
}

export interface EventSubscriber {
  subscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void;

  unsubscribe<E extends AppEvent>(
    event: E,
    handler: (payload: EventPayload[E]) => void,
  ): void;
}

// Local implementation using Node.js EventEmitter
export class LocalEventBus implements EventPublisher, EventSubscriber {
  private emitter = new EventEmitter();

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<boolean> {
    this.emitter.emit(event, payload);
    return true;
  }

  // Other method implementations...
}

// Remote implementation using HTTP
export class RemoteEventBus implements EventPublisher, EventSubscriber {
  private serviceUrl: string;
  private subscriptions: Map<string, Array<Function>> = new Map();

  constructor(serviceUrl: string) {
    this.serviceUrl = serviceUrl;
  }

  async publish<E extends AppEvent>(
    event: E,
    payload: EventPayload[E],
  ): Promise<boolean> {
    const response = await fetch(`${this.serviceUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    });

    return response.ok;
  }

  // Other method implementations...
}

// Hybrid implementation for transition phase
export class HybridEventBus implements EventPublisher, EventSubscriber {
  private localBus: LocalEventBus;
  private remoteBusInstances: Map<string, RemoteEventBus> = new Map();
  private eventRoutingConfig: Map<AppEvent, "local" | "remote"> = new Map();
  private remoteServiceConfig: Map<AppEvent, string> = new Map();

  // Implementation...
}

// Currently using local event bus
export const distributedEventBus = new LocalEventBus();
```

## Migration Strategy to Full Microservices

The current architecture supports a gradual migration to full microservices:

### Phase 1: Modular Monolith (Current)

- All services run in the same process
- Service calls are in-memory function calls
- Uses `LocalServiceAdapter` implementations
- Event communication via `LocalEventBus`

### Phase 2: Hybrid Architecture (Partial Migration)

- Some services extracted to separate deployments
- Mixed use of `LocalServiceAdapter` and `RemoteServiceAdapter`
- Update `serviceConfigurations` for extracted services
- Event communication via `HybridEventBus`

### Phase 3: Full Microservices

- All services run as separate deployments
- All services use `RemoteServiceAdapter`
- All entries in `serviceConfigurations` set to `remote`
- Event communication via `RemoteEventBus`
- Service-to-service authentication

## Benefits of Current Architecture

1. **Flexibility**: Easy transition from monolith to microservices
2. **Separation of Concerns**: Clean service boundaries
3. **Independent Testing**: Services can be tested in isolation
4. **Deployment Options**: Services can be deployed together or separately
5. **Interface Stability**: Service interfaces remain stable during migration

## Implementation Status

Currently, the following services have been implemented using this architecture:

1. **Availability Service**: Complete implementation with repository
2. **User Service**: Complete implementation with repository
3. **Google Calendar Service**: Complete implementation with external API integration

## Future Enhancements

1. **Service Discovery**: Implementing dynamic service discovery
2. **Circuit Breaking**: Adding failure handling with circuit breakers
3. **Rate Limiting**: Implementing request rate limiting
4. **Observability**: Adding distributed tracing
5. **API Versioning**: Supporting multiple API versions simultaneously
