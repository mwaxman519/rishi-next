import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[LOCATIONS] GET - Fetching locations');
    
    const locationList = await db.select().from(locations);
    console.log(`[LOCATIONS] Found ${locationList.length} locations`);
    
    return NextResponse.json(locationList);
    
  } catch (error) {
    console.error('[LOCATIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[LOCATIONS] POST - Creating location');
    
    const body = await request.json();
    const { name, address, city, state, zipCode, organizationId } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address required' }, { status: 400 });
    }

    const [newLocation] = await db.insert(locations).values({
      name,
      address,
      city,
      state,
      zipCode,
      organizationId
    }).returning();

    console.log('[LOCATIONS] Created location:', newLocation.name);
    return NextResponse.json(newLocation);
    
  } catch (error) {
    console.error('[LOCATIONS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
