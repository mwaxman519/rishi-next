import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "../../../../../lib/prisma";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import hasPermission from "../../../../../lib/rbac/hasPermission";
import { locationEventBus } from "../../../../services/infrastructure/messaging/locationEvents";

// Define the shape of the request body
const BulkUpdateSchema = z.object({
  locationIds: z.array(z.string()),
  updates: z.object({
    status: z.string().optional(),
    locationType: z.string().optional(),
    notes: z.string().optional(),
    // Add other fields that can be bulk updated as needed
  }),
});

export async function POST(req: NextRequest) {
  // Check authentication and permissions
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user has permissions to update locations
  const userHasPermission = hasPermission(session, {
    action: "update",
    resource: "locations",
  });

  if (!userHasPermission) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = BulkUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { locationIds, updates } = validationResult.data;

    if (locationIds.length === 0) {
      return NextResponse.json(
        { error: "No location IDs provided" },
        { status: 400 },
      );
    }

    // Get the current state of locations before updating
    const locationsBeforeUpdate = await prisma.location.findMany({
      where: {
        id: {
          in: locationIds,
        },
      },
      select: {
        id: true,
        status: true,
        locationType: true,
      },
    });

    // Perform the updates
    const updateResult = await prisma.location.updateMany({
      where: {
        id: {
          in: locationIds,
        },
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    // Get user info for event metadata
    // In development mode, we use a mock user with specific properties
    const userId = (session.user as any).id || "unknown";
    const organizationId = (session.user as any).organizationId || "unknown";

    // Publish events for each updated location
    const eventPromises = locationIds.map((locationId) => {
      const locationBefore = locationsBeforeUpdate.find(
        (loc: { id: string; status?: string; locationType?: string }) =>
          loc.id === locationId,
      );

      // Determine what fields were changed
      const changedFields = [];

      if (updates.status && locationBefore?.status !== updates.status) {
        changedFields.push("status");

        // Publish a status-specific event
        locationEventBus.publish(
          "location.status.updated",
          {
            locationId,
            newStatus: updates.status,
            previousStatus: locationBefore?.status,
            updatedBy: userId,
          },
          {
            userId,
            organizationId,
            timestamp: new Date().toISOString(),
          },
        );
      }

      if (
        updates.locationType &&
        locationBefore?.locationType !== updates.locationType
      ) {
        changedFields.push("locationType");
      }

      if (updates.notes) {
        changedFields.push("notes");
      }

      // Publish a general update event
      return locationEventBus.publish(
        "location.updated",
        {
          locationId,
          updatedBy: userId,
          changes: changedFields,
        },
        {
          userId,
          organizationId,
          timestamp: new Date().toISOString(),
        },
      );
    });

    // Wait for all events to be published
    await Promise.all(eventPromises);

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} locations`,
      count: updateResult.count,
    });
  } catch (error) {
    console.error("Error in bulk location update:", error);
    return NextResponse.json(
      {
        error: "Failed to update locations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
