/**
 * Create Mike User in Production Database
 * This script creates user 'mike' with password 'wrench519' in the production database
 */

import pg from "pg";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const { Client } = pg;

// Use production database URL - you'll need to provide this
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL || "YOUR_PRODUCTION_DATABASE_URL_HERE";

async function createMikeUserInProduction() {
  try {
    console.log("🔄 Connecting to production database...");
    
    // Connect to production database
    const client = new Client({
      connectionString: PRODUCTION_DATABASE_URL,
    });
    await client.connect();
    console.log("✅ Connected to production database");

    // Check if user already exists
    const userCheck = await client.query(
      "SELECT * FROM users WHERE username = $1",
      ["mike"]
    );

    if (userCheck.rows.length > 0) {
      console.log("⚠️  User 'mike' already exists in production database");
      
      // Update existing user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("wrench519", salt);
      
      await client.query(
        "UPDATE users SET password = $1, role = $2, active = $3 WHERE username = $4",
        [hashedPassword, "super_admin", true, "mike"]
      );
      
      console.log("✅ User 'mike' updated in production database");
    } else {
      console.log("🔄 Creating new user 'mike' in production database...");
      
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

      console.log(`✅ User 'mike' created in production database with ID: ${userId}`);
    }

    // Test the password
    const testResult = await bcrypt.compare("wrench519", await bcrypt.hash("wrench519", 12));
    console.log("🧪 Password test:", testResult ? "✅ PASS" : "❌ FAIL");

    await client.end();
    console.log("🎉 Production user creation completed!");
    
  } catch (error) {
    console.error("❌ Error creating user in production:", error);
    
    if (error.message.includes("relation \"users\" does not exist")) {
      console.log("💡 Database schema may need to be initialized first");
      console.log("   Run: npm run db:push");
    }
    
    process.exit(1);
  }
}

// Run the script
createMikeUserInProduction().then(() => {
  console.log("🏁 Script completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});