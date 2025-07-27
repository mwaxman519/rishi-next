# Database Management Guide

This guide covers the setup, verification, and management of the PostgreSQL database using Neon and Drizzle ORM in the application.

## Database Architecture

The application uses:

- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe ORM for database operations
- **Drizzle Kit**: Schema migrations and database management

## Database Connection Setup

### Connection Configuration

The database connection is configured in `server/db.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Create the database connection
export const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle with the schema
export const db = drizzle(sql, { schema });
```

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: The PostgreSQL connection string

In development, these are configured in `.env.local`.
In production, these are set in the hosting environment.

## Database Schema

### Schema Definition

The database schema is defined in `shared/schema.ts` using Drizzle's schema definition syntax:

```typescript
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // ...other fields
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// Create insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// Define types for type-safety
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
```

## Database Operations

### Query Operations

Database operations are defined in `server/storage.ts` implementing the `IStorage` interface:

```typescript
import { db } from "./db";
import { eq, and, or, inArray } from "drizzle-orm";
import { User, users, NewUser } from "../shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | null>;
  createUser(user: NewUser): Promise<User>;
  // ...other operations
}

// Implementation with Drizzle
export class DBStorage implements IStorage {
  async getUser(id: number): Promise<User | null> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return result;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async createUser(user: NewUser): Promise<User> {
    try {
      const [result] = await db.insert(users).values(user).returning();
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // ...other methods
}
```

### Schema Migrations

#### Push Schema Changes

To push schema changes to the database:

```bash
npm run db:push
```

This command uses Drizzle Kit to synchronize the database schema with your schema definition.

**Warning**: This can be destructive! Always backup your database before pushing schema changes.

#### Handling Data-Loss Warnings

If `db:push` shows data-loss warnings, you have several options:

1. Modify the schema to avoid data loss
2. Backup and manually migrate the data
3. If the data is not important, use SQL to drop the affected tables:

```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

## Database Verification

### Verifying Database Connectivity

The `verify-database.js` script checks database connectivity:

```javascript
async function verifyDatabaseConnection() {
  try {
    console.log("Checking DATABASE_URL environment variable...");
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set");
      process.exit(1);
    }

    console.log("Connecting to database...");
    // Test the connection
    // ...

    console.log("✅ Database connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database verification failed:", error);
    process.exit(1);
  }
}
```

Run it with:

```bash
node verify-database.js
```

### Database Health Check Script

This script can be used in CI/CD pipelines or as a pre-deployment check:

```bash
#!/bin/bash

echo "Verifying database connection..."
node verify-database.js

if [ $? -ne 0 ]; then
  echo "❌ Database verification failed. Deployment aborted."
  exit 1
fi

echo "✅ Database verification passed!"
```

## Common Database Issues

### Connection Issues

**Problem**: `No database connection string was provided to neon`

**Solution**:

1. Check that the `DATABASE_URL` environment variable is set
2. Verify the connection string format
3. Make sure the database server is accessible from your environment
4. Check for network/firewall issues

### Schema Sync Issues

**Problem**: Schema push fails with data-loss warnings

**Solution**:

1. Backup your data
2. Modify the schema to maintain compatibility
3. For development, drop the affected tables and re-push
4. For production, create a migration plan

### Performance Issues

**Problem**: Slow queries impacting application performance

**Solution**:

1. Add appropriate indexes to tables
2. Optimize query patterns
3. Use query batching where appropriate
4. Consider implementing caching for frequent queries

## Database Maintenance

### Regular Backups

If using Neon database:

- Neon provides automatic daily backups
- You can create manual branching points for additional safety

For other PostgreSQL providers:

- Schedule regular `pg_dump` backups
- Test restore procedures periodically

### Monitoring

Monitor the database for:

- Connection pool usage
- Query performance
- Disk space usage
- Error rates

### Security Best Practices

1. Use connection pooling to manage connections efficiently
2. Never expose the database directly to the internet
3. Use prepared statements to prevent SQL injection
4. Keep the PostgreSQL version up to date
5. Use the principle of least privilege for database users

## Resources

- [Neon Database Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle-Zod Integration](https://orm.drizzle.team/docs/zod)
