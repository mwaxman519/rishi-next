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

// Create database connection using HTTP adapter
export function createDatabaseConnection() {
  const databaseUrl = getDatabaseUrl();
  const env = getEnvironment();
  const config = connectionConfigs[env];

  console.log(
    `Creating database connection for ${config.name} environment`,
  );

  return neon(databaseUrl);
}

// Create the database connection
export const sql = createDatabaseConnection();

// Create a Drizzle ORM instance with our schema
export const db = drizzle(sql, { schema });

// Export a function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as now`;
    console.log(
      `Database connection successful! Server time: ${result[0].now}`,
    );
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
