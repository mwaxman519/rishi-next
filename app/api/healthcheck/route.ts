import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;


/**
 * Simple health check endpoint that won't attempt to access the database
 * This is used to confirm the API server is running when the database might be unavailable
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
