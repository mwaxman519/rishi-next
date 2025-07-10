const { Client } = require("pg");
const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function setupDatabase() {
  try {
    // Connect to the database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log("Connected to the database");

    // Create tables
    console.log("Creating tables...");

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'client_user',
        organization_id INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'client',
        tier TEXT,
        is_test BOOLEAN NOT NULL DEFAULT false,
        environment TEXT NOT NULL DEFAULT 'development',
        logo_url TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // See if we need to create the default organization
    const orgCheck = await client.query(
      "SELECT * FROM organizations WHERE id = 1",
    );
    if (orgCheck.rows.length === 0) {
      console.log("Creating default organization (Rishi Internal)...");
      await client.query(`
        INSERT INTO organizations (id, name, type, is_test, environment)
        VALUES (1, 'Rishi Internal', 'internal', false, 'development');
      `);
    }

    // Create the super admin user
    console.log("Creating super admin user (mike)...");

    // Check if user already exists
    const userCheck = await client.query(
      "SELECT * FROM users WHERE username = $1",
      ["mike"],
    );

    if (userCheck.rows.length === 0) {
      const hashedPassword = await hashPassword("wrench");

      await client.query(
        `
        INSERT INTO users (username, password, email, role, organization_id)
        VALUES ($1, $2, $3, $4, $5)
      `,
        ["mike", hashedPassword, "mike@rishi.example", "super_admin", 1],
      );

      console.log("Super admin user created successfully");
    } else {
      console.log("Super admin user already exists, updating password...");

      const hashedPassword = await hashPassword("wrench");

      await client.query(
        `
        UPDATE users
        SET password = $1, role = 'super_admin', organization_id = 1
        WHERE username = $2
      `,
        [hashedPassword, "mike"],
      );

      console.log("Super admin user updated successfully");
    }

    console.log("Database setup completed successfully");
    await client.end();
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
