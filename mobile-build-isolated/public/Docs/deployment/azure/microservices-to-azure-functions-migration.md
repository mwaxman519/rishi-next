# Microservices to Azure Functions Migration Strategy

## Executive Summary

This document outlines the comprehensive migration strategy for transforming your Next.js monolith with microservices architecture into Azure Static Web Apps with Azure Functions, ensuring seamless deployment and optimal performance.

## Current Architecture Analysis

### Existing Monolith Structure

```
app/
├── api/                          # API Routes (Convert to Azure Functions)
│   ├── auth/                     # Authentication services
│   ├── bookings/                 # Booking management microservice
│   ├── organizations/            # Organization management
│   ├── users/                    # User management
│   ├── rbac/                     # Role-based access control
│   ├── locations/                # Location services
│   ├── shifts/                   # Shift management
│   ├── timetracking/             # Time tracking services
│   └── analytics/                # Analytics and reporting
├── components/                   # React components (Static)
├── lib/                         # Utilities and services
└── shared/                      # Shared schemas and types
```

### Azure Functions Mapping Strategy

| Current API Route      | Azure Function          | Function Type | Runtime    |
| ---------------------- | ----------------------- | ------------- | ---------- |
| `/api/auth/*`          | `auth-function`         | HTTP Trigger  | Node.js 18 |
| `/api/bookings/*`      | `bookings-function`     | HTTP Trigger  | Node.js 18 |
| `/api/organizations/*` | `org-function`          | HTTP Trigger  | Node.js 18 |
| `/api/users/*`         | `users-function`        | HTTP Trigger  | Node.js 18 |
| `/api/rbac/*`          | `rbac-function`         | HTTP Trigger  | Node.js 18 |
| `/api/locations/*`     | `locations-function`    | HTTP Trigger  | Node.js 18 |
| `/api/shifts/*`        | `shifts-function`       | HTTP Trigger  | Node.js 18 |
| `/api/timetracking/*`  | `timetracking-function` | HTTP Trigger  | Node.js 18 |
| `/api/analytics/*`     | `analytics-function`    | HTTP Trigger  | Node.js 18 |

## Migration Phases

### Phase 1: API Route Consolidation (Current)

#### Automatic Next.js API Routes to Azure Functions

Azure Static Web Apps automatically converts Next.js API routes to Azure Functions during deployment:

```typescript
// app/api/bookings/route.ts (Current)
export async function GET(request: NextRequest) {
  // This automatically becomes an Azure Function
  return NextResponse.json(data);
}

// Becomes: Azure Function /api/bookings
```

#### No Code Changes Required

- Next.js API routes automatically deploy as Azure Functions
- Function runtime: Node.js 18
- Cold start optimization: Automatic
- Scaling: Automatic based on demand

### Phase 2: Service Boundaries Optimization

#### Database Connection Optimization

```typescript
// lib/db-azure-functions.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Optimized for Azure Functions cold starts
const sql = neon(process.env.DATABASE_URL!, {
  connectionTimeoutMillis: 5000,
  queryTimeoutMillis: 30000,
  // Connection pooling for serverless
  arrayMode: false,
  fullResults: false,
});

export const db = drizzle(sql, {
  schema,
  logger: false, // Disable logging in production functions
});

// Connection reuse pattern for Azure Functions
let cachedConnection: typeof db | null = null;

export async function getDbConnection() {
  if (!cachedConnection) {
    cachedConnection = db;
  }
  return cachedConnection;
}
```

#### Function-Specific Error Handling

```typescript
// lib/azure-function-wrapper.ts
import { NextRequest, NextResponse } from "next/server";

export function withAzureFunctionWrapper(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Azure Function specific initialization
      const startTime = Date.now();

      // Connection warmup for cold starts
      await getDbConnection();

      const result = await handler(request);

      // Azure Functions logging
      console.log(`Function execution time: ${Date.now() - startTime}ms`);

      return result;
    } catch (error) {
      console.error("Azure Function error:", error);

      // Structured error response for Azure monitoring
      return NextResponse.json(
        {
          error: "Internal server error",
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
        { status: 500 },
      );
    }
  };
}

// Usage in API routes
// app/api/bookings/route.ts
export const GET = withAzureFunctionWrapper(async (request: NextRequest) => {
  const db = await getDbConnection();
  const bookings = await db.query.bookings.findMany();
  return NextResponse.json(bookings);
});
```

