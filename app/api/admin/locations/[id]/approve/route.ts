import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;



/**
 * Location Approval API Route Handler
 *
 * This route handles approving pending locations by authorized users.
 * It performs permission checks, updates the location status, and publishes event notifications.
 *
 * @route POST /api/admin/locations/[id]/approve
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { publishLocationApprovedEvent } from &quot;../../../../../services/locations/locationEventPublisher&quot;;
import { eq } from &quot;drizzle-orm&quot;;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // IMPORTANT: Always destructure params in Next.js 15+ to avoid the &quot;sync-dynamic-apis&quot; error
    // Directly using params.id will cause &quot;Route used `params.id` without awaiting&quot; error
    const { id: locationId } = await params;

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to update locations
    if (!(await checkPermission(req, &quot;update:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    try {
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
            error: &quot;Location is not in pending status and cannot be approved&quot;,
          },
          { status: 400 },
        );
      }

      // Update location status to active using Drizzle ORM
      const [updatedLocation] = await db
        .update(locations)
        .set({
          status: &quot;active&quot;,
          reviewed_by: user.id,
          review_date: new Date(),
        })
        .where(eq(locations.id, locationId))
        .returning();

      if (!updatedLocation) {
        return NextResponse.json(
          { error: &quot;Failed to update location&quot; },
          { status: 500 },
        );
      }

      // Publish location approved event
      // Debug log to find where the issue might be
      console.log(
        &quot;[approve/route] Updated location to publish:&quot;,
        JSON.stringify(updatedLocation, null, 2),
      );
      console.log(
        &quot;[approve/route] User approving location:&quot;,
        JSON.stringify(user, null, 2),
      );

      try {
        // Make sure we have all the required fields and provide fallbacks for optional ones
        await publishLocationApprovedEvent({
          locationId: updatedLocation.id,
          name: updatedLocation.name || &quot;Unknown location&quot;,
          approvedById: user.id,
          approvedByName: user.fullName || user.username || &quot;Unknown user&quot;,
          approvedAt: updatedLocation.review_date?.toISOString() || new Date().toISOString(),
          // This might be called requested_by instead of submittedById in our implementation
          submittedById: updatedLocation.requested_by || &quot;unknown&quot;,
        });
      } catch (eventError) {
        console.error(&quot;Failed to publish location approved event:&quot;, eventError);
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
    console.error(&quot;Error approving location:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;Failed to approve location&quot;,
      },
      { status: 500 },
    );
  }
}
