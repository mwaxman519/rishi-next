import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import * as schema from "@shared/schema";
import { randomUUID } from "crypto";

// This is the admin location creation endpoint
// In a production environment, this would include more robust validation,
// role-based access control, and possibly database transactions

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
        { status: 401 },
      );
    }

    // In a real implementation, check if user has admin role
    // For demo purposes we're allowing the mock admin user to proceed

    // Parse request body
    const data = await req.json();

    // Basic validation
    if (!data.name || !data.address) {
      return NextResponse.json(
        { error: "Name and address are required fields" },
        { status: 400 },
      );
    }

    // Get current date
    const now = new Date();

    // Map our incoming data to match the database schema structure based on the locations table definition
    const locationData = {
      id: randomUUID(), // Generate a UUID for the new location
      name: data.name,
      type: data.locationType || "retail",
      address1: data.address,
      city: data.city || "",
      zipcode: data.zipCode || "",
      status: "approved", // Using the simplified status system: approved, pending, rejected, inactive
      requestedBy: "261143cd-fa2b-4660-8b54-364c87b63882", // Use a valid user ID (mike)
      reviewDate: now,
      geoLat: data.latitude ? data.latitude.toString() : null,
      geoLng: data.longitude ? data.longitude.toString() : null,
      // active field removed - using status field only
      createdAt: now,
      updatedAt: now,
    };

    // Import locations table and use insert
    const { locations } = schema;

    // Insert location into the database using the imported table
    const insertResult = await db
      .insert(locations)
      .values(locationData)
      .returning();
    const location = insertResult[0];

    console.log("Location created successfully:", location);

    // Publish event to event bus for notifications only if location was created
    if (location) {
      try {
        // Import and use eventBus if it's available
        const { eventBus } = await import(
          "../../../services/infrastructure/messaging/eventBus"
        );

        eventBus.publish({
          type: "location:created",
          payload: {
            locationId: location.id,
            locationName: location.name,
            userId: "261143cd-fa2b-4660-8b54-364c87b63882", // Use a valid user ID (mike)
            timestamp: now.toISOString(),
          },
        });

        console.log("Published location:created event");
      } catch (eventError) {
        // If eventBus isn't available, just log the error but proceed
        console.warn("Could not publish event:", eventError);
      }
    }

    // Return the created location
    if (!location) {
      return NextResponse.json(
        { error: "Failed to create location" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ...location,
        message: "Location created successfully by admin",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}

// Add GET handler to retrieve all locations
export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." },
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
        location.address1 + (location.address2 ? ", " + location.address2 : ""),
      city: location.city,
      state: location.stateId, // We need to properly join with states table for the state name
      zipCode: location.zipcode,
      latitude: location.geoLat ? parseFloat(location.geoLat.toString()) : null,
      longitude: location.geoLng
        ? parseFloat(location.geoLng.toString())
        : null,
      locationType: location.type,
      status: location.status,
      submittedById: location.requestedBy,
      createdById: location.requestedBy,
      notes: location.notes,
      createdAt: location.createdAt?.toISOString(),
      updatedAt: location.updatedAt?.toISOString(),
    }));

    console.log(
      "Returning transformed location data for map component:",
      locations_data.length,
      "locations with coordinates:",
      locations_data.filter((loc) => loc.latitude && loc.longitude).length,
    );

    return NextResponse.json(locations_data);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}
