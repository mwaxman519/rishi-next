/**
 * Neon Postgres Caching Configuration
 *
 * This module provides optimized database connection and caching strategies
 * for Neon Postgres specifically for documentation and other read-heavy operations.
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connection pool configuration with caching settings
const poolConfig = {
  connectionString: process.env.DATABASE_URL,

  // Connection pool settings
  max: 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // How long a client remains idle before being closed

  // Statement cache settings
  statement_cache_size: 100, // Number of prepared statements to cache
  statement_cache_capacity: 100, // Maximum capacity of the statement cache

  // Query defaults
  query_timeout: 30000, // 30 seconds timeout for queries

  // Use keep-alive for better performance with serverless functions
  keepalive: true,
  keepaliveInitialDelayMillis: 30000, // 30 seconds delay before starting keep-alive
};

// Create a documentation-specific connection pool
// This pool is optimized for read-heavy operations
const docPool = new Pool({
  ...poolConfig,

  // Read-only pool for documentation
  max: 5, // Fewer connections needed for read-only operations

  // Additional settings for read-heavy workloads
  application_name: "docs", // Tag connections for monitoring
});

// Main application pool
export const pool = new Pool(poolConfig);

// Documentation-specific database client
export const docDb = drizzle(docPool, { schema });

// Main application database client
export const db = drizzle(pool, { schema });

/**
 * Execute a cached database query specifically for documentation
 * This function adds additional caching for documentation queries
 */
export async function cachedDocQuery<T>(
  queryFn: (db: ReturnType<typeof drizzle>) => Promise<T>,
  cacheKey: string,
  ttlMs: number = 3600000, // 1 hour default TTL
): Promise<T> {
  // Internal cache storage
  const cache: Record<string, { data: T; timestamp: number }> = {};

  // Check if we have a valid cached result
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < ttlMs) {
    console.log(`[DB CACHE] Using cached result for ${cacheKey}`);
    return cache[cacheKey].data;
  }

  // If not in cache or expired, execute the query
  console.log(`[DB CACHE] Cache miss for ${cacheKey}, executing query`);
  try {
    // Use the documentation-specific pool
    const result = await queryFn(docDb);

    // Store in cache
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
    };

    return result;
  } catch (error) {
    console.error(
      `[DB CACHE] Error executing cached query ${cacheKey}:`,
      error,
    );
    throw error;
  }
}
