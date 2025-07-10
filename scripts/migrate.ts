import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../shared/schema";

// Use environment variable for database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create client connection for migration
const sql = neon(databaseUrl);

// Create drizzle client with schema - using proper configuration
const db = drizzle(sql, { schema });

async function main() {
  console.log("Running migrations...");

  try {
    // This will automatically run needed migrations on the database
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
