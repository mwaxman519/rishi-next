// script to start Next.js development server
import { execSync } from "child_process";

console.log("Starting Next.js development server...");
execSync("npx next dev", { stdio: "inherit" });
