/**
 * Neon Postgres Caching Configuration
 *
 * This module provides optimized database connection and caching strategies
 * for Neon Postgres specifically for documentation and other read-heavy operations.
 */

import { neon } from &quot;@neondatabase/serverless&quot;;
import { drizzle } from &quot;drizzle-orm/neon-http&quot;;
import * as schema from &quot;@shared/schema&quot;;

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    &quot;DATABASE_URL must be set. Did you forget to provision a database?&quot;,
  );
}

// HTTP-based connection configuration (no WebSocket)
const neonConfig = {
  fullResults: true,
  arrayMode: false,
};

// Create HTTP-based connection for documentation
const docSql = neon(process.env.DATABASE_URL, neonConfig);

// Main application HTTP connection
const sql = neon(process.env.DATABASE_URL, neonConfig);

// Documentation-specific database client
export const docDb = drizzle(docSql, { schema });

// Main application database client
export const db = drizzle(sql, { schema });

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
