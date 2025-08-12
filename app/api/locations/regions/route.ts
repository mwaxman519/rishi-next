import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/locations/regions
 * Retrieves a list of regions with location counts
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

    // In a real implementation, this would query the database for regions
    // Mock regions for example purpose - replace with real data from database
    const regions = [
      { id: "northeast", name: "Northeast", count: 12 },
      { id: "southeast", name: "Southeast", count: 18 },
      { id: "midwest", name: "Midwest", count: 14 },
      { id: "southwest", name: "Southwest", count: 9 },
      { id: "west", name: "West", count: 15 },
      { id: "northwest", name: "Northwest", count: 7 },
      { id: "central", name: "Central", count: 11 },
      { id: "atlantic", name: "Atlantic", count: 8 },
      { id: "pacific", name: "Pacific", count: 10 },
    ];

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error retrieving regions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve regions" },
      { status: 500 },
    );
  }
}
