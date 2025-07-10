import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { EventBusService } from "../../../services/event-bus-service";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../lib/db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user) {
    return null;
  }

  return {
    id: (session.user as any).id || "mock-user-id",
    organizationId: (session.user as any).organizationId || "mock-org-id",
  };
}

async function checkPermission(user: any, permission: string) {
  // In production, implement proper RBAC permission checking
  return true;
}

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(user, "view:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get all locations from the database using Drizzle ORM with related state information
      const locationsWithStates = await db
        .select({
          location: schema.locations,
          state: schema.states,
        })
        .from(schema.locations)
        .leftJoin(
          schema.states,
          eq(schema.locations.stateId, schema.states.id),
        );

      // Map the results to the expected format and filter active locations
      const activeLocations = locationsWithStates
        .filter(
          (item) =>
            item.location.status === "active" ||
            (item.location.status !== "pending" &&
              item.location.status !== "rejected"),
        )
        .map((item) => ({
          id: item.location.id,
          name: item.location.name,
          type: item.location.type,
          address1: item.location.address1,
          address2: item.location.address2,
          city: item.location.city,
          state: item.state?.name || "",
          stateCode: item.state?.code || "",
          zipcode: item.location.zipcode,
          geoLat: item.location.geoLat,
          geoLng: item.location.geoLng,
          status: item.location.status,
          active: item.location.active,
        }));

      return NextResponse.json({ data: activeLocations, status: 200 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch locations",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create locations
    if (!(await checkPermission(req, "create:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Basic validation
    if (!body.name || !body.address1) {
      return NextResponse.json(
        { error: "Name and address are required fields" },
        { status: 400 },
      );
    }

    try {
      // Get current timestamp
      const now = new Date();

      // Extract zipcode from the address field if not provided
      let zipCode = body.zipcode || "";

      // If zipcode is still empty, extract it from the address1 or use a default
      if (!zipCode && body.address1) {
        // Try to extract a US zipcode pattern from the address string
        const zipcodeMatch = body.address1.match(/\b\d{5}(?:-\d{4})?\b/);
        if (zipcodeMatch) {
          zipCode = zipcodeMatch[0];
        } else {
          // Default fallback zipcode
          zipCode = "00000";
        }
      } else if (!zipCode) {
        // Default fallback zipcode
        zipCode = "00000";
      }

      // For user-created locations, default to pending status
      const status = "pending";

      // Function to get or create a test user for development mode
      async function getOrCreateTestUserId() {
        // Check if a test user exists
        const testUsers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.username, "testuser"));

        if (testUsers.length > 0) {
          return testUsers[0].id;
        }

        // Create a test user if none exists
        const [testUser] = await db
          .insert(schema.users)
          .values({
            id: "00000000-0000-0000-0000-000000000001",
            username: "testuser",
            password: "password-hash",
            email: "test@example.com",
            fullName: "Test User",
            role: "client_user",
            active: true,
          })
          .returning();

        return testUser.id;
      }

      // Determine if we're in development mode
      const isDevelopment = process.env.NODE_ENV === "development";

      // Get a valid user ID for the requestedBy field
      let requestedById = user.id;
      if (isDevelopment) {
        try {
          requestedById = await getOrCreateTestUserId();
        } catch (err) {
          console.warn("Failed to create test user:", err);
          // Fall back to the mock user ID
        }
      }

      // Prepare data for insertion based on schema
      const locationData = {
        name: body.name,
        type: body.type || "venue",
        address1: body.address1 || "",
        address2: body.address2 || null,
        city: body.city || "",
        stateId: body.stateId || null, // Would need to resolve state name to ID in a real implementation
        zipcode: zipCode,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        notes: body.notes || null,
        status: status,
        requestedBy: requestedById,
        reviewedBy: null,
        reviewDate: null,
        geoLat: body.geoLat ? Number(body.geoLat) : null,
        geoLng: body.geoLng ? Number(body.geoLng) : null,
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      // Add location to database using Drizzle ORM
      const [location] = await db
        .insert(schema.locations)
        .values(locationData)
        .returning();

      // Publish location creation event
      const eventBus = new EventBusService();
      await eventBus.publish(
        "location.created",
        {
          locationId: location.id,
          locationName: location.name,
          userId: user.id,
          organizationId: location.organizationId,
        },
        {
          correlationId: uuidv4(),
          source: "locations-api",
          version: "1.0",
        },
      );

      return NextResponse.json({ location }, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create location",
      },
      { status: 500 },
    );
  }
}
