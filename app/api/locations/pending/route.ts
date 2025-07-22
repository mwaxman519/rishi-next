import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  AppEvent,
  BaseEvent,
  LocationApprovalPayload,
  LocationRejectionPayload,
} from "../../../../services/infrastructure/messaging/eventTypes";
import { publishEvent } from "../../../../services/infrastructure/messaging/distributedEventBus";

// Get all pending locations
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to approve locations (internal admin)
    if (!(await checkPermission(req, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Get all locations from the database using Drizzle ORM
    const allLocations = await db.select().from(schema.locations);

    // Filter for pending locations only
    const pendingLocations = allLocations.filter(
      (loc) => loc.status === "pending",
    );

    // Sort locations based on sortBy and sortOrder
    pendingLocations.sort((a, b) => {
      // Handle different sort fields
      const valueA = a[sortBy as keyof typeof a];
      const valueB = b[sortBy as keyof typeof b];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "desc"
          ? valueB.localeCompare(valueA)
          : valueA.localeCompare(valueB);
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return sortOrder === "desc"
          ? valueB.getTime() - valueA.getTime()
          : valueA.getTime() - valueB.getTime();
      } else {
        // Default comparison for other types
        if (valueA < valueB) return sortOrder === "desc" ? 1 : -1;
        if (valueA > valueB) return sortOrder === "desc" ? -1 : 1;
        return 0;
      }
    });

    // We don't need to create test data, as we can just return empty array if no locations are pending
    // This would be handled by the UI showing a "No pending locations" message

    return NextResponse.json({ pendingLocations });
  } catch (error) {
    console.error(`Error fetching pending locations:`, error);
    return NextResponse.json(
      { error: "Failed to fetch pending locations" },
      { status: 500 },
    );
  }
}

// Update pending location status (approve or reject)
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to approve locations
    if (!(await checkPermission(req, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 },
      );
    }

    // Validate status update
    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "Valid status (approved or rejected) is required" },
        { status: 400 },
      );
    }

    // Find the location in the database using Drizzle ORM
    const [location] = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.id, body.id));

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === "development";

    // Get a valid user ID for the reviewedBy field
    let reviewerId = user.id;
    if (isDevelopment) {
      try {
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

        reviewerId = await getOrCreateTestUserId();
      } catch (err) {
        console.warn("Failed to create test user:", err);
        // Fall back to the mock user ID
      }
    }

    // Update the location status
    const now = new Date();
    const newStatus = body.status === "approved" ? "active" : "rejected";
    const reviewerName = user.fullName || user.username || "Administrator";

    const [updatedLocation] = await db
      .update(schema.locations)
      .set({
        status: newStatus, // Convert 'approved' to 'active' for consistency
        reviewedBy: reviewerId,
        reviewDate: now,
        updatedAt: now,
        notes: body.notes
          ? `${location.notes || ""}\n\nAdmin notes: ${body.notes}`
          : location.notes,
      })
      .where(eq(schema.locations.id, body.id))
      .returning();

    // Publish WebSocket event based on the approval status
    try {
      if (newStatus === "active") {
        // Location was approved - publish approval event
        const approvalPayload: LocationApprovalPayload = {
          locationId: updatedLocation.id,
          name: updatedLocation.name,
          approvedById: reviewerId,
          approvedByName: reviewerName,
          approvedAt: now.toISOString(),
          submittedById: location.requested_by || undefined,
        };

        await publishEvent(AppEvent.LOCATION_APPROVED, approvalPayload, {
          targetUserId: location.requested_by, // Send notification to the user who requested it
        });

        // Also publish a system notification for all users
        await publishEvent(AppEvent.SYSTEM_NOTIFICATION, {
          title: "Location Approved",
          message: `${updatedLocation.name} has been approved and is now active.`,
          level: "success",
        });
      } else {
        // Location was rejected - publish rejection event
        const rejectionPayload: LocationRejectionPayload = {
          locationId: updatedLocation.id,
          name: updatedLocation.name,
          rejectedById: reviewerId,
          rejectedByName: reviewerName,
          rejectedAt: now.toISOString(),
          rejectionReason: body.notes || undefined,
          submittedById: location.requested_by || undefined,
        };

        await publishEvent(AppEvent.LOCATION_REJECTED, rejectionPayload, {
          targetUserId: location.requested_by, // Send notification to the user who requested it
        });
      }

      console.log(
        `WebSocket notification sent for location ${body.id} ${newStatus}`,
      );
    } catch (eventError) {
      // Log the error but don't fail the request
      console.error("Error publishing WebSocket event:", eventError);
    }

    return NextResponse.json({
      message: `Location ${body.status}`,
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error updating location status:`, error);
    return NextResponse.json(
      { error: "Failed to update location status" },
      { status: 500 },
    );
  }
}
