import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { count } from &quot;drizzle-orm&quot;;

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
        { error: &quot;Authentication required&quot; },
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
    console.error(&quot;Error retrieving states:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve states&quot; },
      { status: 500 },
    );
  }
}
