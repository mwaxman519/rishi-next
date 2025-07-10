import { NextResponse } from "next/server";
import path from "path";
import { promises as fs, existsSync, statSync, readdirSync } from "fs";

/**
 * GET handler for docs diagnosis API
 * This endpoint provides detailed diagnostic information about
 * the documentation system and file locations
 */
export async function GET() {
  console.log("[DOCS DIAGNOSE] Starting documentation system diagnosis");

  const isProduction = process.env.NODE_ENV === "production";
  const results: any = {
    environment: isProduction ? "production" : "development",
    timestamp: new Date().toISOString(),
    directories: {},
    files: {},
    testDocument: {},
  };

  // Check possible documentation directories
  const directoriesToCheck = [
    path.join(process.cwd(), "Docs"),
    path.join(process.cwd(), "public", "Docs"),
    path.join(process.cwd(), ".next", "standalone", "Docs"),
    path.join(process.cwd(), ".next", "server", "Docs"),
    path.join(process.cwd(), ".next", "static", "Docs"),
    path.join(process.cwd(), "docs-new"),
    path.join(process.cwd(), "../Docs"),
    path.join(process.cwd(), "Docs_old"),
    "/home/runner/workspace/Docs",
    "/home/runner/Docs",
    path.join(process.cwd(), "app", "docs"),
  ];

  // Check each directory
  for (const dir of directoriesToCheck) {
    try {
      const exists = existsSync(dir);
      const stats = exists
        ? {
            isDirectory: statSync(dir).isDirectory(),
            size: statSync(dir).size,
            fileCount:
              exists && statSync(dir).isDirectory()
                ? readdirSync(dir).length
                : 0,
            firstFewFiles:
              exists && statSync(dir).isDirectory()
                ? readdirSync(dir).slice(0, 5)
                : [],
          }
        : null;

      results.directories[dir] = { exists, stats };
    } catch (error) {
      results.directories[dir] = {
        exists: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Check for specific test document
  const testDocumentPaths = [
    path.join(process.cwd(), "Docs", "test-folder", "production-test-doc.md"),
    path.join(
      process.cwd(),
      "public",
      "Docs",
      "test-folder",
      "production-test-doc.md",
    ),
    path.join(
      process.cwd(),
      ".next",
      "standalone",
      "Docs",
      "test-folder",
      "production-test-doc.md",
    ),
    path.join(process.cwd(), "Docs", "README.md"),
    path.join(process.cwd(), "public", "Docs", "README.md"),
    path.join(process.cwd(), "docs-new", "README.md"),
    path.join(process.cwd(), "Docs_old", "README.md"),
    "/home/runner/workspace/Docs/README.md",
  ];

  for (const filePath of testDocumentPaths) {
    try {
      const exists = existsSync(filePath);
      const content = exists
        ? (await fs.readFile(filePath, "utf-8")).substring(0, 100) + "..."
        : null;
      const stats = exists
        ? {
            size: statSync(filePath).size,
            isFile: statSync(filePath).isFile(),
            lastModified: statSync(filePath).mtime,
          }
        : null;

      results.testDocument[filePath] = { exists, stats, content };
    } catch (error) {
      results.testDocument[filePath] = {
        exists: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Check for documentation copy scripts
  const documentationScripts = [
    path.join(process.cwd(), "copy-docs.js"),
    path.join(process.cwd(), "docs-copy-production.js"),
    path.join(process.cwd(), "docs-deploy-test.js"),
    path.join(process.cwd(), "docs-deploy.sh"),
    path.join(process.cwd(), "preserve-docs-for-deployment.js"),
    path.join(process.cwd(), "DOCS-DEPLOYMENT.md"),
    path.join(process.cwd(), "verify-docs.js"),
  ];

  results.documentationScripts = {};

  for (const scriptPath of documentationScripts) {
    try {
      const exists = existsSync(scriptPath);
      const stats = exists
        ? {
            size: statSync(scriptPath).size,
            lastModified: statSync(scriptPath).mtime,
            isExecutable:
              exists && statSync(scriptPath).mode & 0o111 ? true : false,
          }
        : null;

      results.documentationScripts[scriptPath] = { exists, stats };
    } catch (error) {
      results.documentationScripts[scriptPath] = {
        exists: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Check API functionality
  const apiEndpoints = [
    "/api/docs/tree",
    "/api/docs/content?path=README",
    "/api/docs/recent",
    "/api/docs/search?q=api",
    "/api/docs/init",
    "/api/docs/init?force=true",
  ];

  results.apiStatus = {
    endpoints: apiEndpoints,
    message: "These endpoints should be checked separately via browser or curl",
  };

  // Add environment information
  results.environmentVariables = {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    VERCEL: process.env.VERCEL,
    AZURE_STATIC_WEB_APPS: process.env.AZURE_STATIC_WEB_APPS,
    DATABASE_URL: process.env.DATABASE_URL
      ? "Exists (not displayed for security)"
      : "Not set",
  };

  // Add running process information
  results.process = {
    cwd: process.cwd(),
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };

  console.log("[DOCS DIAGNOSE] Diagnosis complete");
  return NextResponse.json(results);
}
