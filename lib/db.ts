/**
 * Database connection module
 * Provides database connection and ORM instance for the application
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Get the database URL from environment
function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return databaseUrl;
}

// Create the database connection
const sql = neon(getDatabaseUrl());
export const db = drizzle(sql, { schema });

// Export a function to test the connection
export async function testConnection() {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}