import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { locations, organizations } from "@shared/schema";
import { db } from "../../../server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    let query = db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        zipCode: locations.zipCode,
        placeId: locations.placeId,
        latitude: locations.latitude,
        longitude: locations.longitude,
        isActive: locations.isActive,
        createdAt: locations.createdAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
        }
      })
      .from(locations)
      .leftJoin(organizations, eq(locations.organizationId, organizations.id))
      .orderBy(desc(locations.createdAt));

    if (organizationId) {
      query = query.where(eq(locations.organizationId, organizationId));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newLocation = await db.insert(locations).values({
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      placeId: body.placeId,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      organizationId: body.organizationId,
      isActive: body.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newLocation[0], { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}