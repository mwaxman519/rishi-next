// db-connection-check.js
import pg from "pg";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";

const { Pool } = pg;
dotenv.config({ path: ".env.local" });

// Log connection attempt
console.log("Checking database connection...");
console.log("Using DATABASE_URL from environment");

// Create a connection pool with timeout
const pool = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Verify connection works
async function checkConnection() {
  let client;

  try {
    console.log("Attempting to connect to database...");
    client = await pool.connect();

    // Try a simple query
    const result = await client.query("SELECT NOW() as current_time");
    console.log("Database connection successful!");
    console.log("Current time from database:", result.rows[0].current_time);

    // Check if auth tables exist
    const authTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'organizations', 'user_organizations')
    `);

    console.log(
      "Auth tables found:",
      authTablesResult.rows.map((row) => row.table_name),
    );

    return true;
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.error("Connection details:", {
      host: process.env.PGHOST || "Not set",
      database: process.env.PGDATABASE || "Not set",
      port: process.env.PGPORT || "Not set",
      user: process.env.PGUSER || "Not set",
      // Password intentionally not logged
    });
    return false;
  } finally {
    if (client) client.release();
  }
}

// Fix common connection issues
async function fixConnectionIssues() {
  // 1. Check if we need to create missing tables
  let client;

  try {
    client = await pool.connect();

    // Check if users table exists
    const usersTableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `);

    if (!usersTableResult.rows[0].exists) {
      console.log("Users table missing - running schema creation...");
      // Execute schema creation (this is a simplified example)
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check for organizations table
    const orgsTableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organizations'
      )
    `);

    if (!orgsTableResult.rows[0].exists) {
      console.log("Organizations table missing - creating...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("Database schema check and fix completed");
    return true;
  } catch (err) {
    console.error("Error fixing database schema:", err.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Run the checks and fixes
async function runDatabaseChecks() {
  const isConnected = await checkConnection();

  if (!isConnected) {
    console.log("Connection failed - checking environment variables...");
    // Log database URL format (but not the actual credentials)
    const dbUrl = process.env.DATABASE_URL || "";
    console.log(
      "Database URL format valid:",
      dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"),
    );

    // Suggest fixes
    console.log("Please check:");
    console.log("1. Database URL is correct in environment variables");
    console.log("2. Database server is running and accessible");
    console.log("3. Network permissions allow connections");
  } else {
    // Fix any schema issues
    await fixConnectionIssues();
  }

  await pool.end();
}

// Run the checks
runDatabaseChecks();
