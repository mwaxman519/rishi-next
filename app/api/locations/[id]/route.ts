import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations, updateLocationSchema } from &quot;@shared/schema&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { publishLocationUpdatedEvent } from &quot;../../../services/locations/locationEventPublisher&quot;;
import { eq } from &quot;drizzle-orm&quot;;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, &quot;view:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    const { id: locationId } = await params;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== &quot;development&quot;) {
        return NextResponse.json(
          { error: &quot;Invalid location ID format&quot; },
          { status: 400 },
        );
      }
    }

    // Get the location by ID using Drizzle ORM
    const [locationData] = await db.select().from(locations).where(eq(locations.id, locationId));

    if (!locationData) {
      return NextResponse.json(
        { error: &quot;Location not found&quot; },
        { status: 404 },
      );
    }

    return NextResponse.json(locationData);
  } catch (error) {
    console.error(`Error fetching location:`, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch location&quot; },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    const { id: locationId } = await params;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== &quot;development&quot;) {
        return NextResponse.json(
          { error: &quot;Invalid location ID format&quot; },
          { status: 400 },
        );
      }
    }

    const body = await req.json();

    // Check if location exists using Drizzle ORM
    const [existingLocation] = await db.select().from(locations).where(eq(locations.id, locationId));

    if (!existingLocation) {
      return NextResponse.json(
        { error: &quot;Location not found&quot; },
        { status: 404 },
      );
    }

    // Update the location using Drizzle ORM
    const [updatedLocation] = await db
      .update(locations)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(locations.id, locationId))
      .returning();

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error(`Error updating location:`, error);
    return NextResponse.json(
      { error: &quot;Failed to update location&quot; },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to delete locations
    if (!(await checkPermission(req, &quot;delete:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    const { id: locationId } = await params;

    // Validate that the ID is a valid UUID
    if (
      !locationId ||
      !locationId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // Handle the case where the ID is not a number or UUID
      // In development mode, allow string IDs for testing
      if (process.env.NODE_ENV !== &quot;development&quot;) {
        return NextResponse.json(
          { error: &quot;Invalid location ID format&quot; },
          { status: 400 },
        );
      }
    }

    // Check if location exists using Drizzle ORM
    const [existingLocation] = await db.select().from(locations).where(eq(locations.id, locationId));

    if (!existingLocation) {
      return NextResponse.json(
        { error: &quot;Location not found&quot; },
        { status: 404 },
      );
    }

    // Delete the location using Drizzle ORM
    await db.delete(locations).where(eq(locations.id, locationId));

    return NextResponse.json(
      { message: &quot;Location deleted successfully&quot; },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting location:`, error);
    return NextResponse.json(
      { error: &quot;Failed to delete location&quot; },
      { status: 500 },
    );
  }
}
