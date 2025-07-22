/**
 * Database connection for Auth Microservice
 *
 * Provides database access for the auth service using Drizzle ORM.
 * This is a dedicated connection to ensure microservice-like independence.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// CRITICAL ENVIRONMENT DETECTION - BUILD TIME = PRODUCTION, REPLIT AUTOSCALE = STAGING, VERCEL = PRODUCTION
export function getEnvironment(): "development" | "staging" | "production" {
  // MOBILE BUILD OVERRIDE: During npm run build, always use production for VoltBuilder
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NODE_ENV === 'production') {
    return "production";
  }

  // Check if we're in Vercel production (PRODUCTION environment)
  const isVercelProduction = 
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL === "1";

  // Check if we're in Replit Autoscale (STAGING environment) 
  const isReplitAutoscale = 
    process.env.REPLIT === "1" ||
    process.env.REPLIT_DEPLOYMENT === "1" ||
    process.env.REPLIT_DOMAINS;

  // Check for explicit staging environment variables
  const isStaging =
    process.env.DEPLOY_ENV === "staging" ||
    process.env.STAGING === "true" ||
    process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
    isReplitAutoscale;

  // Development environment check (only during dev server)
  const isDevelopment = 
    process.env.NODE_ENV === "development" && 
    process.env.NEXT_PHASE !== 'phase-production-build';

  if (isVercelProduction) return "production";
  if (isStaging) return "staging"; 
  if (isDevelopment) return "development";
  
  // Default to production for builds
  return "production";
}

// Get environment-specific database URL
function getDatabaseUrl(): string {
  const env = getEnvironment();
  console.log(`[Auth Service] Detected environment: ${env}`);

  // Check for environment-specific database URLs first
  if (env === "staging" && process.env.STAGING_DATABASE_URL) {
    return process.env.STAGING_DATABASE_URL;
  }

  if (env === "production") {
    const productionUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
    if (productionUrl) {
      console.log(`[Auth Service] Using production database for ${env} environment`);
      return productionUrl;
    }
  }

  // Fall back to the default DATABASE_URL (which should be production-ready)
  if (!process.env.DATABASE_URL) {
    console.error(
      "[Auth Service] DATABASE_URL must be set. Did you forget to provision a database?",
    );
    throw new Error("DATABASE_URL is required for database connection");
  }

  console.log(`[Auth Service] Using DATABASE_URL for ${env} environment`);
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
