/**
 * Enhanced database connection handler
 * This module provides environment-aware database connection configuration
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../shared/schema";

// Configuration for different environments (not needed for HTTP adapter)
const connectionConfigs = {
  development: {
    name: "development",
    description: "Development environment",
  },
  staging: {
    name: "staging",
    description: "Staging environment",
  },
  production: {
    name: "production",
    description: "Production environment",
  },
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

  // CRITICAL SECURITY: Environment-specific database URLs - NO CROSS-ENVIRONMENT ACCESS
  if (env === "staging") {
    if (!process.env.STAGING_DATABASE_URL) {
      throw new Error("SECURITY: STAGING_DATABASE_URL must be set for staging environment");
    }
    return process.env.STAGING_DATABASE_URL;
  }

  if (env === "production") {
    // In production, check for DATABASE_URL (Vercel) or PRODUCTION_DATABASE_URL (Azure)
    const productionUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      throw new Error("SECURITY: DATABASE_URL must be set for production environment");
    }
    // Additional security check: Never allow production database access from non-production environments
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`SECURITY: Production database access attempted from non-production environment. NODE_ENV: ${process.env.NODE_ENV}`);
    }
    return productionUrl;
  }

  // Development environment - only allow development database
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set for development environment. Did you forget to provision a database?",
    );
  }

  return process.env.DATABASE_URL;
}

// Create database connection using HTTP adapter (lazy-loaded)
export function createDatabaseConnection() {
  const databaseUrl = getDatabaseUrl();
  const env = getEnvironment();
  const config = connectionConfigs[env];

  // Only log in development to avoid build-time issues
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `Creating database connection for ${config.name} environment`,
    );
  }

  return neon(databaseUrl);
}

// Lazy-loaded database connection (only connects when first accessed)
let _sql: ReturnType<typeof neon> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function getSql() {
  if (!_sql) {
    _sql = createDatabaseConnection();
  }
  return _sql;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
  }
  return _db;
}

// Export the lazy-loaded instances
export const sql = getSql();
export const db = getDb();

// Export a function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const sqlInstance = getSql();
    const result = await sqlInstance`SELECT NOW() as now`;
    const dbResult = result[0];
    if (!dbResult) {
      throw new Error('Database connection test returned empty result');
    }
    
    // Only log in development to avoid build-time issues
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Database connection successful! Server time: ${dbResult.now}`,
      );
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Database connection failed:", error);
    }
    return false;
  }
}
