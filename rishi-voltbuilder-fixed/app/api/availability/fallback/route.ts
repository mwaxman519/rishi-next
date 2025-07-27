import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/availability/fallback - Get empty availability data
 *
 * This is a fallback endpoint that guarantees a valid response
 * when the main availability service is unavailable
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET /api/availability/fallback received");

  return NextResponse.json([], {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
