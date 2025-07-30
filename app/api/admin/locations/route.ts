

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { db } from &quot;@/lib/db&quot;;
import * as schema from &quot;@shared/schema&quot;;
import { randomUUID } from &quot;crypto&quot;;

// This is the admin location creation endpoint
// In a production environment, this would include more robust validation,
// role-based access control, and possibly database transactions

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: &quot;Unauthorized. You must be logged in.&quot; },
        { status: 401 },
      );
    }

    // Check if user has admin role for location creation
    if (user.role !== 'super_admin' && user.role !== 'internal_admin') {
      return NextResponse.json(
        { error: &quot;Forbidden. Admin role required.&quot; },
        { status: 403 },
      );
    }

    // Parse request body
    const data = await req.json();

    // Basic validation
    if (!data.name || !data.address) {
      return NextResponse.json(
        { error: &quot;Name and address are required fields&quot; },
        { status: 400 },
      );
    }

    // Get current date
    const now = new Date();

    // Map our incoming data to match the database schema structure based on the locations table definition
    const locationData = {
      id: randomUUID(), // Generate a UUID for the new location
      name: data.name,
      type: data.type || &quot;retail&quot;,
      address1: data.address,
      city: data.city || "&quot;,
      zipcode: data.zipcode || &quot;&quot;,
      status: &quot;approved&quot;, // Using the simplified status system: approved, pending, rejected, inactive
      requestedBy: user.id, // Use authenticated user ID
      reviewDate: now,
      geoLat: data.geo_lat ? data.geo_lat.toString() : null,
      geoLng: data.geo_lng ? data.geo_lng.toString() : null,
      // active field removed - using status field only
      created_at: now,
      updated_at: now,
    };

    // Import locations table and use insert
    const { locations } = schema;

    // Insert location into the database using the imported table
    const insertResult = await db
      .insert(locations)
      .values(locationData)
      .returning();
    const location = insertResult[0];
    if (!location) {
      return NextResponse.json(
        { error: &quot;Failed to create location&quot; },
        { status: 500 }
      );
    }

    console.log(&quot;Location created successfully:&quot;, location);

    // Publish event to event bus for notifications only if location was created
    if (location) {
      try {
        // Import and use eventBus if it&apos;s available
        const { eventBus } = await import(
          &quot;../../../services/infrastructure/messaging/eventBus&quot;
        );

        eventBus.publish({
          type: &quot;location:created&quot;,
          payload: {
            locationId: location.id,
            locationName: location.name,
            userId: &quot;261143cd-fa2b-4660-8b54-364c87b63882&quot;, // Use a valid user ID (mike)
            timestamp: now.toISOString(),
          },
        });

        console.log(&quot;Published location:created event&quot;);
      } catch (eventError) {
        // If eventBus isn&apos;t available, just log the error but proceed
        console.warn(&quot;Could not publish event:&quot;, eventError);
      }
    }

    // Return the created location

    return NextResponse.json(
      {
        ...location,
        message: &quot;Location created successfully by admin&quot;,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(&quot;Error creating location:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create location&quot; },
      { status: 500 },
    );
  }
}

// Add GET handler to retrieve all locations
export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: &quot;Unauthorized. You must be logged in.&quot; },
        { status: 401 },
      );
    }

    // Import locations table directly
    const { locations } = schema;

    // Get all locations using the imported table
    const result = await db.select().from(locations);

    // Transform the data to match the expected format in the frontend map component
    const locations_data = result.map((location) => ({
      id: location.id,
      name: location.name,
      address:
        location.address1 + (location.address2 ? &quot;, &quot; + location.address2 : &quot;&quot;),
      city: location.city,
      state: location.state_id, // We need to properly join with states table for the state name
      zipCode: location.zipcode,
      latitude: location.geo_lat ? parseFloat(location.geo_lat.toString()) : null,
      longitude: location.geo_lng
        ? parseFloat(location.geo_lng.toString())
        : null,
      type: location.type,
      status: location.status,
      submittedById: location.requested_by,
      createdById: location.requested_by,
      notes: location.notes,
      createdAt: location.created_at?.toISOString(),
      updatedAt: location.updated_at?.toISOString(),
    }));

    console.log(
      &quot;Returning transformed location data for map component:&quot;,
      locations_data.length,
      &quot;locations with coordinates:&quot;,
      locations_data.filter((loc) => loc.latitude && loc.longitude).length,
    );

    return NextResponse.json(locations_data);
  } catch (error) {
    console.error(&quot;Error fetching locations:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch locations" },
      { status: 500 },
    );
  }
}
