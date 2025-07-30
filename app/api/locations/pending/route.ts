import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { db } from &quot;@/lib/db&quot;;
import * as schema from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import {
  AppEvent,
  AppEventTypes,
  BaseEvent,
  LocationApprovalPayload,
  LocationRejectionPayload,
} from &quot;../../../../services/infrastructure/messaging/eventTypes&quot;;
import { publishEvent } from &quot;../../../../services/infrastructure/messaging/distributedEventBus&quot;;

// Get all pending locations
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to approve locations (internal admin)
    if (!(await checkPermission(req, &quot;update:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const sortBy = url.searchParams.get(&quot;sortBy&quot;) || &quot;createdAt&quot;;
    const sortOrder = url.searchParams.get(&quot;sortOrder&quot;) || &quot;desc&quot;;

    // Get all locations from the database using Drizzle ORM
    const allLocations = await db.select().from(schema.locations);

    // Filter for pending locations only
    const pendingLocations = allLocations.filter(
      (loc) => loc.status === &quot;pending&quot;,
    );

    // Sort locations based on sortBy and sortOrder
    pendingLocations.sort((a, b) => {
      // Handle different sort fields
      const valueA = a[sortBy as keyof typeof a];
      const valueB = b[sortBy as keyof typeof b];

      if (typeof valueA === &quot;string&quot; && typeof valueB === &quot;string&quot;) {
        return sortOrder === &quot;desc&quot;
          ? valueB.localeCompare(valueA)
          : valueA.localeCompare(valueB);
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return sortOrder === &quot;desc&quot;
          ? valueB.getTime() - valueA.getTime()
          : valueA.getTime() - valueB.getTime();
      } else {
        // Default comparison for other types
        if (valueA < valueB) return sortOrder === &quot;desc&quot; ? 1 : -1;
        if (valueA > valueB) return sortOrder === &quot;desc&quot; ? -1 : 1;
        return 0;
      }
    });

    // We don&apos;t need to create test data, as we can just return empty array if no locations are pending
    // This would be handled by the UI showing a &quot;No pending locations&quot; message

    return NextResponse.json({ pendingLocations });
  } catch (error) {
    console.error(`Error fetching pending locations:`, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch pending locations&quot; },
      { status: 500 },
    );
  }
}

// Update pending location status (approve or reject)
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to approve locations
    if (!(await checkPermission(req, &quot;update:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: &quot;Location ID is required&quot; },
        { status: 400 },
      );
    }

    // Validate status update
    if (!body.status || ![&quot;approved&quot;, &quot;rejected&quot;].includes(body.status)) {
      return NextResponse.json(
        { error: &quot;Valid status (approved or rejected) is required&quot; },
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
        { error: &quot;Location not found&quot; },
        { status: 404 },
      );
    }

    // Determine if we&apos;re in development mode
    const isDevelopment = process.env.NODE_ENV === &quot;development&quot;;

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
            .where(eq(schema.users.username, &quot;testuser&quot;));

          if (testUsers.length > 0) {
            return testUsers[0].id;
          }

          // Create a test user if none exists
          const [testUser] = await db
            .insert(schema.users)
            .values({
              id: &quot;00000000-0000-0000-0000-000000000001&quot;,
              username: &quot;testuser&quot;,
              password: &quot;password-hash&quot;,
              email: &quot;test@example.com&quot;,
              fullName: &quot;Test User&quot;,
              role: &quot;client_user&quot;,
              active: true,
            })
            .returning();

          return testUser.id;
        }

        reviewerId = await getOrCreateTestUserId();
      } catch (err) {
        console.warn(&quot;Failed to create test user:&quot;, err);
        // Fall back to the mock user ID
      }
    }

    // Update the location status
    const now = new Date();
    const newStatus = body.status === &quot;approved&quot; ? &quot;active&quot; : &quot;rejected&quot;;
    const reviewerName = user.fullName || user.username || &quot;Administrator&quot;;

    const [updatedLocation] = await db
      .update(schema.locations)
      .set({
        status: newStatus, // Convert 'approved' to 'active' for consistency
        reviewed_by: reviewerId,
        reviewDate: now,
        updatedAt: now,
        notes: body.notes
          ? `${location.notes || "&quot;}\n\nAdmin notes: ${body.notes}`
          : location.notes,
      })
      .where(eq(schema.locations.id, body.id))
      .returning();

    // Publish WebSocket event based on the approval status
    try {
      if (newStatus === &quot;active&quot;) {
        // Location was approved - publish approval event
        const approvalPayload: LocationApprovalPayload = {
          locationId: updatedLocation?.id || '',
          approvedBy: reviewerId,
          timestamp: now,
          notes: body.notes,
        };

        await publishEvent(AppEventTypes.LOCATION_APPROVED, approvalPayload, {
          targetUserId: location.requested_by, // Send notification to the user who requested it
        });

        // Also publish a system notification for all users
        await publishEvent(AppEventTypes.SYSTEM_NOTIFICATION, {
          title: &quot;Location Approved&quot;,
          message: `${updatedLocation.name} has been approved and is now active.`,
          level: &quot;success&quot;,
        });
      } else {
        // Location was rejected - publish rejection event
        const rejectionPayload: LocationRejectionPayload = {
          locationId: updatedLocation?.id || '',
          rejectedBy: reviewerId,
          timestamp: now,
          reason: body.notes || 'No reason provided',
        };

        await publishEvent(AppEventTypes.LOCATION_REJECTED, rejectionPayload, {
          targetUserId: location.requested_by, // Send notification to the user who requested it
        });
      }

      console.log(
        `WebSocket notification sent for location ${body.id} ${newStatus}`,
      );
    } catch (eventError) {
      // Log the error but don&apos;t fail the request
      console.error(&quot;Error publishing WebSocket event:&quot;, eventError);
    }

    return NextResponse.json({
      message: `Location ${body.status}`,
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error updating location status:`, error);
    return NextResponse.json(
      { error: &quot;Failed to update location status" },
      { status: 500 },
    );
  }
}
