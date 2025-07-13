/**
 * Audit Log API
 *
 * Endpoint for retrieving audit logs with filtering and pagination.
 * Limited to users with appropriate permissions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAuditLogs } from "@/lib/audit-log";
import {
  hasPermission,
  getUserPrimaryOrganization,
} from "@/lib/permissions";
import { USER_ROLES } from "../../../shared/rbac/roles";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view audit logs
    // Only users with 'view:audit' permission can view audit logs
    const hasAuditAccess = await hasPermission(user.id, "read:users");
    if (!hasAuditAccess) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Organization filter (organization admins can only see their org's logs)
    let organizationId = searchParams.get("organizationId") || undefined;

    // Check if user can see logs across all organizations
    const canViewAllOrgs = await hasPermission(
      user.id,
      "read:organizations",
    );

    // Get the user's primary organization
    const userOrg = await getUserPrimaryOrganization(user.id);

    // If user can't see all orgs and we have their primary org, restrict to that organization
    if (!canViewAllOrgs && userOrg) {
      // Override any provided organizationId for users who don't have all-org access
      organizationId = userOrg.id;
    }

    // Other filters
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;
    const resourceId = searchParams.get("resourceId") || undefined;

    // Date range filters
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined;

    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined;

    // Pagination
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit") as string, 10)
      : 100;

    const offset = searchParams.has("offset")
      ? parseInt(searchParams.get("offset") as string, 10)
      : 0;

    // Get the logs
    const logs = await getAuditLogs({
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
      ...(action && { action }),
      ...(resource && { resource }),
      ...(resourceId && { resourceId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      limit,
      offset,
    });

    // Return the logs
    return NextResponse.json({
      logs,
      pagination: {
        limit,
        offset,
        hasMore: logs.length === limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving audit logs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve audit logs" },
      { status: 500 },
    );
  }
}
