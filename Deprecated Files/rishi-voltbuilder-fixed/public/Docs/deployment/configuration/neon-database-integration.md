# Neon Database Integration

## Overview

Rishi exclusively uses Neon, a serverless PostgreSQL service, as our primary and only database solution. This document outlines our integration approach, schema design, and database access patterns in a fully serverless architecture.

## Why Neon as our Exclusive Database?

Neon Database provides critical advantages essential for our serverless architecture:

1. **Fully Serverless Solution**: Managed, serverless database that scales automatically with zero maintenance overhead.
2. **Azure Static App Compatibility**: The `@neondatabase/serverless` HTTP-based client enables seamless integration with Azure Static Web Apps.
3. **Branching for CI/CD**: Database branching capabilities that align perfectly with our CI/CD pipeline.
4. **True Scale to Zero**: Automatic scaling to zero when not in use, eliminating idle costs completely.
5. **Enterprise-Grade Performance**: Intelligent caching and optimized query execution for enterprise workloads.
6. **Modern PostgreSQL Features**: Access to advanced PostgreSQL features while maintaining a fully serverless architecture.

## Integration Details

### Connection

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Create a Neon client for serverless connections
const sql = neon(process.env.DATABASE_URL!);

// Create a Drizzle ORM instance with our schema
export const db = drizzle(sql, { schema });
```

### Schema Management

We exclusively use Drizzle ORM with Neon for fully type-safe, serverless database access:

1. **Serverless Schema Definition**: Defined in `src/shared/schema.ts` using Drizzle's Neon-compatible schema definition syntax.
2. **Edge-Compatible Migrations**: Managed through Drizzle Kit with `npm run db:push` for immediate schema updates and `drizzle-kit generate` for version-controlled migrations.
3. **Azure Static App Integration**: Schema optimized for deployment in Azure Static App serverless environments.

## Serverless Database Schema

Our core schema is designed for complete separation of concerns and optimal serverless performance with Neon:

1. **Users**: User accounts with role-based authentication for clients, agents, and administrators.
2. **AgentAvailability**: Isolated agent availability slots optimized for timezone-aware queries.
3. **Appointments**: Client-booked appointments with session segregation for privacy.
4. **Services**: Configurable service offerings with dynamic duration and pricing.
5. **Teams**: Organizational structure with hierarchical agent grouping.
6. **Notifications**: Event-driven notification system for appointment updates.
7. **Settings**: System-wide and user-specific configuration parameters.

## Data Access Patterns

### Repository Pattern

We implement a repository pattern to abstract database access:

```typescript
// Example repository for appointments
export class AppointmentRepository {
  async create(appointment: InsertAppointment): Promise<Appointment> {
    // Implementation
  }

  async findByUserId(userId: string): Promise<Appointment[]> {
    // Implementation
  }

  // Additional methods
}
```

### Azure Static Web App and Edge-Compatible Access

For true serverless deployment in Azure Static Web Apps, we leverage Neon's HTTP-based client with edge-optimized connection patterns:

```typescript
import { neon } from "@neondatabase/serverless";

// Azure Static Web App API route
export async function GET() {
  // Create per-request connection for optimal serverless performance
  const sql = neon(process.env.DATABASE_URL!);

  // Perform database query with parameterized SQL
  const userId = "123";
  const result = await sql`
    SELECT * FROM users 
    WHERE id = ${userId} AND status = 'active'
  `;

  // Return JSON response directly from edge function
  return Response.json({
    user: result[0],
    timestamp: new Date().toISOString(),
  });
}
```

## Security Considerations

1. **Connection Security**: All connections use TLS encryption.
2. **Data Encryption**: Sensitive data is encrypted at rest.
3. **Access Control**: Fine-grained database permissions based on user roles.
4. **Query Parameters**: Always use parameterized queries to prevent SQL injection.

## Serverless Performance Optimization

1. **Autoscaling Indexes**: Serverless-optimized indexes on frequently queried columns with Neon's autoscaling capabilities.
2. **Per-Request Connections**: Stateless connections for true serverless scalability instead of traditional connection pooling.
3. **Edge-Aware Query Optimization**: Smart query planning with minimized roundtrips for edge function environments.
4. **Branching-Based Isolation**: Using Neon's branching capabilities for isolated testing and staging environments.
5. **Cold Start Optimization**: Intelligent connection handling to minimize serverless cold start latency.
6. **Data Distribution**: Global edge caching strategies for frequently accessed reference data.
7. **Compute Isolation**: Separate read and write workloads using Neon's compute isolation capabilities.
