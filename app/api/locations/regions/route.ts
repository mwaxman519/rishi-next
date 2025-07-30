import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

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
        { error: &quot;Authentication required&quot; },
        { status: 401 },
      );
    }

    // In a real implementation, this would query the database for regions
    // Mock regions for example purpose - replace with real data from database
    const regions = [
      { id: &quot;northeast&quot;, name: &quot;Northeast&quot;, count: 12 },
      { id: &quot;southeast&quot;, name: &quot;Southeast&quot;, count: 18 },
      { id: &quot;midwest&quot;, name: &quot;Midwest&quot;, count: 14 },
      { id: &quot;southwest&quot;, name: &quot;Southwest&quot;, count: 9 },
      { id: &quot;west&quot;, name: &quot;West&quot;, count: 15 },
      { id: &quot;northwest&quot;, name: &quot;Northwest&quot;, count: 7 },
      { id: &quot;central&quot;, name: &quot;Central&quot;, count: 11 },
      { id: &quot;atlantic&quot;, name: &quot;Atlantic&quot;, count: 8 },
      { id: &quot;pacific&quot;, name: &quot;Pacific&quot;, count: 10 },
    ];

    return NextResponse.json({ regions });
  } catch (error) {
    console.error(&quot;Error retrieving regions:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve regions&quot; },
      { status: 500 },
    );
  }
}
