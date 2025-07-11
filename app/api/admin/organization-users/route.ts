import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { and, eq } from "drizzle-orm";
import { getAuthUser } from "../../../lib/auth-server";
import { organizationUsers } from "@shared/schema";
import {
  hasEnhancedPermission,
  createPermissionContext,
} from "../../../lib/rbac-enhanced";

// POST /api/admin/organization-users - Create new organization user association
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users with proper permissions can manage organization users
    if (!hasEnhancedPermission("manage:organization_users", authUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get data from request body
    const data = await request.json();

    // Basic validation
    if (!data.user_id || !data.organization_id || !data.role) {
      return NextResponse.json(
        { error: "User ID, organization ID, and role are required" },
        { status: 400 },
      );
    }

    // Check if association already exists
    const existingAssociation = await db.query.organizationUsers.findFirst({
      where: and(
        eq(organizationUsers.user_id, data.user_id),
        eq(organizationUsers.organization_id, data.organization_id),
      ),
    });

    // If association exists, update it
    if (existingAssociation) {
      const updated = await db
        .update(organizationUsers)
        .set({
          role: data.role,
          is_primary: data.is_primary ?? existingAssociation.is_primary,
        })
        .where(
          and(
            eq(organizationUsers.user_id, data.user_id),
            eq(organizationUsers.organization_id, data.organization_id),
          ),
        )
        .returning();

      const updatedUser = updated[0];
      if (!updatedUser) {
        throw new Error('Failed to update organization user association - no result returned');
      }
      return NextResponse.json(updatedUser);
    }

    // Otherwise create new association
    const result = await db
      .insert(organizationUsers)
      .values({
        user_id: data.user_id,
        organization_id: data.organization_id,
        role: data.role,
        is_primary: data.is_primary ?? false,
      })
      .returning();

    const createdUser = result[0];
    if (!createdUser) {
      throw new Error('Failed to create organization user association - no result returned');
    }
    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("Error creating organization user association:", error);
    return NextResponse.json(
      { error: "Failed to create organization user association" },
      { status: 500 },
    );
  }
}