### Phase 3: Performance Optimization for Serverless

#### Cold Start Mitigation

```typescript
// lib/warmup-strategy.ts
const warmupConnections = new Map();

export async function warmupFunction(functionName: string) {
  if (!warmupConnections.has(functionName)) {
    // Pre-warm database connection
    const db = await getDbConnection();

    // Pre-load critical data
    await Promise.all([
      db.query.organizations.findFirst(),
      db.query.users.findFirst(),
    ]);

    warmupConnections.set(functionName, true);
  }
}

// Implement in critical functions
export const GET = withAzureFunctionWrapper(async (request: NextRequest) => {
  await warmupFunction("bookings");
  // Function logic
});
```

#### Memory and Timeout Optimization

```json
// staticwebapp.config.json - Function configuration
{
  "platform": {
    "apiRuntime": "node:18",
    "apiTimeout": "00:05:00",
    "apiMemorySize": "512MB"
  },
  "functionAppSettings": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "WEBSITE_NODE_DEFAULT_VERSION": "18",
    "FUNCTIONS_EXTENSION_VERSION": "~4"
  }
}
```

## Event-Driven Architecture Migration

### Current Event Bus to Azure Service Bus

#### Event Publisher Migration

```typescript
// services/events/azure-service-bus-publisher.ts
import { ServiceBusClient } from "@azure/service-bus";

export class AzureEventPublisher {
  private client: ServiceBusClient;

  constructor() {
    this.client = new ServiceBusClient(
      process.env.AZURE_SERVICE_BUS_CONNECTION_STRING!,
    );
  }

  async publishEvent(topicName: string, event: any) {
    const sender = this.client.createSender(topicName);

    try {
      await sender.sendMessages({
        body: event,
        messageId: crypto.randomUUID(),
        timeToLive: 60 * 60 * 1000, // 1 hour
        contentType: "application/json",
      });
    } finally {
      await sender.close();
    }
  }
}

// Usage in Azure Functions
// app/api/bookings/route.ts
export const POST = withAzureFunctionWrapper(async (request: NextRequest) => {
  const bookingData = await request.json();

  // Save booking
  const booking = await db.insert(bookings).values(bookingData);

  // Publish event to Azure Service Bus
  const eventPublisher = new AzureEventPublisher();
  await eventPublisher.publishEvent("booking-created", {
    bookingId: booking.id,
    organizationId: booking.organizationId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(booking);
});
```

#### Event Subscriber via Azure Functions

```typescript
// functions/booking-event-processor/index.ts
import { app, InvocationContext } from "@azure/functions";

app.serviceBusQueue("bookingEventProcessor", {
  connection: "AzureServiceBusConnection",
  queueName: "booking-events",
  handler: async (message: any, context: InvocationContext) => {
    context.log("Processing booking event:", message);

    try {
      const { bookingId, organizationId } = message;

      // Process booking event
      await processBookingNotifications(bookingId);
      await updateAnalytics(organizationId);

      context.log("Booking event processed successfully");
    } catch (error) {
      context.error("Error processing booking event:", error);
      throw error; // This will move message to dead letter queue
    }
  },
});
```

## Database Strategy for Serverless

### Connection Pooling Optimization

```typescript
// lib/db-serverless-optimized.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Global connection pool for Azure Functions
let globalPool: Pool | null = null;

export function getConnectionPool() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Optimized for serverless
      min: 0, // No minimum connections
      max: 10, // Limit concurrent connections
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 5000, // 5 seconds
      // Azure Functions optimization
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Handle pool errors
    globalPool.on("error", (err) => {
      console.error("Database pool error:", err);
    });
  }

  return globalPool;
}

export const db = drizzle(getConnectionPool(), { schema });

// Graceful shutdown for Azure Functions
process.on("SIGTERM", async () => {
  if (globalPool) {
    await globalPool.end();
  }
});
```

