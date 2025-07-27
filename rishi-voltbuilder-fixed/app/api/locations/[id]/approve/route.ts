import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { locations } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to approve locations (should be an internal admin)
    if (!(await checkPermission(req, "update:locations"))) {
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

    // Can only approve locations that are in 'pending' status
    if (existingLocation.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot approve a location with status '${existingLocation.status}'`,
        },
        { status: 400 },
      );
    }

    // Update the location to approved status
    const [updatedLocation] = await db
      .update(locations)
      .set({
        status: "approved",
        reviewerId: user.id,
        reviewDate: new Date(),
      })
      .where(eq(locations.id, locationId))
      .returning();

    return NextResponse.json({
      message: "Location approved successfully",
      location: updatedLocation,
    });
  } catch (error) {
    console.error(`Error approving location:`, error);
    return NextResponse.json(
      { error: "Failed to approve location" },
      { status: 500 },
    );
  }
}
