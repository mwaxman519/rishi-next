import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { and, eq, ne } from "drizzle-orm";
import { getAuthUser } from "../../../lib/auth-server";
import { userOrganizationPreferences } from "@shared/schema";
import {
  hasEnhancedPermission,
  createPermissionContext,
} from "../../../lib/rbac-enhanced";

// POST /api/admin/user-organization-preferences - Create/update user organization preferences
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users with proper permissions can manage organization preferences
    if (!hasEnhancedPermission("manage:organization_users", authUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get data from request body
    const data = await request.json();

    // Basic validation
    if (!data.user_id || !data.organization_id) {
      return NextResponse.json(
        { error: "User ID and organization ID are required" },
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

      return NextResponse.json(updated[0]);
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

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error setting user organization preferences:", error);
    return NextResponse.json(
      { error: "Failed to set user organization preferences" },
      { status: 500 },
    );
  }
}
