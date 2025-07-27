/**
 * Database-backed documentation caching for improved performance
 *
 * This module provides database caching for documentation content,
 * significantly improving load times by persisting rendered documentation
 * in the database with appropriate cache invalidation strategies.
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import crypto from "crypto";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Cache settings
const DOCS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ALLOW_STALE_WHILE_REVALIDATING = true;

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Documentation database caching will be disabled.",
  );
}

// Create connection pool with optimized settings for docs
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Smaller pool size for docs
      idleTimeoutMillis: 30000,
      statement_cache_size: 50,
      keepalive: true,
    })
  : null;

// Initialize the docs cache table if it doesn't exist
async function initDocsCacheTable() {
  if (!pool) return false;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS docs_cache (
        path TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        content_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_docs_cache_updated_at ON docs_cache(updated_at)
    `);

    console.log("[DOCS DB] Cache table initialized successfully");
    return true;
  } catch (error) {
    console.error("[DOCS DB] Error initializing cache table:", error);
    return false;
  }
}

// Check if table exists and initialize it if not
let isInitialized = false;
async function ensureInitialized() {
  if (!pool) return false;
  if (isInitialized) return true;

  isInitialized = await initDocsCacheTable();
  return isInitialized;
}

/**
 * Store rendered documentation in the database cache
 */
export async function cacheDocumentInDb(
  path: string,
  content: string,
  metadata: any,
) {
  if (!pool || !(await ensureInitialized())) return false;

  try {
    // Calculate content hash for cache validation
    const contentHash = crypto
      .createHash("md5")
      .update(content + JSON.stringify(metadata))
      .digest("hex");

    // Store in database
    await pool.query(
      `
      INSERT INTO docs_cache (path, content, metadata, content_hash, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (path) 
      DO UPDATE SET 
        content = $2,
        metadata = $3,
        content_hash = $4,
        updated_at = NOW()
      `,
      [path, content, JSON.stringify(metadata), contentHash],
    );

    console.log(`[DOCS DB] Cached document ${path}`);
    return true;
  } catch (error) {
    console.error(`[DOCS DB] Error caching document ${path}:`, error);
    return false;
  }
}

/**
 * Get cached documentation from the database
 */
export async function getCachedDocumentFromDb(path: string): Promise<{
  content: string;
  metadata: any;
  isStale: boolean;
} | null> {
  if (!pool || !(await ensureInitialized())) return null;

  try {
    const result = await pool.query(
      `
      SELECT 
        content, 
        metadata, 
        updated_at,
        content_hash
      FROM docs_cache 
      WHERE path = $1
      `,
      [path],
    );

    if (result.rows.length === 0) {
      console.log(`[DOCS DB] Cache miss for ${path}`);
      return null;
    }

    const { content, metadata, updated_at, content_hash } = result.rows[0];

    // Check if cache is stale
    const updatedTime = new Date(updated_at).getTime();
    const currentTime = Date.now();
    const isStale = currentTime - updatedTime > DOCS_CACHE_TTL;

    // Even if stale, return content with isStale flag for stale-while-revalidate pattern
    if (isStale) {
      console.log(
        `[DOCS DB] Cache stale for ${path}, last updated ${updated_at}`,
      );

      // If stale-while-revalidate is not enabled, return null to force refresh
      if (!ALLOW_STALE_WHILE_REVALIDATING) {
        return null;
      }
    } else {
      console.log(`[DOCS DB] Cache hit for ${path}`);
    }

    return {
      content,
      metadata: JSON.parse(metadata),
      isStale,
    };
  } catch (error) {
    console.error(`[DOCS DB] Error retrieving cached document ${path}:`, error);
    return null;
  }
}

/**
 * Check if a document needs to be revalidated based on content hash
 */
export async function shouldRevalidateDocument(
  path: string,
  content: string,
  metadata: any,
): Promise<boolean> {
  if (!pool || !(await ensureInitialized())) return true;

  try {
    // Calculate content hash for the current content
    const contentHash = crypto
      .createHash("md5")
      .update(content + JSON.stringify(metadata))
      .digest("hex");

    // Get cached hash
    const result = await pool.query(
      `
      SELECT content_hash
      FROM docs_cache 
      WHERE path = $1
      `,
      [path],
    );

    if (result.rows.length === 0) {
      return true; // Not in cache, needs validation
    }

    const cachedHash = result.rows[0].content_hash;
    const needsRevalidation = contentHash !== cachedHash;

    if (needsRevalidation) {
      console.log(`[DOCS DB] Content changed for ${path}, needs revalidation`);
    }

    return needsRevalidation;
  } catch (error) {
    console.error(`[DOCS DB] Error checking revalidation for ${path}:`, error);
    return true; // Default to revalidation on error
  }
}

/**
 * Purge stale entries from the cache
 */
export async function purgeStaleDocCache(maxAgeDays = 30) {
  if (!pool || !(await ensureInitialized())) return;

  try {
    const result = await pool.query(
      `
      DELETE FROM docs_cache 
      WHERE updated_at < NOW() - INTERVAL '${maxAgeDays} days'
      RETURNING path
      `,
    );

    console.log(`[DOCS DB] Purged ${result.rowCount} stale cache entries`);
  } catch (error) {
    console.error("[DOCS DB] Error purging stale cache:", error);
  }
}
