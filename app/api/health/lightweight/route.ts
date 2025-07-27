import { NextResponse } from "next/server";

/**
 * Ultra-lightweight health check endpoint for deployment health checks
 * - No database connections
 * - No service dependencies  
 * - Minimal memory usage
 * - Responds instantly
 */
export const dynamic = "force-static";
export const revalidate = false;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      server: "ready"
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    },
  );
}