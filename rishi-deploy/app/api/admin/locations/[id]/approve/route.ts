/**
 * Location Approval API Route Handler
 *
 * This route handles approving pending locations by authorized users.
 * It performs permission checks, updates the location status, and publishes event notifications.
 *
 * @route POST /api/admin/locations/[id]/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { checkPermission } from "../../../../../lib/rbac";
import { db } from "../../../../../lib/db";
import { publishLocationApprovedEvent } from "../../../../../services/locations/locationEventPublisher";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // IMPORTANT: Always destructure params in Next.js 14+ to avoid the "sync-dynamic-apis" error
    // Directly using params.id will cause "Route used `params.id` without awaiting" error
    const { id: locationId } = params;

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage locations
    if (!(await checkPermission(req, "manage:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get the location - using findById() which is implemented in our mock database
      // Note: In production with an ORM like Prisma/Drizzle, this would be findUnique({where: {id}})
      const location = await db.location.findById(locationId);

      if (!location) {
        return NextResponse.json(
          { error: "Location not found" },
          { status: 404 },
        );
      }

      if (location.status !== "pending") {
        return NextResponse.json(
          {
            error: "Location is not in pending status and cannot be approved",
          },
          { status: 400 },
        );
      }

      // Update location status to active and mark as approved
      // Using the correct update method for our mock db implementation
      const updatedLocation = await db.location.update(locationId, {
        status: "active",
        approved: true,
        approvedById: user.id,
        approvedAt: new Date().toISOString(),
      });

      // Publish location approved event
      // Debug log to find where the issue might be
      console.log(
        "[approve/route] Updated location to publish:",
        JSON.stringify(updatedLocation, null, 2),
      );
      console.log(
        "[approve/route] User approving location:",
        JSON.stringify(user, null, 2),
      );

      try {
        // Make sure we have all the required fields and provide fallbacks for optional ones
        await publishLocationApprovedEvent({
          locationId: updatedLocation.id,
          name: updatedLocation.name || "Unknown location",
          approvedById: user.id,
          approvedByName: user.fullName || user.username || "Unknown user",
          approvedAt: updatedLocation.approvedAt || new Date().toISOString(),
          // This might be called createdById instead of submittedById in our mock implementation
          submittedById: updatedLocation.createdById || "unknown",
        });
      } catch (eventError) {
        console.error("Failed to publish location approved event:", eventError);
        // We continue even if event publishing fails, but log the error
      }

      return NextResponse.json(updatedLocation);
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
    console.error("Error approving location:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to approve location",
      },
      { status: 500 },
    );
  }
}
