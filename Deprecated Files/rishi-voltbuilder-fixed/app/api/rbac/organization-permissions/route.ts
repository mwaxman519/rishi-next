import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizationPermissions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-utils";
import { hasPermission } from "@/lib/rbac";

/**
 * GET /api/rbac/organization-permissions
 *
 * Returns permissions specific to the current organization context
 * This endpoint is used to check if specific features are allowed for an organization
 * based on its type and tier.
 *
 * Required query parameters:
 * - organizationId: ID of the organization to check permissions for
 *
 * Optional query parameters:
 * - permissions: comma-separated list of permission names to check
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Organization permissions endpoint called");

    // Get user from authentication system
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get("organizationId") || undefined) || undefined;
    const permissions = (searchParams.get("permissions") || undefined)?.split(",") || [];

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    try {
      // Check if the user has access to the requested organization
      const userOrganization = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, parseInt(organizationId)),
          ),
        with: {
          organization: true,
        },
      });

      if (!userOrganization) {
        return NextResponse.json(
          { error: "You do not have access to this organization" },
          { status: 403 },
        );
      }

      // Get organization details
      const organization = userOrganization.organization;
      const organizationType = organization.type;
      const organizationTier = (organization.tier || "tier_1") || "tier_1";

      // Get organization-specific permissions from database
      const orgPermissions = await db
        .select()
        .from(organizationPermissions)
        .where(
          eq(organizationPermissions.organizationId, parseInt(organizationId)),
        );

      // Initialize result map
      const permissionResults: Record<string, boolean> = {};

      // Check each requested permission
      if (permissions.length > 0) {
        for (const permission of permissions) {
          // Check if there's an explicit organization permission override
          const orgPermission = orgPermissions.find(
            (p) => p.permissionName === permission,
          );

          if (orgPermission) {
            // Use explicit organization permission
            permissionResults[permission] = orgPermission.allowed;
          } else {
            // Otherwise check based on user role and organization context
            permissionResults[permission] = hasPermission(
              permission,
              userOrganization.role,
              parseInt(organizationId),
              organizationType as any, // Cast to OrganizationType
              organizationTier as any, // Cast to OrganizationTier
            );
          }
        }
      } else {
        // If no specific permissions requested, return all organization permissions
        for (const orgPermission of orgPermissions) {
          permissionResults[orgPermission.permissionName] =
            orgPermission.allowed;
        }
      }

      return NextResponse.json({
        organizationId,
        organizationType,
        organizationTier,
        permissions: permissionResults,
      });
    } catch (dbError) {
      console.error("Database error in organization permissions:", dbError);

      // Throw database error instead of returning mock data
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching organization permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/rbac/organization-permissions
 *
 * Sets organization-specific permission overrides
 * Only organization admins and system admins can modify these
 *
 * Request body:
 * {
 *   organizationId: number,
 *   permissions: { [permissionName: string]: boolean }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Organization permissions POST endpoint called");

    // Get user from authentication system
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, permissions } = body;

    if (!organizationId || !permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Remove mock data - proceed with real database operations

    try {
      // Check if user has admin access to this organization or is a super admin
      const userOrganization = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      const hasAdminAccess =
        user.role === "super_admin" ||
        user.role === "internal_admin" ||
        (userOrganization &&
          (userOrganization.role === "client_manager" ||
            userOrganization.role === "internal_field_manager"));

      if (!hasAdminAccess) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to modify organization permissions",
          },
          { status: 403 },
        );
      }

      // Update organization permissions
      const results = [];
      for (const [permissionName, allowed] of Object.entries(permissions)) {
        // Check if permission already exists
        const existingPermission = await db
          .select()
          .from(organizationPermissions)
          .where(
            and(
              eq(organizationPermissions.organizationId, organizationId),
              eq(organizationPermissions.permissionName, permissionName),
            ),
          );

        let result;
        if (existingPermission.length > 0) {
          // Update existing permission
          result = await db
            .update(organizationPermissions)
            .set({ allowed: Boolean(allowed), updated_at: new Date() })
            .where(eq(organizationPermissions.id, existingPermission[0].id))
            .returning();
        } else {
          // Create new permission
          result = await db
            .insert(organizationPermissions)
            .values({
              organizationId,
              permissionName,
              allowed: Boolean(allowed),
            })
            .returning();
        }
        const savedPermission = result[0];
        if (!savedPermission) {
          throw new Error(`Failed to save permission ${permissionName} - no result returned`);
        }
        results.push(savedPermission);
      }

      return NextResponse.json({
        organizationId,
        updatedPermissions: results.length,
        permissions: results,
      });
    } catch (dbError) {
      console.error(
        "Database error in organization permissions update:",
        dbError,
      );

      // Throw database error instead of returning mock data
      throw dbError;
    }
  } catch (error) {
    console.error("Error updating organization permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
