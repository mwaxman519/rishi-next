/**
 * Data Sanitization Script
 *
 * This script analyzes and sanitizes database data to ensure proper isolation
 * between environments and prevent test data from reaching production.
 *
 * Usage:
 *   node scripts/data-sanitizer.js [environment] [--options]
 *
 * Options:
 *   --dry-run     Only report test data, don't modify anything
 *   --execute     Perform actual data cleanup (required for production)
 */

require("dotenv").config();
const { Pool } = require("@neondatabase/serverless");
const { v4: uuidv4 } = require("uuid");

// Command line args
const args = process.argv.slice(2);
const targetEnv =
  args.find((arg) => !arg.startsWith("--")) ||
  process.env.NODE_ENV ||
  "development";
const isDryRun = args.includes("--dry-run") || !args.includes("--execute");
const isVerbose = args.includes("--verbose");

console.log(
  `Data sanitization for ${targetEnv} environment${isDryRun ? " (DRY RUN)" : ""}`,
);

// Test data patterns to detect
const testPatterns = {
  emailDomains: [
    "test.com",
    "example.com",
    "rishi-test.com",
    "test-domain.com",
  ],
  usernamePrefixes: ["test_", "demo_", "sample_", "example_"],
  organizationPrefixes: ["Test", "Demo", "Sample", "Example", "Mock"],
  testDataFlags: ["is_test_data", "environment"],
};

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

// Find test data in tables
async function findTestData(pool) {
  console.log("Scanning database for test data...");

  const client = await pool.connect();
  try {
    // Get list of tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);
    console.log(`Found ${tables.length} tables to scan`);

    const testDataResults = {};

    // Check each table for test data patterns
    for (const table of tables) {
      try {
        // First check if this table has the test data columns
        const columnsResult = await client.query(
          `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
        `,
          [table],
        );

        const columns = columnsResult.rows.map((row) => row.column_name);

        // Results for this table
        const tableResults = {
          name: table,
          hasTestDataColumn: columns.includes("is_test_data"),
          hasEnvironmentColumn: columns.includes("environment"),
          testDataCount: 0,
          wrongEnvironmentCount: 0,
          patternMatchCount: 0,
          totalRows: 0,
          items: [],
        };

        // Get total row count
        const countResult = await client.query(`
          SELECT COUNT(*) as count
          FROM "${table}"
        `);

        tableResults.totalRows = parseInt(countResult.rows[0].count, 10);

        // Skip empty tables
        if (tableResults.totalRows === 0) {
          if (isVerbose) {
            console.log(`Skipping empty table: ${table}`);
          }
          continue;
        }

        // Build query conditions based on available columns
        let conditions = [];
        const params = [];

        if (tableResults.hasTestDataColumn) {
          conditions.push("is_test_data = true");
        }

        if (tableResults.hasEnvironmentColumn) {
          conditions.push(`environment != $${params.length + 1}`);
          params.push(targetEnv);
        }

        // Check for pattern matches in common fields if they exist
        if (columns.includes("email")) {
          testPatterns.emailDomains.forEach((domain) => {
            conditions.push(`email LIKE $${params.length + 1}`);
            params.push(`%@${domain}`);
          });
        }

        if (columns.includes("username")) {
          testPatterns.usernamePrefixes.forEach((prefix) => {
            conditions.push(`username LIKE $${params.length + 1}`);
            params.push(`${prefix}%`);
          });
        }

        if (columns.includes("name")) {
          testPatterns.organizationPrefixes.forEach((prefix) => {
            conditions.push(`name LIKE $${params.length + 1}`);
            params.push(`${prefix}%`);
          });
        }

        // If we have conditions to check, run the query
        if (conditions.length > 0) {
          const query = `
            SELECT *
            FROM "${table}"
            WHERE ${conditions.join(" OR ")}
            LIMIT 100
          `;

          const testDataResult = await client.query(query, params);

          if (testDataResult.rows.length > 0) {
            tableResults.items = testDataResult.rows;

            // Count by type
            if (tableResults.hasTestDataColumn) {
              tableResults.testDataCount = testDataResult.rows.filter(
                (row) => row.is_test_data,
              ).length;
            }

            if (tableResults.hasEnvironmentColumn) {
              tableResults.wrongEnvironmentCount = testDataResult.rows.filter(
                (row) => row.environment !== targetEnv,
              ).length;
            }

            tableResults.patternMatchCount =
              testDataResult.rows.length -
              tableResults.testDataCount -
              tableResults.wrongEnvironmentCount;

            testDataResults[table] = tableResults;
          }
        }
      } catch (error) {
        console.error(`Error scanning table ${table}:`, error.message);
      }
    }

    return testDataResults;
  } finally {
    client.release();
  }
}

