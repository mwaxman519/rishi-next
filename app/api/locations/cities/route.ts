import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { eq, and, count, inArray } from &quot;drizzle-orm&quot;;

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
        { error: &quot;Authentication required&quot; },
        { status: 401 },
      );
    }

    // Parse state filter from query params
    const { searchParams } = new URL(request.url);
    const statesParam = searchParams.get(&quot;states&quot;);
    const stateFilters = statesParam ? statesParam.split(&quot;,&quot;) : [];

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
    console.error(&quot;Error retrieving cities:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve cities&quot; },
      { status: 500 },
    );
  }
}
