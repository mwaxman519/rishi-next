import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Organization Regions API
 *
 * This endpoint retrieves all regions for a specific organization.
 * The regions are filtered by the organization ID in the URL.
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  organizations,
  regions,
  organizationRegions,
} from &quot;@/shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const organizationId = parseInt(params.id, 10);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: &quot;Invalid organization ID&quot; },
        { status: 400 },
      );
    }

    // Removed mock data - using only real database queries

    // Check if the user has access to this organization
    const userOrg = await db.query.organizations.findFirst({
      where: (orgs, { and, eq }) =>
        and(eq(orgs.id, organizationId), eq(orgs.id, organizationId)),
      with: {
        organizationUsers: {
          where: (ou) => eq(ou.user_id, user.id),
        },
      },
    });

    if (!userOrg || userOrg.organizationUsers.length === 0) {
      return NextResponse.json(
        { error: &quot;Access denied to this organization&quot; },
        { status: 403 },
      );
    }

    // Fetch regions for this organization
    const organizationRegionsWithDetails = await db
      .select({
        id: regions.id,
        name: regions.name,
        code: regions.code,
        type: regions.type,
        is_primary: organizationRegions.is_primary,
      })
      .from(organizationRegions)
      .innerJoin(regions, eq(organizationRegions.region_id, regions.id))
      .where(eq(organizationRegions.organization_id, organizationId));

    return NextResponse.json({
      regions: organizationRegionsWithDetails,
    });
  } catch (error) {
    console.error(&quot;Error fetching organization regions:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organization regions&quot; },
      { status: 500 },
    );
  }
}
