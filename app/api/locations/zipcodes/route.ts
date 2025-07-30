import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

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
        { error: &quot;Authentication required&quot; },
        { status: 401 },
      );
    }

    // Parse filters from query params
    const { searchParams } = new URL(request.url);
    const statesParam = (searchParams.get(&quot;states&quot;) || undefined);
    const citiesParam = (searchParams.get(&quot;cities&quot;) || undefined);

    const stateFilters = statesParam ? statesParam.split(&quot;,&quot;) : [];
    const cityFilters = citiesParam ? citiesParam.split(&quot;,&quot;) : [];

    // In a real implementation, this would query the database for ZIP codes
    // filtered by the selected states and cities

    // Mock data - would be replaced with database query
    let zipCodes = [
      // Los Angeles ZIP codes
      { code: &quot;90001&quot;, city: &quot;Los Angeles&quot;, state: &quot;CA&quot;, count: 2 },
      { code: &quot;90024&quot;, city: &quot;Los Angeles&quot;, state: &quot;CA&quot;, count: 1 },
      { code: &quot;90210&quot;, city: &quot;Beverly Hills&quot;, state: &quot;CA&quot;, count: 2 },

      // San Francisco ZIP codes
      { code: &quot;94016&quot;, city: &quot;San Francisco&quot;, state: &quot;CA&quot;, count: 1 },
      { code: &quot;94102&quot;, city: &quot;San Francisco&quot;, state: &quot;CA&quot;, count: 2 },

      // New York ZIP codes
      { code: &quot;10001&quot;, city: &quot;New York&quot;, state: &quot;NY&quot;, count: 2 },
      { code: &quot;10012&quot;, city: &quot;New York&quot;, state: &quot;NY&quot;, count: 1 },
      { code: &quot;10036&quot;, city: &quot;New York&quot;, state: &quot;NY&quot;, count: 3 },

      // Chicago ZIP codes
      { code: &quot;60601&quot;, city: &quot;Chicago&quot;, state: &quot;IL&quot;, count: 2 },
      { code: &quot;60614&quot;, city: &quot;Chicago&quot;, state: &quot;IL&quot;, count: 1 },
      { code: &quot;60654&quot;, city: &quot;Chicago&quot;, state: &quot;IL&quot;, count: 2 },

      // Miami ZIP codes
      { code: &quot;33101&quot;, city: &quot;Miami&quot;, state: &quot;FL&quot;, count: 1 },
      { code: &quot;33139&quot;, city: &quot;Miami Beach&quot;, state: &quot;FL&quot;, count: 2 },
      { code: &quot;33156&quot;, city: &quot;Miami&quot;, state: &quot;FL&quot;, count: 1 },

      // Houston ZIP codes
      { code: &quot;77001&quot;, city: &quot;Houston&quot;, state: &quot;TX&quot;, count: 1 },
      { code: &quot;77002&quot;, city: &quot;Houston&quot;, state: &quot;TX&quot;, count: 2 },
      { code: &quot;77030&quot;, city: &quot;Houston&quot;, state: &quot;TX&quot;, count: 1 },
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
    console.error(&quot;Error retrieving ZIP codes:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve ZIP codes&quot; },
      { status: 500 },
    );
  }
}
