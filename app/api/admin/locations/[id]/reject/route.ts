import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { checkPermission } from "../../../../../lib/rbac";
import { db } from "../../../../../lib/db";
import { publishLocationRejectedEvent } from "../../../../../services/locations/locationEventPublisher";

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
    if (!(await checkPermission(req, "manage:locations"))) {
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

      // Get the location
      const location = await db.location.findUnique({
        where: { id: locationId },
      });

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

      // Update location status to rejected
      const updatedLocation = await db.location.update({
        where: { id: locationId },
        data: {
          status: "rejected",
          approved: false,
          rejectedById: user.id,
          rejectedAt: new Date().toISOString(),
          rejectionReason: rejectionReason || "Rejected by administrator",
        },
      });

      // Publish location rejected event
      try {
        await publishLocationRejectedEvent({
          locationId: updatedLocation.id,
          name: updatedLocation.name,
          rejectedById: user.id,
          rejectedByName: user.name || user.username,
          rejectedAt: updatedLocation.rejectedAt!,
          rejectionReason: updatedLocation.rejectionReason || undefined,
          submittedById: updatedLocation.submittedById,
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