### Transaction Management for Distributed Services

```typescript
// lib/distributed-transactions.ts
export class DistributedTransaction {
  private operations: Array<() => Promise<void>> = [];
  private rollbacks: Array<() => Promise<void>> = [];

  addOperation(operation: () => Promise<void>, rollback: () => Promise<void>) {
    this.operations.push(operation);
    this.rollbacks.push(rollback);
  }

  async execute() {
    const completedOperations: number[] = [];

    try {
      for (let i = 0; i < this.operations.length; i++) {
        await this.operations[i]();
        completedOperations.push(i);
      }
    } catch (error) {
      // Rollback completed operations in reverse order
      for (let i = completedOperations.length - 1; i >= 0; i--) {
        try {
          await this.rollbacks[completedOperations[i]]();
        } catch (rollbackError) {
          console.error("Rollback error:", rollbackError);
        }
      }
      throw error;
    }
  }
}

// Usage in booking creation across services
export async function createBookingWithNotifications(bookingData: any) {
  const transaction = new DistributedTransaction();

  let bookingId: string;
  let notificationId: string;

  // Add booking creation
  transaction.addOperation(
    async () => {
      const booking = await db.insert(bookings).values(bookingData);
      bookingId = booking.id;
    },
    async () => {
      if (bookingId) {
        await db.delete(bookings).where(eq(bookings.id, bookingId));
      }
    },
  );

  // Add notification creation
  transaction.addOperation(
    async () => {
      const notification = await createNotification(bookingId);
      notificationId = notification.id;
    },
    async () => {
      if (notificationId) {
        await deleteNotification(notificationId);
      }
    },
  );

  await transaction.execute();
  return bookingId;
}
```

## Monitoring and Observability for Azure Functions

### Application Insights Integration

```typescript
// lib/azure-function-telemetry.ts
import { ApplicationInsights } from "@azure/monitor-opentelemetry";

// Initialize Application Insights for Azure Functions
ApplicationInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .start();

export function trackFunctionExecution(
  functionName: string,
  duration: number,
  success: boolean,
) {
  const telemetryClient = ApplicationInsights.defaultClient;

  telemetryClient.trackEvent({
    name: "FunctionExecution",
    properties: {
      functionName,
      success: success.toString(),
      runtime: "azure-functions",
    },
    measurements: {
      duration,
    },
  });
}

export function trackDatabaseOperation(
  operation: string,
  duration: number,
  recordCount?: number,
) {
  const telemetryClient = ApplicationInsights.defaultClient;

  telemetryClient.trackDependency({
    target: "neon-postgresql",
    name: operation,
    data: operation,
    duration,
    resultCode: 200,
    success: true,
    dependencyTypeName: "SQL",
  });
}
```

### Custom Metrics and Alerts

```typescript
// lib/azure-function-metrics.ts
export class FunctionMetrics {
  static async trackColdStart(functionName: string, coldStartDuration: number) {
    console.log(
      JSON.stringify({
        metric: "cold_start",
        functionName,
        duration: coldStartDuration,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  static async trackMemoryUsage(functionName: string) {
    const usage = process.memoryUsage();
    console.log(
      JSON.stringify({
        metric: "memory_usage",
        functionName,
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  static async trackDatabaseConnectionPool(
    activeConnections: number,
    idleConnections: number,
  ) {
    console.log(
      JSON.stringify({
        metric: "db_connection_pool",
        activeConnections,
        idleConnections,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
```

## Security Considerations for Azure Functions

### Function-Level Authentication

```typescript
// lib/azure-function-auth.ts
import { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

export async function validateFunctionAccess(request: NextRequest) {
  // Check for Azure Static Web Apps authentication
  const clientPrincipal = request.headers.get("x-ms-client-principal");

  if (clientPrincipal) {
    const principal = JSON.parse(
      Buffer.from(clientPrincipal, "base64").toString(),
    );
    return {
      userId: principal.userId,
      roles: principal.userRoles,
      claims: principal.claims,
    };
  }

  // Fallback to JWT validation
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.substring(7);
  const payload = verify(token, process.env.NEXTAUTH_SECRET!);

  return payload;
}

// Usage in protected functions
export const GET = withAzureFunctionWrapper(async (request: NextRequest) => {
  const user = await validateFunctionAccess(request);

  // Function logic with authenticated user
  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, user.userId),
  });

  return NextResponse.json(userBookings);
});
```

