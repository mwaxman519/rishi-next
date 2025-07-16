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

function getDatabase() {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
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
  try {
    const { sql } = getDatabase();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}