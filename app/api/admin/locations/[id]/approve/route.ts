/**
 * Location Approval API Route Handler
 *
 * This route handles approving pending locations by authorized users.
 * It performs permission checks, updates the location status, and publishes event notifications.
 *
 * @route POST /api/admin/locations/[id]/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { locations } from "@shared/schema";
import { publishLocationApprovedEvent } from "../../../../../services/locations/locationEventPublisher";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // IMPORTANT: Always destructure params in Next.js 15+ to avoid the "sync-dynamic-apis" error
    // Directly using params.id will cause "Route used `params.id` without awaiting" error
    const { id: locationId } = await params;

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to update locations
    if (!(await checkPermission(user, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get the location using Drizzle ORM
      const [location] = await db.select().from(locations).where(eq(locations.id, locationId));

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

      // Update location status to active using Drizzle ORM
      const [updatedLocation] = await db
        .update(locations)
        .set({
          status: "active",
          reviewed_by: user.id,
          review_date: new Date(),
        })
        .where(eq(locations.id, locationId))
        .returning();

      if (!updatedLocation) {
        return NextResponse.json(
          { error: "Failed to update location" },
          { status: 500 },
        );
      }

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
          approvedAt: updatedLocation.review_date?.toISOString() || new Date().toISOString(),
          // This might be called requested_by instead of submittedById in our implementation
          submittedById: updatedLocation.requested_by || "unknown",
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
