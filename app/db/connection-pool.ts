/**
 * Database connection pool configuration
 * This module configures the database connection pool based on the current environment
 */
import { Pool } from &quot;@neondatabase/serverless&quot;;
import { config } from &quot;@/config/environment&quot;;

/**
 * Create and configure a connection pool for the database
 * This optimizes connections for serverless environments
 */
export function createConnectionPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(&quot;DATABASE_URL is not defined&quot;);
  }

  // Create a connection pool with environment-specific configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: config.database.connectionPoolMax,
    min: config.database.connectionPoolMin,
    idleTimeoutMillis: config.database.idleTimeout,
    connectionTimeoutMillis: 10000, // 10 seconds
    allowExitOnIdle: process.env.NODE_ENV === &quot;development&quot;, // Only allow in development
  });

  // Add event listeners for connection management
  pool.on(&quot;connect&quot;, (client) => {
    if (config.logLevel === &quot;debug&quot;) {
      console.log(&quot;New database client connected&quot;);
    }

    // Set statement timeout
    client.query(
      `SET statement_timeout TO ${config.database.statementTimeout}`,
    );
  });

  pool.on(&quot;error&quot;, (err) => {
    console.error(&quot;Unexpected error on idle client&quot;, err);
  });

  pool.on(&quot;remove&quot;, () => {
    if (config.logLevel === &quot;debug&quot;) {
      console.log(&quot;Database client removed from pool&quot;);
    }
  });

  return pool;
}

// Create a singleton instance of the connection pool
const pool = createConnectionPool();

export default pool;
