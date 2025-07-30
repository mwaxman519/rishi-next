

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { z } from &quot;zod&quot;;
import { db } from &quot;@/lib/db&quot;;
import { locations } from &quot;@/shared/schema&quot;;
import { eq, inArray } from &quot;drizzle-orm&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { hasPermission, type PermissionLevel } from &quot;@/lib/rbac/hasPermission&quot;;
import { locationEventBus } from &quot;../../../../services/infrastructure/messaging/locationEvents&quot;;

// Define the shape of the request body
const BulkUpdateSchema = z.object({
  locationIds: z.array(z.string()),
  updates: z.object({
    name: z.string().optional(),
    address1: z.string().optional(),
    city: z.string().optional(),
    state_id: z.string().optional(),
    zipcode: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  // Check authentication and permissions
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
  }

  // Verify user has permissions to update locations
  const userRole = (session.user as any).role || 'client_user';
  const userHasPermission = hasPermission(
    userRole,
    &quot;locations&quot;,
    &quot;write&quot; as PermissionLevel
  );

  if (!userHasPermission) {
    return NextResponse.json(
      { error: &quot;Forbidden: Insufficient permissions&quot; },
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
          error: &quot;Invalid request data&quot;,
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { locationIds, updates } = validationResult.data;

    if (locationIds.length === 0) {
      return NextResponse.json(
        { error: &quot;No location IDs provided&quot; },
        { status: 400 },
      );
    }

    // Get the current state of locations before updating
    const locationsBeforeUpdate = await db
      .select({
        id: locations.id,
        status: locations.status,
        type: locations.type,
      })
      .from(locations)
      .where(inArray(locations.id, locationIds));

    // Perform the updates
    const updateResult = await db
      .update(locations)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(inArray(locations.id, locationIds));

    // Get user info for event metadata
    // Get authenticated user from session
    const userId = (session.user as any).id || &quot;unknown&quot;;
    const organizationId = (session.user as any).organizationId || &quot;unknown&quot;;

    // Publish events for each updated location
    const eventPromises = locationIds.map((locationId) => {
      const locationBefore = locationsBeforeUpdate.find(
        (loc: { id: string; status: string | null; type: string | null }) =>
          loc.id === locationId,
      );

      // Determine what fields were changed
      const changedFields = [];

      if (updates.status && locationBefore?.status !== updates.status) {
        changedFields.push(&quot;status&quot;);

        // Publish a status-specific event
        locationEventBus.publish(
          &quot;location.status.updated&quot;,
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
        updates.type &&
        locationBefore?.type !== updates.type
      ) {
        changedFields.push(&quot;type&quot;);
      }

      if (updates.notes) {
        changedFields.push(&quot;notes&quot;);
      }

      // Publish a general update event
      return locationEventBus.publish(
        &quot;location.updated&quot;,
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
      message: `Updated ${locationIds.length} locations`,
      count: locationIds.length,
    });
  } catch (error) {
    console.error(&quot;Error in bulk location update:&quot;, error);
    return NextResponse.json(
      {
        error: &quot;Failed to update locations&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
