/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Brands API Routes
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { db } from &quot;@/db&quot;;
import { brands, organizations, userOrganizations } from &quot;@/shared/schema&quot;;
import { eq, and, or, inArray } from &quot;drizzle-orm&quot;;

/**
 * GET /api/brands
 * Get all brands accessible by the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get(&quot;organizationId&quot;);

    let brandsQuery = db
      .select({
        id: brands.id,
        name: brands.name,
        description: brands.description,
        organizationId: brands.organizationId,
        organization: {
          id: organizations.id,
          name: organizations.name,
        },
      })
      .from(brands)
      .leftJoin(organizations, eq(brands.organizationId, organizations.id))
      .where(
        organizationId 
          ? and(eq(brands.active, true), eq(brands.organizationId, organizationId))
          : eq(brands.active, true)
      );

    // Apply role-based filtering
    if (user.role === &quot;super_admin&quot; || user.role === &quot;internal_admin&quot;) {
      // Super admins and internal admins can see all brands
    } else if (user.role === &quot;internal_field_manager&quot;) {
      // Internal field managers can see brands from organizations they have access to
      const userOrgs = await db
        .select({ organizationId: userOrganizations.organizationId })
        .from(userOrganizations)
        .where(eq(userOrganizations.userId, user.id));
      
      const orgIds = userOrgs.map(org => org.organizationId);
      if (orgIds.length > 0) {
        brandsQuery = brandsQuery.where(inArray(brands.organizationId, orgIds));
      } else {
        // No organizations, return empty result
        return NextResponse.json([]);
      }
    } else {
      // Brand agents and client users can only see brands from their organization
      const userOrgs = await db
        .select({ organizationId: userOrganizations.organizationId })
        .from(userOrganizations)
        .where(eq(userOrganizations.userId, user.id));
      
      const orgIds = userOrgs.map(org => org.organizationId);
      if (orgIds.length > 0) {
        brandsQuery = brandsQuery.where(inArray(brands.organizationId, orgIds));
      } else {
        // No organizations, return empty result
        return NextResponse.json([]);
      }
    }

    const brandsData = await brandsQuery;

    return NextResponse.json(brandsData);
  } catch (error) {
    console.error(&quot;Error fetching brands:&quot;, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : &quot;An unknown error occurred&quot;,
      },
      { status: 500 }
    );
  }
}