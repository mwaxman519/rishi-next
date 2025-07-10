#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");

// Path to the drizzle-kit binary in node_modules
const drizzleKitPath = path.join(__dirname, "../node_modules/.bin/drizzle-kit");

// Command to run Drizzle Studio
const command = `${drizzleKitPath} studio --port 5555`;

console.log("🔄 Starting Drizzle Studio...");
try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error("❌ Failed to start Drizzle Studio:", error);
  process.exit(1);
}
