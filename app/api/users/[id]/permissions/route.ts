import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "../../../../lib/db";
import { eq, and } from "drizzle-orm";
import { users, userPermissions } from "../../../../../shared/schema";
import { validateRequest } from "../../../../../lib/auth-server";
import { getAllRoles } from "../../../../../shared/rbac/roles";

interface PermissionRecord {
  permission: string;
  granted: boolean;
}

// GET /api/users/[id]/permissions - Get user permissions
export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    // Correctly access dynamic params in Next.js 15
    const params = await context.params;
    const id = params.id;
    console.log(`GET /api/users/${id}/permissions - Getting user permissions`);

    // Authenticated access only
    const user = await validateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the requested user exists
    const userRecordResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const userRecord = userRecordResult[0];
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all custom permissions for this user
    const customPermissions = await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, id));

    // Get the roles to determine default permissions
    const allRoles = getAllRoles();
    const roleDefinition = allRoles.find((r) => r.id === userRecord.role);

    if (!roleDefinition) {
      return NextResponse.json(
        { error: "Invalid role configuration" },
        { status: 500 },
      );
    }

    // Create a mapping of permissions to their granted status
    const permissionsMap: Record<string, boolean> = {};

    // First, set all permissions based on the role
    roleDefinition.permissions.forEach((permission) => {
      permissionsMap[permission] = true;
    });

    // Then override with custom permissions
    customPermissions.forEach((permission) => {
      permissionsMap[permission.permission] = permission.granted;
    });

    // Convert to the expected format
    const permissions = Object.entries(permissionsMap).map(
      ([permission, granted]) => ({
        permission,
        granted,
      }),
    );

    // Get the list of overridden permissions
    const overriddenPermissions = customPermissions.map((p) => p.permission);

    return NextResponse.json({
      permissions,
      overriddenPermissions,
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id]/permissions - Update user permissions
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    // Correctly access dynamic params in Next.js 15
    const params = await context.params;
    const id = params.id;
    console.log(`PUT /api/users/${id}/permissions - Updating user permissions`);

    // Authenticated access only
    const user = await validateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the current user has permission to edit permissions
    if (!user.permissions.includes("edit:permissions")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if the requested user exists
    const userRecordResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const userRecord = userRecordResult[0];
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the request body
    const body = await request.json();

    // Validate the request
    if (!body.permissions || !Array.isArray(body.permissions)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const permissionsToUpdate: PermissionRecord[] = body.permissions;

    // Update each permission
    for (const permission of permissionsToUpdate) {
      // Check if this permission already exists for this user
      const existingPermissionResult = await db
        .select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, id),
            eq(userPermissions.permission, permission.permission),
          ),
        )
        .limit(1);

      const existingPermission = existingPermissionResult[0];

      if (existingPermission) {
        // Update existing permission
        await db
          .update(userPermissions)
          .set({ granted: permission.granted })
          .where(
            and(
              eq(userPermissions.userId, id),
              eq(userPermissions.permission, permission.permission),
            ),
          );
      } else {
        // Insert new permission
        await db.insert(userPermissions).values({
          userId: id,
          permission: permission.permission,
          granted: permission.granted,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
