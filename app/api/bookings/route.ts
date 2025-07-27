import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[BOOKINGS] GET - Fetching bookings');
    
    const bookingList = await db.select().from(bookings);
    console.log(`[BOOKINGS] Found ${bookingList.length} bookings`);
    
    return NextResponse.json(bookingList);
    
  } catch (error) {
    console.error('[BOOKINGS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[BOOKINGS] POST - Creating booking');
    
    const body = await request.json();
    const { title, startDate, endDate, locationId, clientOrganizationId, status } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Title, start date, and end date required' }, { status: 400 });
    }

    const [newBooking] = await db.insert(bookings).values({
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      locationId,
      clientOrganizationId,
      status: status || 'pending'
    }).returning();

    console.log('[BOOKINGS] Created booking:', newBooking.title);
    return NextResponse.json(newBooking);
    
  } catch (error) {
    console.error('[BOOKINGS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
