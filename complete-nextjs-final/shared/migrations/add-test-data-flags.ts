/**
 * Database Migration: Add Test Data Flags
 *
 * This migration adds is_test_data and environment flags to all relevant tables
 * to support the data isolation strategy between environments.
 */

import { text, boolean, pgTable } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// The full list of tables that should have test data flags
const TABLES_TO_UPDATE = [
  "users",
  "organizations",
  "organization_users",
  "organization_invitations",
  "organization_settings",
  "events",
  "event_staff",
  "certifications",
  "locations",
];

// Get the current environment
function getEnvironment(): "production" | "staging" | "development" {
  const env = process.env.NODE_ENV as string;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Get default environment value based on is_test_data flag
 *
 * For test data: use the current environment
 * For non-test data in production: use 'production'
 * For non-test data elsewhere: use current environment
 */
function getDefaultEnvironmentValue(isTestData: boolean) {
  const env = getEnvironment();

  if (isTestData) {
    return env;
  }

  return env === "production" ? "production" : env;
}

/**
 * Run the migration to add test data flags
 */
export async function addTestDataFlagsMigration(db: any) {
  console.log("Adding test data flags to tables...");

  for (const tableName of TABLES_TO_UPDATE) {
    try {
      // Check if table exists
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `);

      if (!tableExists.rows[0].exists) {
        console.log(`Table ${tableName} does not exist, skipping`);
        continue;
      }

      // Check if is_test_data column already exists
      const testDataColumnExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName} 
          AND column_name = 'is_test_data'
        )
      `);

      if (!testDataColumnExists.rows[0].exists) {
        // Add is_test_data column
        await db.execute(sql`
          ALTER TABLE "${tableName}" 
          ADD COLUMN is_test_data BOOLEAN NOT NULL DEFAULT FALSE
        `);

        console.log(`Added is_test_data column to ${tableName}`);
      }

      // Check if environment column already exists
      const environmentColumnExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName} 
          AND column_name = 'environment'
        )
      `);

      if (!environmentColumnExists.rows[0].exists) {
        // Add environment column
        await db.execute(sql`
          ALTER TABLE "${tableName}" 
          ADD COLUMN environment TEXT NOT NULL DEFAULT ${getEnvironment()}
        `);

        console.log(`Added environment column to ${tableName}`);
      }

      // Update existing rows to set environment based on test data flag
      await db.execute(sql`
        UPDATE "${tableName}"
        SET environment = CASE
          WHEN is_test_data = TRUE THEN ${getEnvironment()}
          ELSE ${getEnvironment()}
        END
        WHERE environment IS NULL OR environment = ''
      `);

      console.log(`Updated environment values in ${tableName}`);
    } catch (error) {
      console.error(`Error updating table ${tableName}:`, error);
      throw error;
    }
  }

  console.log("Test data flags migration completed successfully");
}
