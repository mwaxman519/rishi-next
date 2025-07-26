import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { bookings, locations, organizations, users } from "@shared/schema";
import { db } from "../../../server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db
      .select({
        id: bookings.id,
        title: bookings.title,
        description: bookings.description,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        location: {
          id: locations.id,
          name: locations.name,
          address: locations.address,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
        }
      })
      .from(bookings)
      .leftJoin(locations, eq(bookings.locationId, locations.id))
      .leftJoin(organizations, eq(bookings.clientOrganizationId, organizations.id))
      .orderBy(desc(bookings.startTime));

    if (organizationId) {
      query = query.where(eq(bookings.clientOrganizationId, organizationId));
    }

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(bookings.startTime, new Date(startDate)),
          lte(bookings.endTime, new Date(endDate))
        )
      );
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newBooking = await db.insert(bookings).values({
      title: body.title,
      description: body.description,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      locationId: body.locationId,
      clientOrganizationId: body.clientOrganizationId,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}