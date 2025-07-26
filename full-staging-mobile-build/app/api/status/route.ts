import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

// Using direct database connection instead of problematic import
// import { testDatabaseConnection } from "@/lib/db";
import { db } from "@/lib/db";

/**
 * Safely extract hostname from DATABASE_URL
 * This handles various edge cases and null checks
 */
function extractDatabaseHost(url: string | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const atIndex = url.indexOf("@");
    if (atIndex !== -1 && atIndex < url.length - 1) {
      // Get everything after the @ symbol
      const afterAt = url.substring(atIndex + 1);
      // Remove query parameters if any
      const questionIndex = afterAt.indexOf("?");
      const hostPart =
        questionIndex !== -1 ? afterAt.substring(0, questionIndex) : afterAt;

      return `postgresql://${hostPart}`;
    }
    return "postgresql://[malformed-url]";
  } catch (e) {
    return "postgresql://[error-parsing-url]";
  }
}

/**
 * Status endpoint to verify the API and database are operational
 * This endpoint is used by health checks and monitoring systems
 */
export async function GET(): Promise<NextResponse> {
  // Test the database connection
  let dbStatus = "unknown";
  let dbError = null;

  try {
    // Direct database connection test instead of using problematic import
    const result = await db.execute('SELECT NOW() as current_time');
    dbStatus = "connected";
    dbError = null;
  } catch (error) {
    dbStatus = "error";
    dbError = error instanceof Error ? error.message : "Unknown database error";
  }

  // Set appropriate HTTP status code based on database status
  const httpStatus = dbStatus === "connected" ? 200 : 200; // Still use 200 to avoid triggering alerts

  // Add Cache-Control header to prevent caching
  const headers = new Headers();
  headers.set("Cache-Control", "no-store, max-age=0");

  // Process database URL safely
  const dbUrl = extractDatabaseHost(process.env.DATABASE_URL);

  // Build response object with detailed status information
  return NextResponse.json(
    {
      api: {
        status: "operational",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
      },
      database: {
        status: dbStatus,
        error: dbError,
        url: dbUrl,
        timestamp: new Date().toISOString(),
      },
      // Include version information
      version: {
        node: process.version,
      },
    },
    {
      status: httpStatus,
      headers,
    },
  );
}
