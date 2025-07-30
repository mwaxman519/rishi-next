/**
 * Database-backed documentation caching for improved performance
 *
 * This module provides database caching for documentation content,
 * significantly improving load times by persisting rendered documentation
 * in the database with appropriate cache invalidation strategies.
 */

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Cache settings
const DOCS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ALLOW_STALE_WHILE_REVALIDATING = true;

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Documentation database caching will be disabled.",
  );
}

// Create HTTP connection for docs (no WebSocket)
const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL, {
      fullResults: true,
      arrayMode: false,
    })
  : null;

// Initialize the docs cache table if it doesn't exist
async function initDocsCacheTable() {
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS docs_cache (
        path TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        content_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_docs_cache_updated_at ON docs_cache(updated_at)
    `;

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
  if (!sql) return false;
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
  if (!sql || !(await ensureInitialized())) return false;

  try {
    // Calculate content hash for cache validation
    const contentHash = crypto
      .createHash("md5")
      .update(content + JSON.stringify(metadata))
      .digest("hex");

    // Store in database
    await sql`
      INSERT INTO docs_cache (path, content, metadata, content_hash, updated_at)
      VALUES (${path}, ${content}, ${JSON.stringify(metadata)}, ${contentHash}, NOW())
      ON CONFLICT (path) 
      DO UPDATE SET 
        content = ${content},
        metadata = ${JSON.stringify(metadata)},
        content_hash = ${contentHash},
        updated_at = NOW()
    `;

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
  if (!sql || !(await ensureInitialized())) return null;

  try {
    const result = await sql`
      SELECT 
        content, 
        metadata, 
        updated_at,
        content_hash
      FROM docs_cache 
      WHERE path = ${path}
    `;

    if (result.length === 0) {
      console.log(`[DOCS DB] Cache miss for ${path}`);
      return null;
    }

    const dbResult = result[0];
    if (!dbResult) {
      console.log(`[DOCS DB] Empty result for ${path}`);
      return null;
    }

    const { content, metadata, updated_at, content_hash } = dbResult;

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
  if (!sql || !(await ensureInitialized())) return true;

  try {
    // Calculate content hash for the current content
    const contentHash = crypto
      .createHash("md5")
      .update(content + JSON.stringify(metadata))
      .digest("hex");

    // Get cached hash
    const result = await sql`
      SELECT content_hash
      FROM docs_cache 
      WHERE path = ${path}
    `;

    if (result.length === 0) {
      return true; // Not in cache, needs validation
    }

    const dbResult = result[0];
    if (!dbResult) {
      return true; // Empty result, needs validation
    }

    const cachedHash = dbResult.content_hash;
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
  if (!sql || !(await ensureInitialized())) return;

  try {
    const result = await sql`
      DELETE FROM docs_cache 
      WHERE updated_at < NOW() - INTERVAL '${maxAgeDays} days'
      RETURNING path
    `;

    console.log(`[DOCS DB] Purged ${result.length} stale cache entries`);
  } catch (error) {
    console.error("[DOCS DB] Error purging stale cache:", error);
  }
}
