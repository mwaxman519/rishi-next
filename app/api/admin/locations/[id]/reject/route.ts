import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;



import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { publishLocationRejectedEvent } from &quot;../../../../../services/locations/locationEventPublisher&quot;;
import { eq } from &quot;drizzle-orm&quot;;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: locationId } = await params;

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
      // Get additional rejection details from request body (optional)
      const { rejectionReason } = await req
        .json()
        .catch(() => ({ rejectionReason: "&quot; }));

      // Get the location using Drizzle ORM
      const [location] = await db.select().from(locations).where(eq(locations.id, locationId));

      if (!location) {
        return NextResponse.json(
          { error: &quot;Location not found&quot; },
          { status: 404 },
        );
      }

      if (location.status !== &quot;pending&quot;) {
        return NextResponse.json(
          {
            error: &quot;Location is not in pending status and cannot be rejected&quot;,
          },
          { status: 400 },
        );
      }

      // Update location status to rejected using Drizzle ORM
      const [updatedLocation] = await db
        .update(locations)
        .set({
          status: &quot;rejected&quot;,
          reviewed_by: user.id,
          review_date: new Date(),
          notes: rejectionReason || &quot;Rejected by administrator&quot;,
        })
        .where(eq(locations.id, locationId))
        .returning();

      if (!updatedLocation) {
        return NextResponse.json(
          { error: &quot;Failed to update location&quot; },
          { status: 500 },
        );
      }

      // Publish location rejected event
      try {
        await publishLocationRejectedEvent({
          locationId: updatedLocation.id,
          name: updatedLocation.name || &quot;Unknown location&quot;,
          rejectedById: user.id,
          rejectedByName: user.fullName || user.username || &quot;Unknown user&quot;,
          rejectedAt: updatedLocation.review_date?.toISOString() || new Date().toISOString(),
          rejectionReason: rejectionReason || &quot;Rejected by administrator&quot;,
          submittedById: updatedLocation.requested_by || &quot;unknown&quot;,
        });
      } catch (eventError) {
        console.error(&quot;Failed to publish location rejected event:&quot;, eventError);
        // We continue even if event publishing fails, but log the error
      }

      return NextResponse.json(updatedLocation);
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
    console.error(&quot;Error rejecting location:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;Failed to reject location",
      },
      { status: 500 },
    );
  }
}
