/**
 * Database connection for Auth Microservice
 *
 * Provides database access for the auth service using Drizzle ORM.
 * This is a dedicated connection to ensure microservice-like independence.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// CRITICAL ENVIRONMENT DETECTION WITH STRICT SEPARATION
export function getEnvironment(): "development" | "staging" | "production" {
  // HIGHEST PRIORITY: Explicit environment overrides
  if (process.env.FORCE_ENVIRONMENT === "development") return "development";
  if (process.env.FORCE_ENVIRONMENT === "staging") return "staging";
  if (process.env.FORCE_ENVIRONMENT === "production") return "production";

  // DEVELOPMENT: Local development server (NODE_ENV=development AND not in build)
  if (process.env.NODE_ENV === "development" && 
      process.env.NEXT_PHASE !== 'phase-production-build') {
    return "development";
  }

  // PRODUCTION: Vercel production environment
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL === "1") {
    return "production";
  }

  // STAGING: Replit Autoscale deployment
  if (process.env.REPLIT === "1" || 
      process.env.REPLIT_DEPLOYMENT === "1" || 
      process.env.REPLIT_DOMAINS ||
      process.env.DEPLOY_ENV === "staging" ||
      process.env.NEXT_PUBLIC_APP_ENV === "staging") {
    return "staging";
  }

  // BUILD TIME: During VoltBuilder builds, use production (but with explicit env check)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Only use production if we have PRODUCTION_DATABASE_URL or explicit production env
    if (process.env.PRODUCTION_DATABASE_URL || process.env.FORCE_ENVIRONMENT === "production") {
      return "production";
    }
    // Otherwise use staging for builds to avoid dev/prod cross-contamination
    return "staging";
  }

  // PRODUCTION: Any other NODE_ENV=production scenario
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  // DEFAULT: Development (safest for unknown scenarios)
  return "development";
}

// Get environment-specific database URL with strict separation
function getDatabaseUrl(): string {
  const env = getEnvironment();
  console.log(`[Auth Service] Detected environment: ${env}`);

  // STRICT ENVIRONMENT-SPECIFIC DATABASE SEPARATION
  if (env === "development") {
    // Development MUST use development-specific database or default DATABASE_URL
    const devUrl = process.env.DEV_DATABASE_URL || process.env.DATABASE_URL;
    if (!devUrl) {
      console.error("[Auth Service] Development environment requires DATABASE_URL or DEV_DATABASE_URL");
      throw new Error("Development database URL not configured");
    }
    console.log(`[Auth Service] Using development database`);
    return devUrl;
  }

  if (env === "staging") {
    // Staging MUST use staging-specific database
    if (process.env.STAGING_DATABASE_URL) {
      console.log(`[Auth Service] Using staging database`);
      return process.env.STAGING_DATABASE_URL;
    }
    // Fallback to DATABASE_URL only if no staging URL is set (current Replit setup)
    if (process.env.DATABASE_URL) {
      console.log(`[Auth Service] Using DATABASE_URL for staging (no STAGING_DATABASE_URL set)`);
      return process.env.DATABASE_URL;
    }
    console.error("[Auth Service] Staging environment requires STAGING_DATABASE_URL or DATABASE_URL");
    throw new Error("Staging database URL not configured");
  }

  if (env === "production") {
    // Production MUST use production-specific database
    const prodUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
    if (!prodUrl) {
      console.error("[Auth Service] Production environment requires PRODUCTION_DATABASE_URL or DATABASE_URL");
      throw new Error("Production database URL not configured");
    }
    console.log(`[Auth Service] Using production database`);
    return prodUrl;
  }

  // Should never reach here, but fail safe
  console.error(`[Auth Service] Unknown environment: ${env}`);
  throw new Error(`Unknown environment: ${env}`);
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
