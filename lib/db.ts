/**
 * Database connection module
 * Provides database connection and ORM instance for the application
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Lazy-load database connection to prevent build-time errors
let _sql: ReturnType<typeof neon> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDatabaseUrl() {
  const isVoltBuilder = process.env.VOLTBUIILDER_BUILD === 'true';
  if (process.env.NODE_ENV === 'production' && isVoltBuilder) {
    console.warn('[DB] Using in-memory database for VoltBuilder build.');
    return 'sqlite::memory:';
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('No DATABASE_URL configured for dev.');
  }
  return process.env.DATABASE_URL;
}

function getDatabase() {
  if (!_db) {
    const databaseUrl = getDatabaseUrl();
    _sql = neon(databaseUrl);
    _db = drizzle(_sql, { schema });
  }
  return { sql: _sql!, db: _db };
}

// Export a proxy that lazy-loads the database connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const { db: actualDb } = getDatabase();
    return actualDb[prop as keyof typeof actualDb];
  }
});

// Export a function to test the connection
export async function testConnection() {
  // Skip connection test during VoltBuilder builds
  if (process.env.NODE_ENV === 'production' && process.env.VOLTBUIILDER_BUILD === 'true') {
    console.log('[DB] Skipping connection test for VoltBuilder build');
    return true;
  }
  
  try {
    const { sql } = getDatabase();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}