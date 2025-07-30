import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;../../../lib/db-connection&quot;;
import { states } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;

// Get all states
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Get all active states, ordered by name
    const statesList = await db
      .select()
      .from(states)
      .where(eq(states.active, true))
      .orderBy(states.name);

    return NextResponse.json({ states: statesList });
  } catch (error) {
    console.error(`Error fetching states:`, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch states&quot; },
      { status: 500 },
    );
  }
}
