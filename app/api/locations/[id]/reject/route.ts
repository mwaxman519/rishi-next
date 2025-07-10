import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../server/db";
import { locations } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "../../../../lib/auth";
import { checkPermission } from "../../../../lib/rbac";
import { z } from "zod";

// Validation schema for rejection data
const rejectionSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to reject locations (should be an internal admin)
    if (!(await checkPermission(req, "approve:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const locationId = params.id;
    if (!locationId) {
      return NextResponse.json(
        { error: "Invalid location ID" },
        { status: 400 },
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = rejectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { reason } = validationResult.data;

    // Check if location exists and is in pending state
    const existingLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);

    if (existingLocations.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    const existingLocation = existingLocations[0];

    // Can only reject locations that are in 'pending' status
    if (existingLocation.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot reject a location with status '${existingLocation.status}'`,
        },
        { status: 400 },
      );
    }

    // Update the location to rejected status
    const [updatedLocation] = await db
      .update(locations)
      .set({
        status: "rejected",
        reviewerId: user.id,
        reviewDate: new Date(),
        rejectionReason: reason,
      })
      .where(eq(locations.id, locationId))
      .returning();

    return NextResponse.json({
      message: "Location rejected successfully",
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error rejecting location:`, error);
    return NextResponse.json(
      { error: "Failed to reject location" },
      { status: 500 },
    );
  }
}
