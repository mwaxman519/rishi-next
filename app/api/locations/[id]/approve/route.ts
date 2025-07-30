import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@/shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to approve locations (should be an internal admin)
    if (!(await checkPermission(req, &quot;update:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    const locationId = params.id;
    if (!locationId) {
      return NextResponse.json(
        { error: &quot;Invalid location ID&quot; },
        { status: 400 },
      );
    }

    // Check if location exists and is in pending state
    const existingLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);

    if (existingLocations.length === 0) {
      return NextResponse.json(
        { error: &quot;Location not found&quot; },
        { status: 404 },
      );
    }

    const existingLocation = existingLocations[0];

    // Can only approve locations that are in 'pending' status
    if (existingLocation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        {
          error: `Cannot approve a location with status '${existingLocation.status}'`,
        },
        { status: 400 },
      );
    }

    // Update the location to approved status
    const [updatedLocation] = await db
      .update(locations)
      .set({
        status: &quot;approved&quot;,
        reviewerId: user.id,
        reviewDate: new Date(),
      })
      .where(eq(locations.id, locationId))
      .returning();

    return NextResponse.json({
      message: &quot;Location approved successfully&quot;,
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error approving location:`, error);
    return NextResponse.json(
      { error: &quot;Failed to approve location&quot; },
      { status: 500 },
    );
  }
}
