import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { locations } from "@shared/schema";
import { eq, and, count, inArray } from "drizzle-orm";

/**
 * GET /api/locations/cities
 * Retrieves a list of cities with location counts, optionally filtered by state
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

    // Parse state filter from query params
    const { searchParams } = new URL(request.url);
    const statesParam = searchParams.get("states");
    const stateFilters = statesParam ? statesParam.split(",") : [];

    // Query database for cities with location counts
    let query = db
      .select({
        name: locations.city,
        state: locations.state,
        count: count(),
      })
      .from(locations)
      .where(locations.city !== null)
      .groupBy(locations.city, locations.state);

    // Apply state filter if provided
    if (stateFilters.length > 0) {
      query = query.where(
        and(
          locations.city !== null,
          inArray(locations.state, stateFilters)
        )
      );
    }

    const cities = await query;

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error retrieving cities:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cities" },
      { status: 500 },
    );
  }
}
