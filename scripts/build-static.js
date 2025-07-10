#!/usr/bin/env node

/**
 * Static Build Script for GitHub Deployment
 * Builds the application for static export to the 'static' branch
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Set environment variables for static build
process.env.BUILD_TARGET = "static";
process.env.NODE_ENV = "production";
process.env.NEXT_PUBLIC_APP_ENV = "production";

console.log("🚀 Building static export for GitHub deployment...");

try {
  // Build the application for static export
  console.log("📦 Running Next.js build with static export...");
  execSync("next build", { stdio: "inherit" });

  // Check if the out directory was created
  if (fs.existsSync("./out")) {
    console.log("✅ Static export completed successfully");
    console.log("📁 Static files available in ./out directory");

    // List contents of out directory
    const files = fs.readdirSync("./out");
    console.log(`📄 Generated ${files.length} static files`);
  } else {
    console.error("❌ Static export failed - no output directory found");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
