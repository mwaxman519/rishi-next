import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;



import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  activities,
  activityTypes,
  locations,
  users,
} from &quot;@/shared/schema&quot;;
import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// POST /api/activities/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const notes = body.notes || "&quot;;

    // First, check if activity exists and user is authorized
    const [existingActivity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!existingActivity) {
      return NextResponse.json(
        { error: &quot;Activity not found&quot; },
        { status: 404 },
      );
    }

    // Check if activity is already approved
    if (existingActivity.status === &quot;approved&quot;) {
      return NextResponse.json(
        {
          error: &quot;Activity is already approved&quot;,
          status: 400,
        },
        { status: 400 },
      );
    }

    // Check if activity is in a status that can be approved (typically pending)
    if (existingActivity.status !== &quot;pending&quot;) {
      return NextResponse.json(
        {
          error: &quot;Activity cannot be approved in its current status&quot;,
          status: 400,
        },
        { status: 400 },
      );
    }

    // Perform the approval
    const updatedActivity = await db
      .update(activities)
      .set({
        status: &quot;approved&quot;,
        notes: existingActivity.notes
          ? `${existingActivity.notes}\n\nApproval notes (${new Date().toISOString()}): ${notes}`
          : `Approval notes (${new Date().toISOString()}): ${notes}`,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    // Fetch the complete activity data with related entities
    const [activityData] = await db
      .select({
        activity: activities,
        activityType: activityTypes,
        location: locations,
        createdBy: users,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(locations, eq(activities.locationId, locations.id))
      .leftJoin(users, eq(activities.createdById, users.id))
      .where(eq(activities.id, id));

    // Check if activity data was found after update
    if (!activityData) {
      return NextResponse.json(
        { error: &quot;Activity not found after update&quot; },
        { status: 404 },
      );
    }

    // Format the response
    const formattedActivity = {
      ...activityData.activity,
      type: activityData.activityType
        ? {
            id: activityData.activityType.id,
            name: activityData.activityType.name,
            icon: activityData.activityType.icon,
            color: activityData.activityType.color,
          }
        : null,
      location: activityData.location
        ? {
            id: activityData.location.id,
            name: activityData.location.name,
            address: activityData.location.address1,
            city: activityData.location.city,
            state: activityData.location.state_id,
            zipCode: activityData.location.zipcode,
            coordinates: {
              lat: activityData.location.geo_lat,
              lng: activityData.location.geo_lng,
            },
          }
        : null,
      createdBy: activityData.createdBy
        ? {
            id: activityData.createdBy.id,
            name:
              activityData.createdBy.fullName ||
              activityData.createdBy.username,
            email: activityData.createdBy.email,
          }
        : null,
    };

    // TODO: In a real application, we might trigger notifications here
    // Such as email, push notifications, etc.

    return NextResponse.json({
      data: formattedActivity,
      status: 200,
      message: &quot;Activity approved successfully&quot;,
    });
  } catch (error) {
    console.error(&quot;Error approving activity:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to approve activity" },
      { status: 500 },
    );
  }
}
