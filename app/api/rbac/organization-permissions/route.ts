import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { organizationPermissions } from &quot;@shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth-utils&quot;;
import { hasPermission } from &quot;@/lib/rbac&quot;;

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
    console.log(&quot;Organization permissions endpoint called&quot;);

    // Get user from authentication system
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined) || undefined;
    const permissions = (searchParams.get(&quot;permissions&quot;) || undefined)?.split(&quot;,&quot;) || [];

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
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
          { error: &quot;You do not have access to this organization&quot; },
          { status: 403 },
        );
      }

      // Get organization details
      const organization = userOrganization.organization;
      const organizationType = organization.type;
      const organizationTier = (organization.tier || &quot;tier_1&quot;) || &quot;tier_1&quot;;

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
          // Check if there&apos;s an explicit organization permission override
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
      console.error(&quot;Database error in organization permissions:&quot;, dbError);

      // Throw database error instead of returning mock data
      throw dbError;
    }
  } catch (error) {
    console.error(&quot;Error fetching organization permissions:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
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
    console.log(&quot;Organization permissions POST endpoint called&quot;);

    // Get user from authentication system
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, permissions } = body;

    if (!organizationId || !permissions || typeof permissions !== &quot;object&quot;) {
      return NextResponse.json(
        { error: &quot;Invalid request body&quot; },
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
        user.role === &quot;super_admin&quot; ||
        user.role === &quot;internal_admin&quot; ||
        (userOrganization &&
          (userOrganization.role === &quot;client_manager&quot; ||
            userOrganization.role === &quot;internal_field_manager&quot;));

      if (!hasAdminAccess) {
        return NextResponse.json(
          {
            error:
              &quot;You do not have permission to modify organization permissions&quot;,
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
        &quot;Database error in organization permissions update:&quot;,
        dbError,
      );

      // Throw database error instead of returning mock data
      throw dbError;
    }
  } catch (error) {
    console.error(&quot;Error updating organization permissions:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}
