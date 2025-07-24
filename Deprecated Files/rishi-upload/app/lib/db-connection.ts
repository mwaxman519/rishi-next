/**
 * Enhanced database connection handler
 * This module provides environment-aware database connection configuration
 */

import { Pool, neonConfig, PoolConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Configure the Neon database client with WebSocket support
neonConfig.webSocketConstructor = ws;

// Configuration for different environments
const poolConfigs = {
  development: {
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
  } as PoolConfig,
  staging: {
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  } as PoolConfig,
  production: {
    max: 30,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  } as PoolConfig,
};

// Detect current environment
export function getEnvironment(): "development" | "staging" | "production" {
  // Check if we're in a staging deployment
  const isStaging =
    process.env.DEPLOY_ENV === "staging" ||
    process.env.STAGING === "true" ||
    (typeof process.env.NODE_ENV === "string" &&
      process.env.NODE_ENV.includes("staging"));

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === "production" && !isStaging;

  if (isStaging) return "staging";
  if (isProduction) return "production";
  return "development";
}

// Get the appropriate database URL based on environment
export function getDatabaseUrl(): string {
  const env = getEnvironment();

  // Check for environment-specific database URLs first
  if (env === "staging" && process.env.STAGING_DATABASE_URL) {
    return process.env.STAGING_DATABASE_URL;
  }

  if (env === "production" && process.env.PRODUCTION_DATABASE_URL) {
    return process.env.PRODUCTION_DATABASE_URL;
  }

  // Fall back to the default DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  return process.env.DATABASE_URL;
}

// Get connection pool configuration for current environment
export function getPoolConfig(): PoolConfig {
  const env = getEnvironment();
  // TypeScript safety: ensure we have a valid configuration
  if (env === "staging") {
    return poolConfigs.staging;
  } else if (env === "production") {
    return poolConfigs.production;
  } else {
    // Default to development
    return poolConfigs.development;
  }
}

// Create a connection pool with environment-specific settings
export function createConnectionPool(): Pool {
  const databaseUrl = getDatabaseUrl();
  const poolConfig = getPoolConfig();

  console.log(
    `Creating database connection pool for ${getEnvironment()} environment`,
  );
  console.log(
    `Pool configuration: max=${poolConfig.max}, timeout=${poolConfig.connectionTimeoutMillis}ms`,
  );

  return new Pool({
    connectionString: databaseUrl,
    ...poolConfig,
  });
}

// Create the database connection pool
export const pool = createConnectionPool();

// Create a Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });

// Export a function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as now");
    console.log(
      `Database connection successful! Server time: ${result.rows[0].now}`,
    );
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  } finally {
    if (client) client.release();
  }
}
