#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");

// Path to the drizzle-kit binary in node_modules
const drizzleKitPath = path.join(__dirname, "../node_modules/.bin/drizzle-kit");

// Command to generate migrations
const command = `${drizzleKitPath} generate:pg --schema=./shared/schema.ts --out=./shared/migrations`;

console.log("🔄 Generating database migrations...");
try {
  execSync(command, { stdio: "inherit" });
  console.log("✅ Migration generation completed successfully");
} catch (error) {
  console.error("❌ Migration generation failed:", error);
  process.exit(1);
}
