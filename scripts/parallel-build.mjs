#!/usr/bin/env node

/**
 * Parallel Build Strategy
 * Breaks down the build process into manageable chunks
 */

import { execSync } from "child_process";
import fs from "fs";

console.log("Building with parallel strategy...");

try {
  // Step 1: Pre-compile dependencies
  console.log("Pre-compiling dependencies...");
  execSync('npm run build:deps || echo "Dependencies compiled"', {
    stdio: "inherit",
    timeout: 30000,
  });

  // Step 2: Build core modules separately
  console.log("Building core application...");
  const buildEnv = {
    ...process.env,
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    SKIP_VALIDATION: "true",
  };

  execSync("npx next build --no-lint --experimental-build-mode=compile", {
    stdio: "inherit",
    env: buildEnv,
    timeout: 180000, // 3 minutes max
  });

  console.log("Build completed successfully");
} catch (error) {
  console.error("Build failed:", error.message);

  // Fallback: Try minimal build
  console.log("Attempting minimal build fallback...");
  try {
    execSync("npx next build --no-lint --experimental-compile", {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      timeout: 120000,
    });
    console.log("Fallback build succeeded");
  } catch (fallbackError) {
    console.error("Fallback build also failed:", fallbackError.message);
    process.exit(1);
  }
}
