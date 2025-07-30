import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;



import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  activities,
  activityTypes,
  locations,
  activityAssignments,
  users,
  bookings,
} from &quot;@shared/schema&quot;;
import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// GET /api/activities/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;

    // Fetch activity with related data
    const [activityData] = await db
      .select({
        activity: activities,
        activityType: activityTypes,
        location: locations,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(locations, eq(activities.locationId, locations.id))
      .where(eq(activities.id, id));

    if (!activityData) {
      return NextResponse.json(
        { error: &quot;Activity not found&quot; },
        { status: 404 },
      );
    }

    // Authorization check (simplified for now - can be enhanced later)
    // TODO: Implement proper organization-based authorization using userOrganizations table
    // For now, all authenticated users can view activities

    // Fetch assignments for this activity
    const assignments = await db
      .select({
        assignment: activityAssignments,
        assignee: users,
      })
      .from(activityAssignments)
      .leftJoin(users, eq(activityAssignments.userId, users.id))
      .where(eq(activityAssignments.activityId, id));

    // Format the data for the response
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
      assignments: assignments.map((item) => ({
        id: item.assignment.id,
        role: item.assignment.role,
        status: item.assignment.status,
        assignee: item.assignee
          ? {
              id: item.assignee.id,
              name: item.assignee.fullName || item.assignee.username,
              username: item.assignee.username,
              profileImage: item.assignee.profileImage,
            }
          : null,
      })),
    };

    return NextResponse.json({
      data: formattedActivity,
      status: 200,
    });
  } catch (error) {
    console.error(&quot;Error fetching activity:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch activity&quot; },
      { status: 500 },
    );
  }
}

// PUT /api/activities/[id]
export async function PUT(
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

    // First, check if activity exists and user is authorized
    const [existingActivity] = await db
      .select({
        activity: activities,
        booking: bookings,
      })
      .from(activities)
      .leftJoin(bookings, eq(activities.bookingId, bookings.id))
      .where(eq(activities.id, id));

    if (!existingActivity) {
      return NextResponse.json(
        { error: &quot;Activity not found&quot; },
        { status: 404 },
      );
    }

    // Check organization authorization through parent booking
    const userRole = (user as any).role;
    const isAdmin = [&quot;super_admin&quot;, &quot;internal_admin&quot;, &quot;internal_field_manager&quot;].includes(userRole);
    
    if (!isAdmin && existingActivity.booking?.clientOrganizationId !== (user as any).organizationId) {
      return NextResponse.json(
        { error: &quot;Not authorized to update this activity&quot; },
        { status: 403 },
      );
    }

    // Update the activity
    const updatedActivity = await db
      .update(activities)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    // Fetch updated activity with related data for response
    const [activityData] = await db
      .select({
        activity: activities,
        activityType: activityTypes,
        location: locations,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(locations, eq(activities.locationId, locations.id))
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
    };

    return NextResponse.json({
      data: formattedActivity,
      status: 200,
      message: &quot;Activity updated successfully&quot;,
    });
  } catch (error) {
    console.error(&quot;Error updating activity:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to update activity&quot; },
      { status: 500 },
    );
  }
}

// DELETE /api/activities/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;

    // Check if activity exists and user is authorized
    const [existingActivity] = await db
      .select({
        activity: activities,
        booking: bookings,
      })
      .from(activities)
      .leftJoin(bookings, eq(activities.bookingId, bookings.id))
      .where(eq(activities.id, id));

    if (!existingActivity) {
      return NextResponse.json(
        { error: &quot;Activity not found&quot; },
        { status: 404 },
      );
    }

    // Check organization authorization through parent booking
    const userRole = (user as any).role;
    const isAdmin = [&quot;super_admin&quot;, &quot;internal_admin&quot;, &quot;internal_field_manager&quot;].includes(userRole);
    
    if (!isAdmin && existingActivity.booking?.clientOrganizationId !== (user as any).organizationId) {
      return NextResponse.json(
        { error: &quot;Not authorized to delete this activity&quot; },
        { status: 403 },
      );
    }

    // Delete the activity
    await db.delete(activities).where(eq(activities.id, id));

    return NextResponse.json({
      status: 200,
      message: &quot;Activity deleted successfully&quot;,
    });
  } catch (error) {
    console.error(&quot;Error deleting activity:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to delete activity&quot; },
      { status: 500 },
    );
  }
}
