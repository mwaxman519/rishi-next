/**
 * Database Configuration
 *
 * This module provides utilities for database connections with environment-specific settings.
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { getEnvironment } from "./environment";

/**
 * Get the database connection URL for the current environment
 */
export function getDatabaseUrl(): string {
  const environment = getEnvironment();

  // Determine database URL based on environment
  if (environment === "development") {
    return process.env.DATABASE_URL || "";
  } else if (environment === "staging") {
    return process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL || "";
  } else {
    return process.env.PRODUCTION_DATABASE_URL || "";
  }
}

/**
 * Create a database pool for the current environment
 */
export function createDbPool(): Pool {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    throw new Error(
      `No database URL provided for environment: ${getEnvironment()}`,
    );
  }

  return new Pool({ connectionString: dbUrl });
}

/**
 * Create a drizzle ORM instance for the current environment
 */
export function createDb() {
  const pool = createDbPool();
  return drizzle(pool);
}

/**
 * Environment-specific database configuration
 */
export const dbConfig = {
  development: {
    poolConfig: {
      max: 10,
      connectionTimeoutMillis: 3000,
    },
    allowTestData: true,
  },
  staging: {
    poolConfig: {
      max: 20,
      connectionTimeoutMillis: 5000,
    },
    allowTestData: true,
  },
  production: {
    poolConfig: {
      max: 30,
      connectionTimeoutMillis: 10000,
    },
    allowTestData: false,
  },
};

/**
 * Get the database configuration for the current environment
 */
export function getDbConfig() {
  const environment = getEnvironment();
  return dbConfig[environment];
}
