/**
 * Database connection for Auth Microservice
 *
 * Provides database access for the auth service using Drizzle ORM.
 * This is a dedicated connection to ensure microservice-like independence.
 */
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../../lib/schema";

// Configure the Neon database client with WebSocket support
neonConfig.webSocketConstructor = ws;

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

// Extract credentials from the connection string to avoid neondb_owner issues
// Neon connection strings are in the format: postgres://user:password@host/database
let user, password, host, database, port;

if (connectionString) {
  try {
    // Parse the connection string to get the individual parts
    const dbUrl = new URL(connectionString);
    user = dbUrl.username;
    password = dbUrl.password;
    host = dbUrl.hostname;
    database = dbUrl.pathname.substring(1); // Remove leading '/'
    port = dbUrl.port ? parseInt(dbUrl.port, 10) : 5432;

    console.log(
      `[Auth Service] Successfully parsed database connection info for user: ${user}, host: ${host}`,
    );
  } catch (parseError) {
    console.error(
      "[Auth Service] Error parsing database connection string:",
      parseError,
    );
  }
}

// Environment-specific pool configuration
const poolConfigs = {
  development: {
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
  },
  staging: {
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
  production: {
    max: 30,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  },
};

// Get current environment for pool settings
const env = getEnvironment();
const poolConfig = poolConfigs[env];

// Pool configuration is now set based on environment

// Create a connection pool with explicit credentials to avoid neondb_owner issues
export const pool = new Pool({
  // Only use the connection string as a fallback
  connectionString,

  // Explicitly specify credentials to avoid neondb_owner issues
  user: user || process.env.PGUSER,
  password: password || process.env.PGPASSWORD,
  host: host || process.env.PGHOST,
  database: database || process.env.PGDATABASE,
  port: port || (process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432),

  // Add environment-specific connection pool settings
  ...poolConfig,
});

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

  // Get retry config for current environment
  const { maxRetries, delay } = retryConfigs[env];

  let retries = 0;
  let lastError = null;

  // Information about the current connection for diagnostics
  const diagnosticInfo = {
    environment: env,
    connectionMethod: connectionString ? "URL" : "PG Variables",
    hasIndividualVars: {
      PGUSER: !!process.env.PGUSER,
      PGHOST: !!process.env.PGHOST,
      PGDATABASE: !!process.env.PGDATABASE,
      PGPORT: !!process.env.PGPORT,
      PGPASSWORD: !!process.env.PGPASSWORD,
    },
    isReplit: process.env.REPL_ID !== undefined,
  };

  console.log(
    `[Auth Service] Testing database connection with config:`,
    diagnosticInfo,
  );

  while (retries <= maxRetries) {
    try {
      // Simple query to test connection
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT current_database() as db, current_user as user",
        );
        const dbInfo = result.rows[0];

        console.log(
          `[Auth Service] Database connection test successful after ${retries} retries`,
        );
        console.log(
          `[Auth Service] Connected to database: ${dbInfo.db} as user: ${dbInfo.user}`,
        );

        return {
          connected: true,
          timestamp: new Date().toISOString(),
          database: dbInfo.db,
          user: dbInfo.user,
          environment: env,
        };
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error;

      // Enhanced error reporting
      let errorDetails =
        lastError instanceof Error ? lastError.message : String(lastError);

      // Special handling for common Replit staging errors
      if (
        errorDetails.includes("password authentication failed") ||
        errorDetails.includes("neondb_owner")
      ) {
        console.error(
          `[Auth Service] Authentication error detected. This is likely due to incorrect credentials for environment: ${env}`,
        );
        console.error(
          `[Auth Service] Recommendation: Check that database credentials match the Replit environment`,
        );
      }

      console.error(
        `[Auth Service] Database connection test failed (attempt ${retries + 1}/${maxRetries + 1}):`,
        errorDetails,
      );

      // If we've reached max retries, exit the loop
      if (retries >= maxRetries) {
        break;
      }

      // Wait before trying again
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
    }
  }

  return {
    connected: false,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    retries,
    diagnosticInfo,
    environment: env,
    timestamp: new Date().toISOString(),
  };
}

// Create a Drizzle ORM instance with our schema - matching the main app approach
export const db = drizzle(pool, { schema });
