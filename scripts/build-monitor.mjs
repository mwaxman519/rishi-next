#!/usr/bin/env node

/**
 * Build Process Monitor
 * Tracks build progress and identifies bottlenecks
 */

import { spawn } from "child_process";
import fs from "fs";

console.log("Starting monitored build process...");

let buildPhase = "initializing";
const startTime = Date.now();
let lastOutput = Date.now();

function logProgress(phase) {
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[${elapsed}s] ${phase}`);
  buildPhase = phase;
  lastOutput = Date.now();
}

// Monitor for hanging
const hangMonitor = setInterval(() => {
  const timeSinceOutput = Date.now() - lastOutput;
  if (timeSinceOutput > 30000) {
    // 30 seconds
    console.log(`WARNING: No output for 30s in phase: ${buildPhase}`);
    lastOutput = Date.now();
  }
}, 30000);

try {
  logProgress("Starting Next.js build");

  const buildProcess = spawn("npx", ["next", "build"], {
    stdio: "pipe",
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });

  buildProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(output);
    lastOutput = Date.now();

    // Track specific phases
    if (output.includes("Creating an optimized production build")) {
      logProgress("Optimization phase started");
    } else if (output.includes("Compiled successfully")) {
      logProgress("Compilation completed");
    } else if (output.includes("Collecting page data")) {
      logProgress("Page data collection");
    } else if (output.includes("Generating static pages")) {
      logProgress("Static page generation");
    }
  });

  buildProcess.stderr.on("data", (data) => {
    console.error(data.toString());
    lastOutput = Date.now();
  });

  buildProcess.on("close", (code) => {
    clearInterval(hangMonitor);
    const totalTime = Math.round((Date.now() - startTime) / 1000);

    if (code === 0) {
      console.log(`Build completed successfully in ${totalTime}s`);
    } else {
      console.error(`Build failed with code ${code} after ${totalTime}s`);
      process.exit(code);
    }
  });

  // Kill build if it hangs for too long
  setTimeout(() => {
    console.log("Build timeout reached, terminating...");
    buildProcess.kill("SIGTERM");
    setTimeout(() => buildProcess.kill("SIGKILL"), 5000);
  }, 240000); // 4 minutes
} catch (error) {
  clearInterval(hangMonitor);
  console.error("Monitor error:", error.message);
  process.exit(1);
}
