import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { locations } from "@shared/schema";
import { count } from "drizzle-orm";

/**
 * GET /api/locations/states
 * Retrieves a list of states with location counts
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Query database for states with location counts
    const states = await db
      .select({
        id: locations.state,
        code: locations.state,
        name: locations.state,
        count: count(),
      })
      .from(locations)
      .where(locations.state !== null)
      .groupBy(locations.state)
      .orderBy(locations.state);

    return NextResponse.json({ states });
  } catch (error) {
    console.error("Error retrieving states:", error);
    return NextResponse.json(
      { error: "Failed to retrieve states" },
      { status: 500 },
    );
  }
}
