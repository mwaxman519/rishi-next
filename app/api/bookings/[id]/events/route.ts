import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import { eq, desc } from "drizzle-orm";
import { activities, activityTypes, bookings } from "../../../../../shared/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;

    // Query activities for this booking along with related data
    const bookingActivities = await db
      .select({
        activity: activities,
        activityType: activityTypes,
        booking: bookings,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(bookings, eq(activities.bookingId, bookings.id))
      .where(eq(activities.bookingId, bookingId))
      .orderBy(desc(activities.createdAt));

    // Format the response
    const formattedActivities = bookingActivities.map((record) => ({
      id: record.activity.id,
      title: record.activity.title,
      description: record.activity.description,
      startTime: record.activity.startTime,
      endTime: record.activity.endTime,
      status: record.activity.status,
      staffRequired: record.activity.staffRequired,
      notes: record.activity.notes,
      createdAt: record.activity.createdAt,
      updatedAt: record.activity.updatedAt,
      activityType: record.activityType
        ? {
            id: record.activityType.id,
            name: record.activityType.name,
            description: record.activityType.description,
            icon: record.activityType.icon,
            color: record.activityType.color,
          }
        : undefined,
      booking: record.booking
        ? {
            id: record.booking.id,
            title: record.booking.title,
            startDate: record.booking.startDate,
            endDate: record.booking.endDate,
            status: record.booking.status,
          }
        : undefined,
    }));

    return NextResponse.json(formattedActivities);
  } catch (error: any) {
    console.error("Error fetching booking activities:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking activities" },
      { status: 500 },
    );
  }
}
