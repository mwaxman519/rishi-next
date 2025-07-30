import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { and, eq } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { organizations } from &quot;@shared/schema&quot;;
import {
  hasEnhancedPermission,
  createPermissionContext,
} from &quot;@/lib/rbac-enhanced&quot;;

// GET /api/admin/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Only super_admin and internal_admin can access all organizations
    if (!hasEnhancedPermission(&quot;view:organizations&quot;, authUser.role)) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    // Get organizations
    const allOrganizations = await db.query.organizations.findMany({
      orderBy: (organizations, { desc }) => [desc(organizations.created_at)],
    });

    return NextResponse.json(allOrganizations);
  } catch (error) {
    console.error(&quot;Error fetching organizations:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organizations&quot; },
      { status: 500 },
    );
  }
}

// POST /api/admin/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Only super_admin and internal_admin can create organizations
    if (!hasEnhancedPermission(&quot;create:organizations&quot;, authUser.role)) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    // Get organization data from request body
    const data = await request.json();

    // Basic validation
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: &quot;Name and type are required&quot; },
        { status: 400 },
      );
    }

    // Check if organization already exists
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.name, data.name),
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: &quot;Organization with this name already exists&quot; },
        { status: 409 },
      );
    }

    // Create organization
    const result = await db
      .insert(organizations)
      .values({
        name: data.name,
        type: data.type,
        status: data.status || &quot;active&quot;,
        subscription_tier: data.subscription_tier,
        logo_url: data.logo_url,
      })
      .returning();

    const createdOrg = result[0];
    if (!createdOrg) {
      throw new Error('Failed to create organization - no result returned');
    }
    return NextResponse.json(createdOrg, { status: 201 });
  } catch (error) {
    console.error(&quot;Error creating organization:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create organization&quot; },
      { status: 500 },
    );
  }
}
