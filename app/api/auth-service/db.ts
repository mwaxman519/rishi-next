/**
 * Database connection for Auth Microservice
 *
 * Provides database access for the auth service using Drizzle ORM.
 * This is a dedicated connection to ensure microservice-like independence.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../../../shared/schema";

// Simplified environment detection
export function getEnvironment(): "development" | "staging" | "production" {
  // Check if we're in Replit and the URL/ID includes 'staging'
  const isReplit = process.env.REPL_ID !== undefined;
  const isReplitStaging =
    isReplit &&
    (process.env.REPL_SLUG?.includes("staging") ||
      process.env.REPL_ID?.includes("staging"));

  // Check for explicit environment variables
  const isStaging =
    isReplitStaging ||
    process.env.DEPLOY_ENV === "staging" ||
    process.env.STAGING === "true";

  // Production check
  const isProd = process.env.NODE_ENV === "production" && !isStaging;

  if (isStaging) return "staging";
  if (isProd) return "production";
  return "development";
}

// Get environment-specific database URL
function getDatabaseUrl(): string {
  const env = getEnvironment();
  console.log(`[Auth Service] Detected environment: ${env}`);

  // Check for environment-specific database URLs first
  if (env === "staging" && process.env.STAGING_DATABASE_URL) {
    return process.env.STAGING_DATABASE_URL;
  }

  if (env === "production" && process.env.PRODUCTION_DATABASE_URL) {
    return process.env.PRODUCTION_DATABASE_URL;
  }

  // Fall back to the default DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error(
      "[Auth Service] DATABASE_URL must be set. Did you forget to provision a database?",
    );
    // Still return undefined to allow for PG* variables fallback
  }

  return process.env.DATABASE_URL;
}

// Get the connection URL with proper environment detection
const connectionString = getDatabaseUrl();

// Create database connection using HTTP adapter
export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

/**
 * Test the database connection with retry logic
 */
export async function testConnection() {
  // Environment-specific retry configuration
  const retryConfigs = {
    development: { maxRetries: 2, delay: 500 },
    staging: { maxRetries: 3, delay: 1000 },
    production: { maxRetries: 4, delay: 1500 },
  };

  const env = getEnvironment();

  console.log(`[Auth Service] Testing database connection for ${env} environment`);

  try {
    // Simple query to test connection using HTTP adapter
    const result = await sql`SELECT current_database() as db, current_user as user`;
    const dbInfo = result[0];

    if (!dbInfo) {
      throw new Error('Database connection test returned empty result');
    }

    console.log(`[Auth Service] Database connection test successful`);
    console.log(`[Auth Service] Connected to database: ${dbInfo.db} as user: ${dbInfo.user}`);

    return {
      connected: true,
      timestamp: new Date().toISOString(),
      database: dbInfo.db,
      user: dbInfo.user,
      environment: env,
    };
  } catch (error) {
    console.error(`[Auth Service] Database connection test failed:`, error);
    
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      environment: env,
      timestamp: new Date().toISOString(),
    };
  }
}