// Clean test data from production
async function cleanTestData(pool, testData) {
  if (isDryRun) {
    console.log("DRY RUN: Would clean the following test data:");

    let totalItems = 0;
    for (const table in testData) {
      const tableData = testData[table];
      console.log(`- ${table}: ${tableData.items.length} items`);
      totalItems += tableData.items.length;
    }

    console.log(
      `Total: ${totalItems} items across ${Object.keys(testData).length} tables`,
    );
    return;
  }

  if (targetEnv === "production") {
    console.log("⚠️ EXECUTING DATA SANITIZATION IN PRODUCTION ⚠️");
    console.log(
      "This will permanently remove test data from the production database.",
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let totalCleaned = 0;

    for (const table in testData) {
      const tableData = testData[table];
      if (tableData.items.length === 0) continue;

      // Build query conditions based on available columns
      let conditions = [];
      const params = [];

      if (tableData.hasTestDataColumn) {
        conditions.push("is_test_data = true");
      }

      if (tableData.hasEnvironmentColumn) {
        conditions.push(`environment != $${params.length + 1}`);
        params.push(targetEnv);
      }

      // Only perform cleanup if we have solid conditions to avoid accidents
      if (conditions.length > 0) {
        const query = `
          DELETE FROM "${table}"
          WHERE ${conditions.join(" OR ")}
          RETURNING id
        `;

        const result = await client.query(query, params);
        totalCleaned += result.rowCount;

        console.log(`Cleaned ${result.rowCount} test data items from ${table}`);
      }
    }

    await client.query("COMMIT");
    console.log(`✅ Successfully cleaned ${totalCleaned} test data items`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error cleaning test data:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the sanitizer
async function runSanitizer() {
  // Special safety check for production
  if (targetEnv === "production" && !isDryRun) {
    console.warn("⚠️ WARNING: You are about to modify production data!");
    console.warn(
      "This should only be done if you are absolutely sure what you are doing.",
    );

    // This would be an interactive confirmation in a real script
    // For automation, we rely on the --execute flag
    console.log("Proceeding with --execute flag provided...");
  }

  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    throw new Error(`No database URL provided for environment: ${targetEnv}`);
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Find test data
    const testData = await findTestData(pool);
    const testDataTables = Object.keys(testData);

    if (testDataTables.length === 0) {
      console.log(`No test data found in ${targetEnv} environment`);
      return;
    }

    console.log(`Found test data in ${testDataTables.length} tables:`);

    for (const table of testDataTables) {
      const tableData = testData[table];
      console.log(`- ${table}: ${tableData.items.length} items`);

      if (isVerbose) {
        console.log(
          `  * ${tableData.testDataCount} explicitly flagged as test data`,
        );
        console.log(
          `  * ${tableData.wrongEnvironmentCount} with wrong environment`,
        );
        console.log(`  * ${tableData.patternMatchCount} matched by pattern`);
      }
    }

    // Clean test data if not a dry run
    if (!isDryRun) {
      await cleanTestData(pool, testData);
    } else {
      console.log("\nDRY RUN: No changes were made to the database");

      if (targetEnv === "production") {
        console.log(
          "To clean test data from production, run with --execute flag:",
        );
        console.log(
          "  NODE_ENV=production node scripts/data-sanitizer.js --execute",
        );
      }
    }
  } finally {
    await pool.end();
  }
}

// Run the script
runSanitizer()
  .then(() => {
    console.log("Data sanitization completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Data sanitization failed with error:", err);
    process.exit(1);
  });
