/**
 * Database Migration Runner
 *
 * This module manages the execution of database migrations.
 * All migrations are run in sequence, with proper error handling.
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { addTestDataFlagsMigration } from "./add-test-data-flags";

/**
 * Get current environment
 */
function getEnvironment(): "production" | "staging" | "development" {
  const env = process.env.NODE_ENV as string;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Run all migrations
 */
export async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool);

  console.log(`Running migrations for ${getEnvironment()} environment...`);

  try {
    // Run Drizzle migrations (from migrations folder)
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    console.log("Schema migrations completed successfully");

    // Run additional migrations
    await addTestDataFlagsMigration(db);

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
