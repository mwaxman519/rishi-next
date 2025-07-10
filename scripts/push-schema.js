#!/usr/bin/env node

/**
 * Database schema push utility
 *
 * This script will push the schema changes defined in shared/schema.ts to the database.
 * It's used to create or update database tables when the schema changes.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const drizzlePushScript = "node_modules/.bin/drizzle-kit push:pg";
const schemaPath = path.join(__dirname, "../shared/schema.ts");

console.log("Starting database schema push...");

try {
  // Check if schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  // Execute the Drizzle push command
  console.log("Executing drizzle-kit push:pg...");
  execSync(drizzlePushScript, { stdio: "inherit" });

  console.log("\nSchema push completed successfully.");
  console.log("The following tables have been created or updated:");
  console.log("- users");
  console.log("- organizations");
  console.log("- roles");
  console.log("- permissions");
  console.log("- role_permissions");
  console.log("- sessions");
  console.log("- invitations");
  console.log("- organization_permissions");
  console.log("- user_organizations");
} catch (error) {
  console.error("Error pushing schema:", error.message);
  process.exit(1);
}