### Environment Variables and Secrets Management

```typescript
// lib/azure-function-config.ts
export class AzureFunctionConfig {
  static getDatabaseUrl(): string {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    return url;
  }

  static getServiceBusConnection(): string {
    const connection = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    if (!connection) {
      throw new Error(
        "AZURE_SERVICE_BUS_CONNECTION_STRING environment variable is required",
      );
    }
    return connection;
  }

  static getApplicationInsightsKey(): string {
    const key = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    if (!key) {
      console.warn("Application Insights not configured");
      return "";
    }
    return key;
  }
}
```

## Migration Checklist

### Pre-Migration Preparation

- [ ] Audit all existing API routes and their dependencies
- [ ] Identify shared utilities and services
- [ ] Map database connection patterns
- [ ] Document current event flows
- [ ] Inventory environment variables and secrets

### Migration Execution

- [ ] Configure Azure Static Web Apps resource
- [ ] Set up Application Insights for monitoring
- [ ] Configure Azure Service Bus for events (if needed)
- [ ] Migrate environment variables to Azure
- [ ] Update database connection strings
- [ ] Test individual function deployments
- [ ] Validate cross-function communication
- [ ] Implement monitoring and alerting

### Post-Migration Validation

- [ ] Performance testing under load
- [ ] Cold start performance validation
- [ ] Database connection pool monitoring
- [ ] End-to-end functionality testing
- [ ] Security audit of function access controls
- [ ] Disaster recovery testing

## Performance Optimization Strategies

### Function Bundling Strategy

```javascript
// next.config.azure-production.mjs - Optimized for Azure Functions
const nextConfig = {
  output: "export",

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for Azure Functions
      config.optimization.splitChunks = {
        chunks: "all",
        maxSize: 200000, // 200KB max for faster cold starts
        cacheGroups: {
          // Single vendor chunk for shared dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 1,
            enforce: true,
          },
        },
      };

      // Reduce bundle complexity for faster initialization
      config.optimization.usedExports = false;
      config.optimization.providedExports = false;
    }
    return config;
  },
};
```

### Caching Strategy for Serverless

```typescript
// lib/azure-function-cache.ts
const functionCache = new Map<string, { data: any; expires: number }>();

export function getFunctionCache<T>(key: string): T | null {
  const cached = functionCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  functionCache.delete(key);
  return null;
}

export function setFunctionCache<T>(
  key: string,
  data: T,
  ttlMs: number = 300000,
) {
  functionCache.set(key, {
    data,
    expires: Date.now() + ttlMs,
  });
}

// Usage in functions
export const GET = withAzureFunctionWrapper(async (request: NextRequest) => {
  const cacheKey = `organizations:${userId}`;

  let organizations = getFunctionCache<Organization[]>(cacheKey);
  if (!organizations) {
    organizations = await db.query.organizations.findMany();
    setFunctionCache(cacheKey, organizations, 600000); // 10 minutes
  }

  return NextResponse.json(organizations);
});
```

## Conclusion

The migration from your current Next.js monolith to Azure Functions via Azure Static Web Apps requires minimal code changes due to automatic API route conversion. The key focus areas are:

1. **Database Connection Optimization**: Implementing connection pooling and reuse for serverless
2. **Event Architecture**: Migrating to Azure Service Bus for distributed events
3. **Performance Optimization**: Cold start mitigation and caching strategies
4. **Monitoring Integration**: Application Insights and custom metrics
5. **Security Enhancement**: Function-level authentication and secrets management

This strategy ensures your workforce management platform maintains enterprise-grade performance and reliability while leveraging Azure's serverless capabilities for automatic scaling and cost optimization.
