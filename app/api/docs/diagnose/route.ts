import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import path from &quot;path&quot;;
import { promises as fs, existsSync, statSync, readdirSync } from &quot;fs&quot;;

/**
 * GET handler for docs diagnosis API
 * This endpoint provides detailed diagnostic information about
 * the documentation system and file locations
 */
export async function GET() {
  console.log(&quot;[DOCS DIAGNOSE] Starting documentation system diagnosis&quot;);

  const isProduction = process.env.NODE_ENV === &quot;production&quot;;
  const results: any = {
    environment: isProduction ? &quot;production&quot; : &quot;development&quot;,
    timestamp: new Date().toISOString(),
    directories: {},
    files: {},
    testDocument: {},
  };

  // Check possible documentation directories
  const directoriesToCheck = [
    path.join(process.cwd(), &quot;Docs&quot;),
    path.join(process.cwd(), &quot;public&quot;, &quot;Docs&quot;),
    path.join(process.cwd(), &quot;.next&quot;, &quot;standalone&quot;, &quot;Docs&quot;),
    path.join(process.cwd(), &quot;.next&quot;, &quot;server&quot;, &quot;Docs&quot;),
    path.join(process.cwd(), &quot;.next&quot;, &quot;static&quot;, &quot;Docs&quot;),
    path.join(process.cwd(), &quot;docs-new&quot;),
    path.join(process.cwd(), &quot;../Docs&quot;),
    path.join(process.cwd(), &quot;Docs_old&quot;),
    &quot;/home/runner/workspace/Docs&quot;,
    &quot;/home/runner/Docs&quot;,
    path.join(process.cwd(), &quot;app&quot;, &quot;docs&quot;),
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
    path.join(process.cwd(), &quot;Docs&quot;, &quot;test-folder&quot;, &quot;production-test-doc.md&quot;),
    path.join(
      process.cwd(),
      &quot;public&quot;,
      &quot;Docs&quot;,
      &quot;test-folder&quot;,
      &quot;production-test-doc.md&quot;,
    ),
    path.join(
      process.cwd(),
      &quot;.next&quot;,
      &quot;standalone&quot;,
      &quot;Docs&quot;,
      &quot;test-folder&quot;,
      &quot;production-test-doc.md&quot;,
    ),
    path.join(process.cwd(), &quot;Docs&quot;, &quot;README.md&quot;),
    path.join(process.cwd(), &quot;public&quot;, &quot;Docs&quot;, &quot;README.md&quot;),
    path.join(process.cwd(), &quot;docs-new&quot;, &quot;README.md&quot;),
    path.join(process.cwd(), &quot;Docs_old&quot;, &quot;README.md&quot;),
    &quot;/home/runner/workspace/Docs/README.md&quot;,
  ];

  for (const filePath of testDocumentPaths) {
    try {
      const exists = existsSync(filePath);
      const content = exists
        ? (await fs.readFile(filePath, &quot;utf-8&quot;)).substring(0, 100) + &quot;...&quot;
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
    path.join(process.cwd(), &quot;copy-docs.js&quot;),
    path.join(process.cwd(), &quot;docs-copy-production.js&quot;),
    path.join(process.cwd(), &quot;docs-deploy-test.js&quot;),
    path.join(process.cwd(), &quot;docs-deploy.sh&quot;),
    path.join(process.cwd(), &quot;preserve-docs-for-deployment.js&quot;),
    path.join(process.cwd(), &quot;DOCS-DEPLOYMENT.md&quot;),
    path.join(process.cwd(), &quot;verify-docs.js&quot;),
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
    &quot;/api/docs/tree&quot;,
    &quot;/api/docs/content?path=README&quot;,
    &quot;/api/docs/recent&quot;,
    &quot;/api/docs/search?q=api&quot;,
    &quot;/api/docs/init&quot;,
    &quot;/api/docs/init?force=true&quot;,
  ];

  results.apiStatus = {
    endpoints: apiEndpoints,
    message: &quot;These endpoints should be checked separately via browser or curl&quot;,
  };

  // Add environment information
  results.environmentVariables = {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    VERCEL: process.env.VERCEL,
    AZURE_STATIC_WEB_APPS: process.env.AZURE_STATIC_WEB_APPS,
    DATABASE_URL: process.env.DATABASE_URL
      ? &quot;Exists (not displayed for security)&quot;
      : &quot;Not set&quot;,
  };

  // Add running process information
  results.process = {
    cwd: process.cwd(),
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };

  console.log(&quot;[DOCS DIAGNOSE] Diagnosis complete&quot;);
  return NextResponse.json(results);
}
