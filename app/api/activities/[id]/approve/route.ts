import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import {
  activities,
  activityTypes,
  locations,
  users,
} from "../../../../../shared/schema";
import { currentUser } from "../../../../lib/session";
import { eq } from "drizzle-orm";

// POST /api/activities/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const notes = body.notes || "";

    // First, check if activity exists and user is authorized
    const [existingActivity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    // Check if activity is already approved
    if (existingActivity.status === "approved") {
      return NextResponse.json(
        {
          error: "Activity is already approved",
          status: 400,
        },
        { status: 400 },
      );
    }

    // Check if activity is in a status that can be approved (typically pending)
    if (existingActivity.status !== "pending") {
      return NextResponse.json(
        {
          error: "Activity cannot be approved in its current status",
          status: 400,
        },
        { status: 400 },
      );
    }

    // Perform the approval
    const updatedActivity = await db
      .update(activities)
      .set({
        status: "approved",
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
            state: activityData.location.stateId,
            zipCode: activityData.location.zipcode,
            coordinates: {
              lat: activityData.location.latitude,
              lng: activityData.location.longitude,
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
      message: "Activity approved successfully",
    });
  } catch (error) {
    console.error("Error approving activity:", error);
    return NextResponse.json(
      { error: "Failed to approve activity" },
      { status: 500 },
    );
  }
}
