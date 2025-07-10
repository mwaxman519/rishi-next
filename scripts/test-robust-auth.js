#!/usr/bin/env node

/**
 * Test script to verify robust authentication system
 */

const { testConnection } = require("../app/api/auth-service/utils/db-connection.ts");
const { getUserByUsername, getUserOrganizations } = require("../app/api/auth-service/models/user-repository.ts");

async function testRobustAuthentication() {
  console.log("🔒 Testing Robust Authentication System");
  console.log("=" .repeat(50));

  // Test 1: Database connection test
  console.log("\n1. Testing Database Connection...");
  try {
    const connectionTest = await testConnection();
    if (connectionTest) {
      console.log("✅ Database connection successful");
    } else {
      console.log("❌ Database connection failed");
      return;
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return;
  }

  // Test 2: User lookup test
  console.log("\n2. Testing User Lookup...");
  try {
    const user = await getUserByUsername("mike");
    if (user) {
      console.log("✅ User lookup successful");
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
    } else {
      console.log("❌ User lookup failed - no user found");
    }
  } catch (error) {
    console.error("❌ User lookup error:", error.message);
  }

  // Test 3: User organizations test
  console.log("\n3. Testing User Organizations...");
  try {
    const user = await getUserByUsername("mike");
    if (user) {
      const organizations = await getUserOrganizations(user.id);
      if (organizations && organizations.length > 0) {
        console.log("✅ User organizations lookup successful");
        console.log(`   Organizations found: ${organizations.length}`);
        organizations.forEach((org, index) => {
          console.log(`   ${index + 1}. ${org.orgName} (${org.orgType}) - Role: ${org.role}`);
        });
      } else {
        console.log("❌ User organizations lookup failed - no organizations found");
      }
    }
  } catch (error) {
    console.error("❌ User organizations error:", error.message);
  }

  console.log("\n🏁 Authentication test completed");
}

// Run the test
testRobustAuthentication().catch(console.error);