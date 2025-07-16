import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "@/lib/rbac";
import { db } from "../../../lib/db";
import { locations } from "../../../../../shared/schema";
import { publishLocationRejectedEvent } from "../../../../../services/locations/locationEventPublisher";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: locationId } = await params;

    // Get user session
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage locations
    if (!(await checkPermission(user, "update:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    try {
      // Get additional rejection details from request body (optional)
      const { rejectionReason } = await req
        .json()
        .catch(() => ({ rejectionReason: "" }));

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
            error: "Location is not in pending status and cannot be rejected",
          },
          { status: 400 },
        );
      }

      // Update location status to rejected using Drizzle ORM
      const [updatedLocation] = await db
        .update(locations)
        .set({
          status: "rejected",
          reviewed_by: user.id,
          review_date: new Date(),
          notes: rejectionReason || "Rejected by administrator",
        })
        .where(eq(locations.id, locationId))
        .returning();

      if (!updatedLocation) {
        return NextResponse.json(
          { error: "Failed to update location" },
          { status: 500 },
        );
      }

      // Publish location rejected event
      try {
        await publishLocationRejectedEvent({
          locationId: updatedLocation.id,
          name: updatedLocation.name || "Unknown location",
          rejectedById: user.id,
          rejectedByName: user.fullName || user.name || user.name || user.username || "Unknown user",
          rejectedAt: updatedLocation.review_date?.toISOString() || new Date().toISOString(),
          rejectionReason: rejectionReason || "Rejected by administrator",
          submittedById: updatedLocation.requested_by || "unknown",
        });
      } catch (eventError) {
        console.error("Failed to publish location rejected event:", eventError);
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
    console.error("Error rejecting location:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to reject location",
      },
      { status: 500 },
    );
  }
}
