import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { users } from &quot;@shared/schema&quot;;
import {
  hasEnhancedPermission,
  createPermissionContext,
} from &quot;@/lib/rbac-enhanced&quot;;
import { desc } from &quot;drizzle-orm&quot;;

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Only users with proper permissions can access all users
    if (!hasEnhancedPermission(&quot;view:users&quot;, authUser.role)) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    // Get users
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        createdAt: true,
        // Don't include password hash
      },
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error(&quot;Error fetching users:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch users&quot; },
      { status: 500 },
    );
  }
}
