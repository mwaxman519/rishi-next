# Replit Database Configuration Guide

## Overview

This guide covers the configuration necessary to correctly use the Replit-provided PostgreSQL database in a Next.js application, specifically addressing authentication issues and environment detection.

## The Problem

When deploying the Rishi platform to Replit's staging environment, a common issue is database authentication failures with errors like:

```
Error: password authentication failed for user 'neondb_owner'
```

This typically occurs because the application is not correctly using the Replit-provided database credentials.

## Solution

### 1. Environment Detection

The first step is to properly detect when the application is running in a Replit environment. Add the following code to your database connection file:

```typescript
// app/lib/db.ts or similar database connection file

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Environment detection function
function isReplitEnvironment() {
  return (
    process.env.REPL_ID !== undefined && process.env.REPL_OWNER !== undefined
  );
}

// Configure database connection based on environment
export function getDatabaseClient() {
  // Use Replit-provided DATABASE_URL when in Replit environment
  if (isReplitEnvironment()) {
    console.log("Using Replit database configuration");

    // Ensure we're using the environment-provided DATABASE_URL
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required in Replit environment");
    }

    // Configure Neon client
    neonConfig.fetchConnectionCache = true;
    const sql = neon(connectionString);

    // Return Drizzle client
    return drizzle(sql);
  }

  // For production or other environments, use configured credentials
  console.log("Using production database configuration");

  // Fetch from environment variables, with appropriate fallbacks if needed
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  // Configure Neon client
  neonConfig.fetchConnectionCache = true;
  const sql = neon(connectionString);

  // Return Drizzle client
  return drizzle(sql);
}

// Export a singleton database client
export const db = getDatabaseClient();
```

### 2. Avoid Overriding Environment Variables

A common mistake is to override the `DATABASE_URL` environment variable in code:

```typescript
// ❌ Don't do this!
process.env.DATABASE_URL = "postgres://your_hardcoded_connection_string";
```

Instead, always use the environment-provided value:

```typescript
// ✅ Do this
const connectionString = process.env.DATABASE_URL;
```

### 3. Verify Connection on Startup

Add a verification step on application startup to test database connectivity:

```typescript
// app/lib/db.ts or similar

import { getDatabaseClient } from "./db";

// Function to verify database connection
export async function verifyDatabaseConnection() {
  try {
    const db = getDatabaseClient();
    // Execute a simple query
    const result = await db.execute(sql`SELECT 1 as connected`);
    console.log("Database connection verified successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Call this during app initialization or in a health check API
```

## Testing the Configuration

### 1. Create a Test Endpoint

Add a simple database test endpoint to verify connectivity:

```typescript
// app/api/healthcheck/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1 as connected`);
    return NextResponse.json({
      status: "Database connection successful",
      result,
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { status: "Database connection failed", error: error.message },
      { status: 500 },
    );
  }
}
```

### 2. Log Database Configuration

Add logging to verify the correct configuration is being used:

```typescript
// Add to db.ts or similar

function logDatabaseConfig() {
  // Don't log the full connection string for security reasons
  const isReplit = isReplitEnvironment();
  console.log(`Database configuration: ${isReplit ? "Replit" : "Production"}`);
  console.log(`Connection string exists: ${Boolean(process.env.DATABASE_URL)}`);
}

// Call this during initialization
logDatabaseConfig();
```

## Troubleshooting

### 1. Invalid Connection String Format

If you encounter errors about invalid connection string format, ensure the `DATABASE_URL` is properly formed:

```
postgresql://username:password@hostname:port/database
```

In Replit, the provided connection string should already be properly formatted.

### 2. Database Not Accessible

If the database itself isn't accessible:

1. Verify the Replit database feature is enabled for your repl
2. Check if there are any Replit system status issues
3. Try creating a new Repl to see if the issue persists

### 3. Permission Issues

If you have permission issues:

1. Ensure the schema has been properly initialized with Drizzle
2. Verify the database user has appropriate permissions
3. Check for any custom configurations in `drizzle.config.ts` that might be interfering

## Best Practices

1. **Never Hard-Code Credentials**: Always use environment variables for database connection details
2. **Implement Proper Error Handling**: Gracefully handle database connection failures
3. **Use Connection Pooling**: For production environments, implement connection pooling to optimize performance
4. **Set Up Automatic Schema Migrations**: Use Drizzle's migration capabilities for schema management
5. **Implement Connection Retries**: Add retry logic for transient connection issues

## Conclusion

By following this guide, you should be able to properly configure your Next.js application to connect to the Replit-provided PostgreSQL database without authentication failures. Remember to always prioritize the environment-provided `DATABASE_URL` when running in the Replit environment.
