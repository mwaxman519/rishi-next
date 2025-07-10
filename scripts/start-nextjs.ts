import { spawn } from "child_process";
import path from "path";

async function startNextJsServer() {
  console.log("Starting Next.js server...");

  // Change directory to the root of the project
  const cwd = process.cwd();

  // Use npx to run next on the root directory (where Next.js app is located)
  const nextProcess = spawn("npx", ["next", "dev"], {
    cwd,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PORT: "3000", // Set the port for Next.js
      HOSTNAME: "0.0.0.0", // Make it accessible from outside the container
    },
  });

  console.log("Next.js server should be running at http://localhost:3000");

  // Handle process events
  nextProcess.on("error", (error) => {
    console.error("Failed to start Next.js server:", error);
    process.exit(1);
  });

  nextProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Next.js server process exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  // Listen for termination signals
  process.on("SIGINT", () => {
    console.log("Shutting down Next.js server...");
    nextProcess.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down Next.js server...");
    nextProcess.kill("SIGTERM");
  });
}

startNextJsServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
