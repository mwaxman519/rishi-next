// auth-service-check.js
const fetch = require("node-fetch");
require("dotenv").config({ path: ".env.local" });

// Default to localhost if API_URL not defined
const BASE_URL = process.env.API_URL || "http://localhost:3000";

async function checkAuthService() {
  console.log("Checking Auth Service endpoints...");
  console.log(`Using base URL: ${BASE_URL}`);

  // Check registration endpoint
  try {
    console.log("\nTesting registration endpoint...");
    const registerResponse = await fetch(`${BASE_URL}/api/register`, {
      method: "OPTIONS",
    });

    console.log("Registration endpoint status:", registerResponse.status);
    console.log(
      "Registration endpoint available:",
      registerResponse.status < 500,
    );

    // Check if endpoint exists by testing with POST (will fail without credentials but should return 400 not 404)
    const registerTestResponse = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Empty body to test endpoint existence
      }),
    });

    console.log("Registration POST test status:", registerTestResponse.status);
    console.log(
      "Registration endpoint working correctly:",
      registerTestResponse.status === 400,
    );
  } catch (err) {
    console.error("Error checking registration endpoint:", err.message);
  }

  // Check login endpoint
  try {
    console.log("\nTesting login endpoint...");
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: "OPTIONS",
    });

    console.log("Login endpoint status:", loginResponse.status);
    console.log("Login endpoint available:", loginResponse.status < 500);

    // Test with POST
    const loginTestResponse = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Empty body to test endpoint existence
      }),
    });

    console.log("Login POST test status:", loginTestResponse.status);
    console.log(
      "Login endpoint working correctly:",
      loginTestResponse.status === 401 || loginTestResponse.status === 400,
    );
  } catch (err) {
    console.error("Error checking login endpoint:", err.message);
  }

  // Check user endpoint
  try {
    console.log("\nTesting user endpoint...");
    const userResponse = await fetch(`${BASE_URL}/api/user`);

    console.log("User endpoint status:", userResponse.status);
    console.log(
      "User endpoint returning correct unauthorized status:",
      userResponse.status === 401,
    );
  } catch (err) {
    console.error("Error checking user endpoint:", err.message);
  }

  // Check organizations endpoint (the one failing in logs)
  try {
    console.log("\nTesting organizations endpoint...");
    const orgsResponse = await fetch(`${BASE_URL}/api/organizations/user`);

    console.log("Organizations endpoint status:", orgsResponse.status);
    const responseText = await orgsResponse.text();
    console.log(
      "Organizations endpoint response:",
      responseText.substring(0, 100) + (responseText.length > 100 ? "..." : ""),
    );
  } catch (err) {
    console.error("Error checking organizations endpoint:", err.message);
  }
}

checkAuthService();
