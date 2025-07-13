/**
 * Create Mike User in Staging Database
 * This script creates user 'mike' with password 'wrench519' in the staging database
 */

import pg from "pg";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const { Client } = pg;

// Use staging database URL from .env.staging
const STAGING_DATABASE_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require";

async function createMikeUserInStaging() {
  try {
    console.log("🔄 Connecting to staging database...");
    
    // Connect to staging database
    const client = new Client({
      connectionString: STAGING_DATABASE_URL,
    });
    await client.connect();
    console.log("✅ Connected to staging database");

    // Check if user already exists
    const userCheck = await client.query(
      "SELECT * FROM users WHERE username = $1",
      ["mike"]
    );

    if (userCheck.rows.length > 0) {
      console.log("⚠️  User 'mike' already exists in staging database");
      
      // Update existing user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("wrench519", salt);
      
      await client.query(
        "UPDATE users SET password = $1, role = $2, active = $3 WHERE username = $4",
        [hashedPassword, "super_admin", true, "mike"]
      );
      
      console.log("✅ User 'mike' updated in staging database");
    } else {
      console.log("🔄 Creating new user 'mike' in staging database...");
      
      // Hash password using bcrypt
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("wrench519", salt);
      const userId = randomUUID();

      // Create new user
      await client.query(
        `INSERT INTO users (id, username, password, email, full_name, role, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          "mike",
          hashedPassword,
          "mike@rishi.com",
          "Mike Waxman",
          "super_admin",
          true,
        ]
      );

      console.log(`✅ User 'mike' created in staging database with ID: ${userId}`);
    }

    await client.end();
    console.log("🎉 Staging user creation completed!");
    
  } catch (error) {
    console.error("❌ Error creating user in staging:", error);
    process.exit(1);
  }
}

// Run the script
createMikeUserInStaging().then(() => {
  console.log("🏁 Staging user creation script completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Staging script failed:", error);
  process.exit(1);
});