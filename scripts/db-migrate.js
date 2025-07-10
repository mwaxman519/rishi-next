/**
 * Database Migration Script
 *
 * This script runs database migrations for the specified environment.
 * It ensures that schema changes are applied safely across environments.
 */

require("dotenv").config();
const { drizzle } = require("drizzle-orm/neon-serverless");
const { Pool } = require("@neondatabase/serverless");

// Command line args
const args = process.argv.slice(2);
const env = args[0] || process.env.NODE_ENV || "development";
const isDryRun = args.includes("--dry-run");

console.log(
  `Running migrations for ${env} environment${isDryRun ? " (DRY RUN)" : ""}`,
);

// Determine database URL based on environment
function getDatabaseUrl() {
  if (env === "development") {
    return process.env.DATABASE_URL;
  } else if (env === "staging") {
    return process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL;
  } else if (env === "production") {
    return process.env.PRODUCTION_DATABASE_URL;
  }

  throw new Error(`Unknown environment: ${env}`);
}

// Get database connection
async function getDbConnection() {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    throw new Error(`No database URL provided for environment: ${env}`);
  }

  return new Pool({ connectionString: dbUrl });
}

// Check for test data in production (safety check)
async function checkForTestData(pool) {
  if (env !== "production") {
    return { hasTestData: false };
  }

  console.log("Checking for test data in production database...");

  const testUsersResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE is_test_data = true 
    OR environment != 'production'
    OR email LIKE '%@test.com' 
    OR email LIKE '%@example.com'
  `);

  const testOrgsResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM organizations 
    WHERE is_test_data = true 
    OR environment != 'production'
    OR name LIKE 'Test%' 
    OR name LIKE 'Demo%'
  `);

  const testUserCount = parseInt(testUsersResult.rows[0].count, 10);
  const testOrgCount = parseInt(testOrgsResult.rows[0].count, 10);

  return {
    hasTestData: testUserCount > 0 || testOrgCount > 0,
    testUserCount,
    testOrgCount,
  };
}

// Run migrations
async function runMigrations() {
  const pool = await getDbConnection();

  try {
    // Production safety check
    if (env === "production") {
      const testDataCheck = await checkForTestData(pool);

      if (testDataCheck.hasTestData) {
        console.error("⚠️ TEST DATA DETECTED IN PRODUCTION DATABASE!");
        console.error(
          `Found ${testDataCheck.testUserCount} test users and ${testDataCheck.testOrgCount} test organizations`,
        );
        console.error(
          "Run data-sanitizer.js to clean up test data before applying migrations",
        );
        process.exit(1);
      }
    }

    // Import and run migrations
    const { runMigrations } = require("../shared/migrations");

    if (isDryRun) {
      console.log("DRY RUN: Would apply migrations to the database");
      console.log(`Target database: ${getDatabaseUrl().split("@")[1]}`);
    } else {
      await runMigrations();
      console.log("✅ Migrations applied successfully!");
    }
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
