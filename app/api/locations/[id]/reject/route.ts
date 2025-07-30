import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@/shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { z } from &quot;zod&quot;;

// Validation schema for rejection data
const rejectionSchema = z.object({
  reason: z.string().min(1, &quot;Rejection reason is required&quot;),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to reject locations (should be an internal admin)
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

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = rejectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: &quot;Validation failed&quot;,
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { reason } = validationResult.data;

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

    // Can only reject locations that are in 'pending' status
    if (existingLocation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        {
          error: `Cannot reject a location with status '${existingLocation.status}'`,
        },
        { status: 400 },
      );
    }

    // Update the location to rejected status
    const [updatedLocation] = await db
      .update(locations)
      .set({
        status: &quot;rejected&quot;,
        reviewerId: user.id,
        reviewDate: new Date(),
        rejectionReason: reason,
      })
      .where(eq(locations.id, locationId))
      .returning();

    return NextResponse.json({
      message: &quot;Location rejected successfully&quot;,
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error rejecting location:`, error);
    return NextResponse.json(
      { error: &quot;Failed to reject location&quot; },
      { status: 500 },
    );
  }
}
