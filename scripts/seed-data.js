/**
 * Environment-Specific Seed Data
 *
 * This script provides seed data for different environments with appropriate
 * test data flags to ensure data is properly isolated.
 *
 * Usage:
 *  - Seed development: node scripts/seed-data.js development
 *  - Seed staging: node scripts/seed-data.js staging
 */

require("dotenv").config();
const { Pool } = require("@neondatabase/serverless");
const { v4: uuidv4 } = require("uuid");

// Command line args
const args = process.argv.slice(2);
const env = args[0] || process.env.NODE_ENV || "development";
const isForce = args.includes("--force");

console.log(`Seeding database for ${env} environment`);

// Safety check for production
if (env === "production" && !isForce) {
  console.error(
    "⚠️ Refusing to seed data in production environment without --force flag",
  );
  console.error("If you really want to seed production data, use:");
  console.error("  node scripts/seed-data.js production --force");
  process.exit(1);
}

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

// Define seed data sets for different environments
const seedData = {
  // Development environment gets full test data
  development: {
    users: [
      {
        id: uuidv4(),
        username: "admin",
        password: "$scrypt$N=32768,r=8,p=1,keylen=64$c2FsdA$cGFzc3dvcmQ=", // 'password' hashed
        full_name: "Test Admin",
        email: "admin@test.com",
        role: "super_admin",
        active: true,
        is_test_data: true,
        environment: "development",
      },
      {
        id: uuidv4(),
        username: "field_manager",
        password: "$scrypt$N=32768,r=8,p=1,keylen=64$c2FsdA$cGFzc3dvcmQ=", // 'password' hashed
        full_name: "Test Field Manager",
        email: "field@test.com",
        role: "internal_field_manager",
        active: true,
        is_test_data: true,
        environment: "development",
      },
      {
        id: uuidv4(),
        username: "brand_agent",
        password: "$scrypt$N=32768,r=8,p=1,keylen=64$c2FsdA$cGFzc3dvcmQ=", // 'password' hashed
        full_name: "Test Brand Agent",
        email: "agent@test.com",
        role: "brand_agent",
        active: true,
        is_test_data: true,
        environment: "development",
      },
    ],
    organizations: [
      {
        id: uuidv4(),
        name: "Test Rishi Internal",
        type: "internal",
        active: true,
        is_test_data: true,
        environment: "development",
      },
      {
        id: uuidv4(),
        name: "Test Client Tier 1",
        type: "client",
        tier: "tier_1",
        active: true,
        is_test_data: true,
        environment: "development",
      },
      {
        id: uuidv4(),
        name: "Test Client Tier 2",
        type: "client",
        tier: "tier_2",
        active: true,
        is_test_data: true,
        environment: "development",
      },
    ],
  },

  // Staging environment gets minimal test data
  staging: {
    users: [
      {
        id: uuidv4(),
        username: "staging_admin",
        password: "$scrypt$N=32768,r=8,p=1,keylen=64$c2FsdA$cGFzc3dvcmQ=", // 'password' hashed
        full_name: "Staging Admin",
        email: "admin@rishi-test.com",
        role: "super_admin",
        active: true,
        is_test_data: true,
        environment: "staging",
      },
    ],
    organizations: [
      {
        id: uuidv4(),
        name: "Staging Rishi",
        type: "internal",
        active: true,
        is_test_data: true,
        environment: "staging",
      },
    ],
  },

  // Production environment gets no test data
  production: {
    users: [],
    organizations: [],
  },
};

// Insert seed data
async function seedDatabase() {
  const pool = await getDbConnection();
  const client = await pool.connect();

  try {
    console.log(`Seeding ${env} environment with appropriate data...`);
    await client.query("BEGIN");

    const data = seedData[env];

    // Insert users
    for (const user of data.users) {
      await client.query(
        `
        INSERT INTO users (id, username, password, full_name, email, role, active, is_test_data, environment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (username) DO NOTHING
      `,
        [
          user.id,
          user.username,
          user.password,
          user.full_name,
          user.email,
          user.role,
          user.active,
          user.is_test_data,
          user.environment,
        ],
      );

      console.log(`Created user: ${user.username} (${user.email})`);
    }

    // Insert organizations
    for (const org of data.organizations) {
      await client.query(
        `
        INSERT INTO organizations (id, name, type, tier, active, is_test_data, environment)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `,
        [
          org.id,
          org.name,
          org.type,
          org.tier,
          org.active,
          org.is_test_data,
          org.environment,
        ],
      );

      console.log(`Created organization: ${org.name} (${org.type})`);
    }

    // Create organization relationships if needed
    if (data.users.length > 0 && data.organizations.length > 0) {
      // Assign first user to first organization
      const adminId = data.users[0].id;
      const orgId = data.organizations[0].id;

      await client.query(
        `
        INSERT INTO organization_users (id, user_id, organization_id, is_primary, is_test_data, environment)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `,
        [uuidv4(), adminId, orgId, true, true, env],
      );

      console.log(
        `Linked user ${data.users[0].username} to organization ${data.organizations[0].name}`,
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed data inserted successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log(`Database seeded for ${env} environment`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  });
