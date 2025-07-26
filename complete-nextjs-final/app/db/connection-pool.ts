/**
 * Database connection pool configuration
 * This module configures the database connection pool based on the current environment
 */
import { Pool } from "@neondatabase/serverless";
import { config } from "@/config/environment";

/**
 * Create and configure a connection pool for the database
 * This optimizes connections for serverless environments
 */
export function createConnectionPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  // Create a connection pool with environment-specific configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: config.database.connectionPoolMax,
    min: config.database.connectionPoolMin,
    idleTimeoutMillis: config.database.idleTimeout,
    connectionTimeoutMillis: 10000, // 10 seconds
    allowExitOnIdle: process.env.NODE_ENV === "development", // Only allow in development
  });

  // Add event listeners for connection management
  pool.on("connect", (client) => {
    if (config.logLevel === "debug") {
      console.log("New database client connected");
    }

    // Set statement timeout
    client.query(
      `SET statement_timeout TO ${config.database.statementTimeout}`,
    );
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });

  pool.on("remove", () => {
    if (config.logLevel === "debug") {
      console.log("Database client removed from pool");
    }
  });

  return pool;
}

// Create a singleton instance of the connection pool
const pool = createConnectionPool();

export default pool;
