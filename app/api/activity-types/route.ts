

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { activityTypes } from &quot;@shared/schema&quot;;
import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { eq, or, isNull } from &quot;drizzle-orm&quot;;

// GET /api/activity-types
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId =
      (searchParams.get(&quot;organizationId&quot;) || undefined) || (user as any).organizationId;

    // Fetch both system-defined activity types and organization-specific types
    const types = await db
      .select()
      .from(activityTypes)
      .where(
        // Include system types (null organizationId) and org-specific types
        or(
          isNull(activityTypes.organizationId),
          eq(activityTypes.organizationId, organizationId),
        ),
      )
      .orderBy(activityTypes.name);

    return NextResponse.json({
      data: types.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        icon: type.icon,
        color: type.color,
        isSystemDefined: type.isSystemDefined,
      })),
      status: 200,
    });
  } catch (error) {
    console.error(&quot;Error fetching activity types:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch activity types&quot; },
      { status: 500 },
    );
  }
}
