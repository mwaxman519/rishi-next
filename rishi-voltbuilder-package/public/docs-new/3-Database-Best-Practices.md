# Database Best Practices

## Overview

This document outlines best practices for working with the PostgreSQL database through Drizzle ORM, focusing on type safety, schema management, and deployment considerations.

## Type-Safe Database Operations

### Schema Definition

All database table schemas should be defined in `shared/schema.ts` using Drizzle's type-safe schema definition:

```typescript
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schema (excluding auto-generated fields)
export const insertUserSchema = createInsertSchema(users, {
  // Add additional Zod validation here if needed
}).omit({ id: true, createdAt: true });

// Create types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;
```

### Type-Safe Queries

Always use the types generated from your schema when performing database operations:

```typescript
import { db } from "@/server/db";
import { users, InsertUser, SelectUser } from "@/shared/schema";
import { prepareDateForDB } from "@/shared/utils";

// Inserting a user with type safety
async function createUser(userData: InsertUser): Promise<SelectUser> {
  // Process dates properly
  const result = await db
    .insert(users)
    .values({
      ...userData,
      birthDate: userData.birthDate
        ? prepareDateForDB(userData.birthDate as Date)
        : null,
    })
    .returning();

  return result[0];
}

// Updating a user with type safety
async function updateUser(
  id: string,
  userData: Partial<InsertUser>,
): Promise<SelectUser | null> {
  // Process dates if present
  const dataToUpdate = { ...userData };
  if (userData.birthDate) {
    dataToUpdate.birthDate = prepareDateForDB(userData.birthDate as Date);
  }

  const result = await db
    .update(users)
    .set(dataToUpdate)
    .where(eq(users.id, id))
    .returning();

  return result[0] || null;
}
```

## Schema Migration

### Using Drizzle Kit for Migrations

Always use Drizzle Kit to generate and apply migrations:

```bash
# Generate migrations based on schema changes
npm run db:generate

# Apply migrations to the database
npm run db:migrate
```

### Direct Schema Push

For development environments or initial setup, you can use Drizzle's push functionality:

```bash
# Push schema changes directly to the database
npm run db:push
```

⚠️ **Warning**: In production environments, always use proper migrations rather than direct schema pushes to prevent data loss.

## Database Verification

Before deployment, always verify database connectivity and schema:

```typescript
// Example verification function
async function verifyDatabaseConnection() {
  try {
    // Test connection
    const result = await db
      .select({ count: sql`count(*)` })
      .from(sql`information_schema.tables`);

    // Check specific tables
    const tables = await db
      .select({ tableName: sql`table_name` })
      .from(sql`information_schema.tables`)
      .where(sql`table_schema = 'public'`);

    console.log(
      `Successfully connected to database. Found ${tables.length} tables.`,
    );
    return true;
  } catch (error) {
    console.error("Database verification failed:", error);
    return false;
  }
}
```

We've implemented this verification in `verify-database.js` and it should be run as part of the pre-deployment checks.

## Data Type Handling

### Date Handling

Always use the utility functions in `shared/utils.ts` for date conversions:

```typescript
import { prepareDateForDB, prepareDBDateForApp } from "@/shared/utils";

// When sending dates to the database
const dbDate = prepareDateForDB(myDateObject);

// When retrieving dates from the database
const appDate = prepareDBDateForApp(dbDateString);
```

### JSON and Array Data

When working with JSON or array columns:

```typescript
import { json, text } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  tags: text("tags").array(),
});
```

Always validate data before insertion:

```typescript
// Validate JSON data
const metadataSchema = z.record(z.string(), z.unknown());
const validatedMetadata = metadataSchema.parse(incomingMetadata);

// Validate array data
const tagsSchema = z.array(z.string());
const validatedTags = tagsSchema.parse(incomingTags);

await db.insert(products).values({
  id: crypto.randomUUID(),
  name: "Product Name",
  metadata: validatedMetadata,
  tags: validatedTags,
});
```

## Error Handling

Implement proper error handling for database operations:

```typescript
async function safeDbOperation<T>(
  operation: () => Promise<T>,
): Promise<[T | null, Error | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    console.error("Database operation failed:", error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

// Usage
const [user, error] = await safeDbOperation(() =>
  db.select().from(users).where(eq(users.id, userId)).limit(1),
);

if (error) {
  // Handle error appropriately
}
```

## Connection Pooling

For production environments, consider implementing connection pooling to improve performance:

```typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });
```

## Backup and Recovery

Implement regular database backups:

```bash
# Example backup script
pg_dump $DATABASE_URL > backup_$(date +%Y-%m-%d).sql
```

Store backup scripts in the `scripts` directory and document the backup and recovery procedures.
