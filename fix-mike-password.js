import pg from "pg";
import * as bcrypt from "bcryptjs";

const { Client } = pg;

async function fixMikePassword() {
  try {
    // Connect to the database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log("Connected to the database");

    // Hash the password using bcrypt (same as auth service)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("wrench519", salt);

    // Update Mike's password with the correctly hashed version
    await client.query(
      "UPDATE users SET password = $1 WHERE username = $2",
      [hashedPassword, "mike"]
    );

    console.log("✅ Mike's password updated with correct bcrypt hash");
    console.log("🔍 Testing the new password hash...");

    // Test the password comparison
    const testResult = await bcrypt.compare("wrench519", hashedPassword);
    console.log("Password comparison test:", testResult ? "✅ PASS" : "❌ FAIL");

    await client.end();
    console.log("🎉 Password fix completed!");
  } catch (error) {
    console.error("❌ Error fixing password:", error);
    process.exit(1);
  }
}

// Run the script
fixMikePassword().then(() => {
  console.log("🏁 Script completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});