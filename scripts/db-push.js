const { drizzle } = require("drizzle-orm/neon-serverless");
const { migrate } = require("drizzle-orm/neon-serverless/migrator");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
const path = require("path");

// Configure Neon with WebSocket for serverless environments
neonConfig.webSocketConstructor = ws;

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Set up the database connection
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

// Run the migration
async function main() {
  console.log("🔄 Starting database migration...");

  try {
    // Run migrations
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "../migrations"),
    });
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

main();
