// A script to start the webpack dev server alongside the Express API
// This is needed because we can't modify package.json
import { spawn } from "child_process";

// Function to handle errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

// Start webpack dev server
export async function startWebpackDevServer() {
  try {
    console.log("Starting webpack development server...");

    const webpackProcess = spawn(
      "npx",
      ["webpack", "serve", "--mode", "development"],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    // Log when webpack server exits
    webpackProcess.on("exit", (code) => {
      console.log(`Webpack dev server exited with code ${code}`);
      // Don't exit the process as this script is meant to be imported
    });

    console.log(
      "Webpack dev server should be available at http://localhost:8080",
    );
    return webpackProcess;
  } catch (error) {
    console.error("Error starting webpack server:", error);
    throw error;
  }
}

// If this script is run directly
if (import.meta.url === import.meta.main) {
  startWebpackDevServer();
}
