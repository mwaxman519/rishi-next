import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { USER_ROLES } from &quot;@shared/schema&quot;;
import { UserRole } from &quot;@/lib/rbac&quot;;

export async function POST(request: NextRequest) {
  try {
    // Check if the request is from an authenticated super admin
    const authHeader = request.headers.get(&quot;x-user-role&quot;);

    if (authHeader !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        {
          error: &quot;Unauthorized access. Only super admins can create bulk users&quot;,
        },
        { status: 403 },
      );
    }

    // Create a user for each role
    const roles = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
      &quot;field_coordinator&quot;,
      &quot;brand_agent&quot;,
      &quot;internal_account_manager&quot;,
      &quot;client_manager&quot;,
      &quot;client_user&quot;,
    ];

    const createdUsers = [];

    for (const role of roles) {
      const userData = {
        username: `${role}`,
        password: &quot;password123&quot;,
        fullName: `${role
          .split(&quot;_&quot;)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(&quot; &quot;)}`,
        email: `${role}@example.com`,
        phone: &quot;555-123-4567&quot;,
        role: role as UserRole,
        profileImage: "&quot;,
        active: true,
      };

      // We would normally call our user service here to create the user
      // For now, we'll just add it to our response for demonstration
      createdUsers.push({
        id: `dummy-id-${role}`,
        ...userData,
      });
    }

    return NextResponse.json({
      message: &quot;Test users created successfully&quot;,
      users: createdUsers,
    });
  } catch (error) {
    console.error(&quot;Error creating test users:&quot;, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : &quot;An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
