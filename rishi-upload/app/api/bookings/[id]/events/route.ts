import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import { eq, and, desc } from "drizzle-orm";
import { eventInstances, locations, users } from "../../../../../shared/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const bookingId = params.id;

    // Query event instances along with related location and field manager data
    const events = await db
      .select({
        event: eventInstances,
        location: locations,
        fieldManager: users,
      })
      .from(eventInstances)
      .leftJoin(locations, eq(eventInstances.locationId, locations.id))
      .leftJoin(users, eq(eventInstances.fieldManagerId, users.id))
      .where(eq(eventInstances.bookingId, bookingId))
      .orderBy(desc(eventInstances.date));

    // Format the response
    const formattedEvents = systemEvents.map((record) => ({
      id: record.event.id,
      date: record.event.date,
      startTime: record.event.startTime,
      endTime: record.event.endTime,
      status: record.event.status,
      preparationStatus: record.event.preparationStatus,
      notes: record.event.notes,
      specialInstructions: record.event.specialInstructions,
      checkInRequired: record.event.checkInRequired,
      createdAt: record.event.createdAt,
      updatedAt: record.event.updatedAt,
      location: record.location
        ? {
            id: record.location.id,
            name: record.location.name,
            address: record.location.address,
          }
        : undefined,
      fieldManager: record.fieldManager
        ? {
            id: record.fieldManager.id,
            name: record.fieldManager.fullName || record.fieldManager.username,
            email: record.fieldManager.email,
          }
        : undefined,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error: any) {
    console.error("Error fetching event instances:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch event instances" },
      { status: 500 },
    );
  }
}
