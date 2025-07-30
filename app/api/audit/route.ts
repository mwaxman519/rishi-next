/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Audit Log API
 *
 * Endpoint for retrieving audit logs with filtering and pagination.
 * Limited to users with appropriate permissions.
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { getAuditLogs } from &quot;@/lib/audit-log&quot;;
import {
  hasPermission,
  getUserPrimaryOrganization,
} from &quot;@/lib/permissions&quot;;
import { USER_ROLES } from &quot;@shared/rbac/roles&quot;;

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to view audit logs
    // Only users with 'view:audit' permission can view audit logs
    const hasAuditAccess = await hasPermission(user.id, &quot;read:users&quot;);
    if (!hasAuditAccess) {
      return NextResponse.json(
        { error: &quot;Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Organization filter (organization admins can only see their org's logs)
    let organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined) || undefined;

    // Check if user can see logs across all organizations
    const canViewAllOrgs = await hasPermission(
      user.id,
      &quot;read:organizations&quot;,
    );

    // Get the user's primary organization
    const userOrg = await getUserPrimaryOrganization(user.id);

    // If user can&apos;t see all orgs and we have their primary org, restrict to that organization
    if (!canViewAllOrgs && userOrg) {
      // Override any provided organizationId for users who don&apos;t have all-org access
      organizationId = userOrg;
    }

    // Other filters
    const userId = (searchParams.get(&quot;userId&quot;) || undefined) || undefined;
    const action = (searchParams.get(&quot;action&quot;) || undefined) || undefined;
    const resource = (searchParams.get(&quot;resource&quot;) || undefined) || undefined;
    const resourceId = (searchParams.get(&quot;resourceId&quot;) || undefined) || undefined;

    // Date range filters
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined)
      ? new Date((searchParams.get(&quot;startDate&quot;) || undefined) as string)
      : undefined;

    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined)
      ? new Date((searchParams.get(&quot;endDate&quot;) || undefined) as string)
      : undefined;

    // Pagination
    const limit = searchParams.has(&quot;limit&quot;)
      ? parseInt((searchParams.get(&quot;limit&quot;) || undefined) as string, 10)
      : 100;

    const offset = searchParams.has(&quot;offset&quot;)
      ? parseInt((searchParams.get(&quot;offset&quot;) || undefined) as string, 10)
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
    console.error(&quot;Error retrieving audit logs:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve audit logs&quot; },
      { status: 500 },
    );
  }
}
