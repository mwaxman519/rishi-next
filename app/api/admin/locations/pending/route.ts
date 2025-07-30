

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { eq, desc } from &quot;drizzle-orm&quot;;

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to manage locations
    if (!(await checkPermission(req, &quot;update:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    try {
      // Get pending locations from database using Drizzle ORM
      const pendingLocations = await db
        .select()
        .from(locations)
        .where(eq(locations.status, &quot;pending&quot;))
        .orderBy(desc(locations.created_at));

      return NextResponse.json(pendingLocations);
    } catch (dbError) {
      console.error(&quot;Database error:&quot;, dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(&quot;Error fetching pending locations:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to fetch pending locations&quot;,
      },
      { status: 500 },
    );
  }
}
