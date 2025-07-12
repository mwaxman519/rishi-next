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
    let user = await getCurrentUser();

    // In development mode, use a mock user
    if (process.env.NODE_ENV !== "production" && !user) {
      console.log("DEVELOPMENT MODE: Using mock user for RBAC permissions");
      // Create a mock user that matches the schema expected by the rest of the code
      user = {
        id: 1,
        username: "admin",
        role: "super_admin",
        fullName: "Admin User",
      };
    }

    console.log(
      "User from getCurrentUser:",
      user ? "User found" : "No user found",
    );
    if (!user) {
      console.log("Returning 401 - User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const permissions = searchParams.get("permissions")?.split(",") || [];

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // In development mode, return mock permissions data
    if (process.env.NODE_ENV !== "production") {
      console.log("DEVELOPMENT MODE: Using mock organization permissions data");

      // Return mock permissions data based on organization ID
      // This mimics the structure expected by the frontend
      const organizationType = "internal"; // For example, could be 'client' or 'partner'
      const organizationTier = "tier_3"; // For example, could be 'tier_1' or 'tier_2'

      // Mock permission results
      const permissionResults: Record<string, boolean> = {
        "view:dashboard": true,
        "view:analytics": true,
        "manage:users": true,
        "edit:settings": true,
        "create:content": true,
        "delete:content": true,
        "manage:permissions": true,
        "manage:brand": true,
        "create:marketing": true,
        "edit:whitelabel": user.role === "super_admin",
      };

      // If specific permissions were requested, filter the results
      const filteredResults =
        permissions.length > 0
          ? Object.fromEntries(
              Object.entries(permissionResults).filter(([key]) =>
                permissions.includes(key),
              ),
            )
          : permissionResults;

      return NextResponse.json({
        organizationId,
        organizationType,
        organizationTier,
        permissions: filteredResults,
      });
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
      const organizationTier = organization.tier;

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

      // If database error in development, provide mock data
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning mock data due to database error in development");

        return NextResponse.json({
          organizationId,
          organizationType: "internal",
          organizationTier: "tier_3",
          permissions: {
            "view:dashboard": true,
            "view:analytics": true,
            "manage:users": true,
            "edit:settings": true,
            "create:content": true,
            "delete:content": true,
          },
        });
      }

      // In production, throw the error to be caught by the outer catch
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
    let user = await getCurrentUser();

    // In development mode, use a mock user
    if (process.env.NODE_ENV !== "production" && !user) {
      console.log("DEVELOPMENT MODE: Using mock user for RBAC permissions");
      // Create a mock user that matches the schema expected by the rest of the code
      user = {
        id: 1,
        username: "admin",
        role: "super_admin",
        fullName: "Admin User",
      };
    }

    console.log(
      "User from getCurrentUser:",
      user ? "User found" : "No user found",
    );
    if (!user) {
      console.log("Returning 401 - User not authenticated");
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

    // In development mode, return mock response
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "DEVELOPMENT MODE: Using mock response for organization permissions update",
      );

      // Create mock results based on the request
      const mockResults = Object.entries(permissions).map(
        ([permissionName, allowed], index) => ({
          id: index + 1,
          organizationId: parseInt(organizationId),
          permissionName,
          allowed: Boolean(allowed),
          created_at: new Date(),
          updated_at: new Date(),
        }),
      );

      return NextResponse.json({
        organizationId,
        updatedPermissions: mockResults.length,
        permissions: mockResults,
      });
    }

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

      // If database error in development, provide mock data
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning mock data due to database error in development");

        const mockResults = Object.entries(permissions).map(
          ([permissionName, allowed], index) => ({
            id: index + 1,
            organizationId: parseInt(organizationId),
            permissionName,
            allowed: Boolean(allowed),
            created_at: new Date(),
            updated_at: new Date(),
          }),
        );

        return NextResponse.json({
          organizationId,
          updatedPermissions: mockResults.length,
          permissions: mockResults,
        });
      }

      // In production, throw the error to be caught by the outer catch
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
