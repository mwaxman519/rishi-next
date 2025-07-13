import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";

/**
 * GET /api/locations/zipcodes
 * Retrieves a list of ZIP codes with location counts, optionally filtered by state and/or city
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

    // Parse filters from query params
    const { searchParams } = new URL(request.url);
    const statesParam = (searchParams.get("states") || undefined);
    const citiesParam = (searchParams.get("cities") || undefined);

    const stateFilters = statesParam ? statesParam.split(",") : [];
    const cityFilters = citiesParam ? citiesParam.split(",") : [];

    // In a real implementation, this would query the database for ZIP codes
    // filtered by the selected states and cities

    // Mock data - would be replaced with database query
    let zipCodes = [
      // Los Angeles ZIP codes
      { code: "90001", city: "Los Angeles", state: "CA", count: 2 },
      { code: "90024", city: "Los Angeles", state: "CA", count: 1 },
      { code: "90210", city: "Beverly Hills", state: "CA", count: 2 },

      // San Francisco ZIP codes
      { code: "94016", city: "San Francisco", state: "CA", count: 1 },
      { code: "94102", city: "San Francisco", state: "CA", count: 2 },

      // New York ZIP codes
      { code: "10001", city: "New York", state: "NY", count: 2 },
      { code: "10012", city: "New York", state: "NY", count: 1 },
      { code: "10036", city: "New York", state: "NY", count: 3 },

      // Chicago ZIP codes
      { code: "60601", city: "Chicago", state: "IL", count: 2 },
      { code: "60614", city: "Chicago", state: "IL", count: 1 },
      { code: "60654", city: "Chicago", state: "IL", count: 2 },

      // Miami ZIP codes
      { code: "33101", city: "Miami", state: "FL", count: 1 },
      { code: "33139", city: "Miami Beach", state: "FL", count: 2 },
      { code: "33156", city: "Miami", state: "FL", count: 1 },

      // Houston ZIP codes
      { code: "77001", city: "Houston", state: "TX", count: 1 },
      { code: "77002", city: "Houston", state: "TX", count: 2 },
      { code: "77030", city: "Houston", state: "TX", count: 1 },
    ];

    // Apply filters
    if (stateFilters.length > 0) {
      zipCodes = zipCodes.filter((zip) => stateFilters.includes(zip.state));
    }

    if (cityFilters.length > 0) {
      zipCodes = zipCodes.filter((zip) =>
        cityFilters.some((city) =>
          zip.city.toLowerCase().includes(city.toLowerCase()),
        ),
      );
    }

    return NextResponse.json({ zipCodes });
  } catch (error) {
    console.error("Error retrieving ZIP codes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve ZIP codes" },
      { status: 500 },
    );
  }
}
