/**
 * Next.js Development Server
 *
 * This file starts the Next.js development server on port 5000.
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

console.log("🚀 Starting Next.js development server...");

const nextProcess = spawn("npx", ["next", "dev", "-p", "5000"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

nextProcess.on("error", (err) => {
  console.error("Failed to start Next.js development server:", err);
  process.exit(1);
});

nextProcess.on("close", (code) => {
  console.log(`Next.js development server exited with code ${code}`);
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  nextProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  nextProcess.kill("SIGTERM");
});
