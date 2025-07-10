#!/usr/bin/env node

/**
 * Simple test script to verify authentication system
 */

import { testConnection } from "../app/api/auth-service/utils/db-connection.ts";

async function testAuthentication() {
  console.log("🔒 Testing Authentication System");
  console.log("=" .repeat(50));

  // Test database connection
  console.log("\n1. Testing Database Connection...");
  try {
    const connectionResult = await testConnection();
    if (connectionResult) {
      console.log("✅ Database connection successful");
    } else {
      console.log("❌ Database connection failed");
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }

  console.log("\n🏁 Authentication test completed");
}

// Run the test
testAuthentication().catch(console.error);