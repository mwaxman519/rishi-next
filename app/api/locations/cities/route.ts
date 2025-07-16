import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/locations/cities
 * Retrieves a list of cities with location counts, optionally filtered by state
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse state filter from query params
    const { searchParams } = new URL(request.url);
    const statesParam = (searchParams.get("states") || undefined);
    const stateFilters = statesParam ? statesParam.split(",") : [];

    // In a real implementation, this would query the database for cities
    // filtered by the selected states

    // Mock data - would be replaced with database query
    let cities = [
      // California cities
      { name: "Los Angeles", state: "CA", count: 5 },
      { name: "San Francisco", state: "CA", count: 3 },
      { name: "San Diego", state: "CA", count: 4 },
      { name: "Sacramento", state: "CA", count: 2 },
      { name: "San Jose", state: "CA", count: 1 },

      // New York cities
      { name: "New York", state: "NY", count: 6 },
      { name: "Buffalo", state: "NY", count: 2 },
      { name: "Albany", state: "NY", count: 1 },
      { name: "Rochester", state: "NY", count: 2 },

      // Texas cities
      { name: "Houston", state: "TX", count: 4 },
      { name: "Austin", state: "TX", count: 3 },
      { name: "Dallas", state: "TX", count: 5 },
      { name: "San Antonio", state: "TX", count: 2 },

      // Florida cities
      { name: "Miami", state: "FL", count: 4 },
      { name: "Orlando", state: "FL", count: 3 },
      { name: "Tampa", state: "FL", count: 2 },
      { name: "Jacksonville", state: "FL", count: 1 },

      // Illinois cities
      { name: "Chicago", state: "IL", count: 5 },
      { name: "Springfield", state: "IL", count: 2 },
      { name: "Peoria", state: "IL", count: 1 },
    ];

    // Filter by states if specified
    if (stateFilters.length > 0) {
      cities = cities.filter((city) => stateFilters.includes(city.state));
    }

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error retrieving cities:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cities" },
      { status: 500 },
    );
  }
}
