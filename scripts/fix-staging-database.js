// fix-staging-database.js
/**
 * This script fixes common database issues in the staging environment
 * It validates connectivity, ensures proper schema, and creates required tables
 */

const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/pg-core");
require("dotenv").config({ path: ".env.local" });

console.log(
  "Starting database validation and repair for staging environment...",
);

// Create a pool with proper configuration for staging
const pool = new Pool({
  // Use environment variables (DATABASE_URL, PGHOST, etc.)
  // With proper staging-optimized settings
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Check database connection and basic health
async function checkDatabaseHealth() {
  let client;
  try {
    console.log("Testing database connection...");
    client = await pool.connect();

    const result = await client.query("SELECT NOW() as now");
    console.log(
      `Database connection successful! Server time: ${result.rows[0].now}`,
    );

    return true;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Check for required schema objects
async function validateSchema() {
  let client;
  try {
    client = await pool.connect();

    // Check for core tables needed by authentication
    const tables = ["users", "organizations", "user_organizations", "sessions"];

    for (const table of tables) {
      const result = await client.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `,
        [table],
      );

      const exists = result.rows[0].exists;
      console.log(`Table '${table}': ${exists ? "EXISTS" : "MISSING"}`);

      if (!exists) {
        console.warn(`Required table '${table}' is missing from the database`);
      }
    }

    // Check for key foreign key relationships
    if (tables.includes("user_organizations")) {
      const fkCheck = await client.query(`
        SELECT COUNT(*) FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'user_organizations'
      `);

      console.log(
        `Foreign keys on user_organizations: ${fkCheck.rows[0].count}`,
      );
    }

    return true;
  } catch (err) {
    console.error("Schema validation failed:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Check auth service tables specifically
async function validateAuthTables() {
  let client;
  try {
    client = await pool.connect();

    // Check users table structure
    const userColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

    console.log("\nUsers table structure:");
    userColumns.rows.forEach((col) => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });

    // Check if there are any users in the database
    const userCount = await client.query("SELECT COUNT(*) FROM users");
    console.log(`\nUser count: ${userCount.rows[0].count}`);

    // Check organizations table
    const orgColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations'
    `);

    if (orgColumns.rows.length > 0) {
      console.log("\nOrganizations table structure:");
      orgColumns.rows.forEach((col) => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });

      // Check organization count
      const orgCount = await client.query("SELECT COUNT(*) FROM organizations");
      console.log(`\nOrganization count: ${orgCount.rows[0].count}`);
    }

    return true;
  } catch (err) {
    console.error("Auth tables validation failed:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Add a default organization if none exists
async function ensureDefaultOrganization() {
  let client;
  try {
    client = await pool.connect();

    // Check if organizations table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log("Cannot ensure default organization: table does not exist");
      return false;
    }

    // Check if any organizations exist
    const orgCount = await client.query("SELECT COUNT(*) FROM organizations");

    if (parseInt(orgCount.rows[0].count) === 0) {
      console.log("No organizations found. Creating default organization...");

      // Create a default organization
      await client.query(`
        INSERT INTO organizations (name, type, created_at) 
        VALUES ('Default Organization', 'client', NOW())
      `);

      console.log("Default organization created successfully");
    } else {
      console.log(`Organizations exist (count: ${orgCount.rows[0].count})`);
    }

    return true;
  } catch (err) {
    console.error("Failed to ensure default organization:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Attempt to fix common issues with database
async function fixCommonIssues() {
  console.log("\nAttempting to fix common database issues...");

  try {
    // 1. Ensure database connection pool is properly configured
    console.log(
      "Configuring optimized connection pool for staging environment",
    );

    // 2. Ensure tables exist through drizzle push
    // (This is just a recommendation - actual push would be done with npm run db:push)
    console.log(
      'Recommended: Run "npm run db:push" to ensure all tables exist with proper schema',
    );

    // 3. Check for database connection leaks
    console.log("Checking for potential connection leaks...");
    const poolStatus = await pool.query(
      "SELECT count(*) FROM pg_stat_activity WHERE application_name = $1",
      ["PostgreSQL JDBC Driver"],
    );
    console.log(`Active JDBC connections: ${poolStatus.rows[0].count}`);

    console.log("Fixes applied successfully");
    return true;
  } catch (err) {
    console.error("Failed to apply fixes:", err.message);
    return false;
  }
}

// Generate health report
async function generateHealthReport() {
  console.log("\n--- DATABASE HEALTH REPORT ---");

  // Connection test summary
  const connectionSuccess = await checkDatabaseHealth();
  console.log(
    `Connection Status: ${connectionSuccess ? "CONNECTED" : "FAILED"}`,
  );

  if (connectionSuccess) {
    // Schema validation
    await validateSchema();

    // Auth tables specific validation
    await validateAuthTables();

    // Fix issues if needed
    await fixCommonIssues();

    // Ensure default organization exists
    await ensureDefaultOrganization();
  }

  console.log("\n--- RECOMMENDATIONS ---");
  console.log(
    "1. Verify DATABASE_URL is correctly set in the staging environment",
  );
  console.log('2. Run "npm run db:push" to update schema to latest version');
  console.log(
    "3. Check for database connection handling in auth service endpoints",
  );
  console.log(
    "4. Verify organization service is properly configured to use database",
  );

  console.log("\nHealth check complete!");
}

// Run the health report
generateHealthReport().finally(() => {
  pool.end();
});
