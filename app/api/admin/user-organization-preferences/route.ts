import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { and, eq, ne } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { userOrganizationPreferences } from &quot;@shared/schema&quot;;
import {
  hasEnhancedPermission,
  createPermissionContext,
} from &quot;@/lib/rbac-enhanced&quot;;

// POST /api/admin/user-organization-preferences - Create/update user organization preferences
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Only users with proper permissions can manage organization preferences
    if (!hasEnhancedPermission(&quot;manage:organization_users&quot;, authUser.role)) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    // Get data from request body
    const data = await request.json();

    // Basic validation
    if (!data.user_id || !data.organization_id) {
      return NextResponse.json(
        { error: &quot;User ID and organization ID are required&quot; },
        { status: 400 },
      );
    }

    // If setting as default, unset any existing default for this user
    if (data.is_default) {
      await db
        .update(userOrganizationPreferences)
        .set({ is_default: false })
        .where(
          and(
            eq(userOrganizationPreferences.user_id, data.user_id),
            ne(
              userOrganizationPreferences.organization_id,
              data.organization_id,
            ),
          ),
        );
    }

    // Check if preference already exists
    const existingPreference =
      await db.query.userOrganizationPreferences.findFirst({
        where: and(
          eq(userOrganizationPreferences.user_id, data.user_id),
          eq(userOrganizationPreferences.organization_id, data.organization_id),
        ),
      });

    // If preference exists, update it
    if (existingPreference) {
      const updated = await db
        .update(userOrganizationPreferences)
        .set({
          is_default: data.is_default ?? existingPreference.is_default,
          last_active: new Date(),
        })
        .where(
          and(
            eq(userOrganizationPreferences.user_id, data.user_id),
            eq(
              userOrganizationPreferences.organization_id,
              data.organization_id,
            ),
          ),
        )
        .returning();

      const updatedPreference = updated[0];
      if (!updatedPreference) {
        throw new Error('Failed to update user organization preference - no result returned');
      }
      return NextResponse.json(updatedPreference);
    }

    // Otherwise create new preference
    const result = await db
      .insert(userOrganizationPreferences)
      .values({
        user_id: data.user_id,
        organization_id: data.organization_id,
        is_default: data.is_default ?? false,
        last_active: new Date(),
      })
      .returning();

    const createdPreference = result[0];
    if (!createdPreference) {
      throw new Error('Failed to create user organization preference - no result returned');
    }
    return NextResponse.json(createdPreference, { status: 201 });
  } catch (error) {
    console.error(&quot;Error setting user organization preferences:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to set user organization preferences&quot; },
      { status: 500 },
    );
  }
}
