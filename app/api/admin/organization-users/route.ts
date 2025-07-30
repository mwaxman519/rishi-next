import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { and, eq } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { organizationUsers } from &quot;@shared/schema&quot;;
import {
  hasEnhancedPermission,
  createPermissionContext,
} from &quot;@/lib/rbac-enhanced&quot;;

// POST /api/admin/organization-users - Create new organization user association
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Only users with proper permissions can manage organization users
    if (!hasEnhancedPermission(&quot;manage:organization_users&quot;, authUser.role)) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    // Get data from request body
    const data = await request.json();

    // Basic validation
    if (!data.user_id || !data.organization_id || !data.role) {
      return NextResponse.json(
        { error: &quot;User ID, organization ID, and role are required&quot; },
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
    console.error(&quot;Error creating organization user association:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create organization user association&quot; },
      { status: 500 },
    );
  }
}
