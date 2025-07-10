const { Pool } = require("@neondatabase/serverless");

async function verifyDatabaseConnection() {
  console.log("Verifying database connection...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test basic connection
    const result = await pool.query("SELECT 1 as connection_test");
    console.log("✅ Database connection successful:", result.rows[0]);

    // Check for required tables (adjust table names based on your schema)
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("✅ Found", tablesResult.rowCount, "tables in the database");

    // Verify database permissions
    const permissionsResult = await pool.query(`
      SELECT has_schema_privilege(current_user, 'public', 'CREATE') as can_create,
             has_schema_privilege(current_user, 'public', 'USAGE') as can_use
    `);

    const { can_create, can_use } = permissionsResult.rows[0];

    if (!can_use) {
      console.error("❌ Database user lacks USAGE permission on public schema");
      process.exit(1);
    }

    if (!can_create && process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Development environment but database user cannot CREATE in public schema",
      );
    } else {
      console.log("✅ Database permissions verified");
    }

    console.log("✅ Database verification completed successfully");
  } catch (error) {
    console.error("❌ Database verification failed:", error.message);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run verification
verifyDatabaseConnection().catch((err) => {
  console.error("❌ Unexpected error during database verification:", err);
  process.exit(1);
});
