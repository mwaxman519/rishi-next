/**
 * Deployment Validation Script
 *
 * This script performs validation checks before deployment to ensure
 * that environment-specific requirements are met and that test data
 * doesn't leak across environments, especially to production.
 */

require("dotenv").config();
const { Pool } = require("@neondatabase/serverless");

// Command line args
const args = process.argv.slice(2);
const targetEnv = args[0] || "development";
const skipPrompts = args.includes("--yes");

console.log(`Validating deployment to ${targetEnv} environment`);

// Determine database URL based on environment
function getDatabaseUrl() {
  if (targetEnv === "development") {
    return process.env.DATABASE_URL;
  } else if (targetEnv === "staging") {
    return process.env.STAGING_DATABASE_URL || process.env.DATABASE_URL;
  } else if (targetEnv === "production") {
    return process.env.PRODUCTION_DATABASE_URL;
  }

  throw new Error(`Unknown environment: ${targetEnv}`);
}

// Validation checks for all environments
async function runBaseValidation(pool) {
  console.log("Running base validation checks...");

  // Check database connection
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }

  // Check database tables exist
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const requiredTables = ["users", "organizations", "organization_users"];
    const existingTables = result.rows.map((row) => row.table_name);

    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table),
    );

    if (missingTables.length > 0) {
      console.error(`❌ Missing required tables: ${missingTables.join(", ")}`);
      return false;
    }

    console.log(`✅ Required tables exist (${requiredTables.join(", ")})`);
  } catch (error) {
    console.error("❌ Failed to check database tables:", error.message);
    return false;
  }

  return true;
}

// Production-specific validations
async function runProductionValidation(pool) {
  console.log("Running production-specific validation checks...");

  // Check for test data in production database
  try {
    const testUsersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE is_test_data = true
      OR environment != 'production'
    `);

    const testUserCount = parseInt(testUsersResult.rows[0].count, 10);

    if (testUserCount > 0) {
      console.error(
        `❌ Found ${testUserCount} test users in production database!`,
      );
      return false;
    }

    // Check for test organizations
    const testOrgsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM organizations
      WHERE is_test_data = true
      OR environment != 'production'
    `);

    const testOrgCount = parseInt(testOrgsResult.rows[0].count, 10);

    if (testOrgCount > 0) {
      console.error(
        `❌ Found ${testOrgCount} test organizations in production database!`,
      );
      return false;
    }

    // Check for test data patterns in users
    const patternUsersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE email LIKE '%@test.com'
      OR email LIKE '%@example.com'
      OR email LIKE '%@rishi-test.com'
    `);

    const patternUserCount = parseInt(patternUsersResult.rows[0].count, 10);

    if (patternUserCount > 0) {
      console.error(
        `❌ Found ${patternUserCount} users with test email patterns in production!`,
      );
      return false;
    }

    // Check for test data patterns in organizations
    const patternOrgsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM organizations
      WHERE name LIKE 'Test%'
      OR name LIKE 'Demo%'
      OR name LIKE 'Sample%'
    `);

    const patternOrgCount = parseInt(patternOrgsResult.rows[0].count, 10);

    if (patternOrgCount > 0) {
      console.error(
        `❌ Found ${patternOrgCount} organizations with test name patterns in production!`,
      );
      return false;
    }

    console.log("✅ No test data found in production database");
  } catch (error) {
    console.error("❌ Failed to check for test data:", error.message);
    return false;
  }

  // Check for environment configurations
  if (process.env.NODE_ENV !== "production") {
    console.warn('⚠️ NODE_ENV is not set to "production"');
  }

  if (!process.env.PRODUCTION_DATABASE_URL) {
    console.error("❌ PRODUCTION_DATABASE_URL environment variable is not set");
    return false;
  }

  return true;
}

// Main validation function
async function validateDeployment() {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    console.error(`❌ No database URL provided for environment: ${targetEnv}`);
    return false;
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Run base validation for all environments
    const baseValid = await runBaseValidation(pool);

    if (!baseValid) {
      return false;
    }

    // Run environment-specific validation
    if (targetEnv === "production") {
      const productionValid = await runProductionValidation(pool);

      if (!productionValid) {
        console.error("❌ Production validation failed - aborting deployment");
        console.error(
          "   Run data-sanitizer.js to clean up test data before deploying",
        );
        return false;
      }
    }

    console.log("✅ All validation checks passed!");
    return true;
  } catch (error) {
    console.error("❌ Validation error:", error);
    return false;
  } finally {
    await pool.end();
  }
}

// Run validation
validateDeployment()
  .then((isValid) => {
    if (isValid) {
      console.log(
        `✅ Deployment validation successful for ${targetEnv} environment`,
      );
      process.exit(0);
    } else {
      console.error(
        `❌ Deployment validation failed for ${targetEnv} environment`,
      );
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Deployment validation failed with error:", err);
    process.exit(1);
  });
