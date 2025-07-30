import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { verifyToken } from &quot;../../auth-service/utils/jwt&quot;;
import { AUTH_CONFIG } from &quot;../../auth-service/config&quot;;
import { getUserById } from &quot;../../auth-service/models/user-repository&quot;;

/**
 * GET /api/auth/permissions
 * Get permissions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    console.log(&quot;[Auth Permissions] Permission check request received&quot;);

    // Get the auth token from cookies
    const authToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME);
    
    if (!authToken) {
      console.log(&quot;[Auth Permissions] No auth token found&quot;);
      return NextResponse.json(
        { error: &quot;Authentication required&quot; },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await verifyToken(authToken.value);
    
    if (!payload || !payload.sub) {
      console.log(&quot;[Auth Permissions] Invalid token&quot;);
      return NextResponse.json(
        { error: &quot;Invalid authentication token&quot; },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(payload.sub as string);
    
    if (!user) {
      console.log(&quot;[Auth Permissions] User not found&quot;);
      return NextResponse.json(
        { error: &quot;User not found&quot; },
        { status: 401 }
      );
    }

    // Get organization ID from query params
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get('organizationId') || undefined) || undefined;

    // For super_admin, return all permissions
    if (user.role === 'super_admin') {
      const superAdminPermissions = [
        'manage:organizations',
        'manage:users', 
        'manage:roles',
        'manage:permissions',
        'manage:bookings',
        'update:locations',
        'manage:reports',
        'manage:system',
        'view:all',
        'edit:all',
        'delete:all',
        'admin:all'
      ];

      console.log(&quot;[Auth Permissions] Returning super_admin permissions&quot;);
      return NextResponse.json({
        permissions: superAdminPermissions,
        role: user.role,
        organizationId: organizationId || &quot;ec83b1b1-af6e-4465-806e-8d51a1449e86&quot;
      });
    }

    // For other roles, return role-specific permissions
    const rolePermissions = getRolePermissions(user.role || 'brand_agent');
    
    console.log(&quot;[Auth Permissions] Returning permissions for role:&quot;, user.role);
    return NextResponse.json({
      permissions: rolePermissions,
      role: user.role,
      organizationId: organizationId || &quot;ec83b1b1-af6e-4465-806e-8d51a1449e86&quot;
    });

  } catch (error) {
    console.error(&quot;[Auth Permissions] Error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 }
    );
  }
}

/**
 * Get permissions for a specific role
 */
function getRolePermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    'super_admin': [
      'manage:organizations',
      'manage:users',
      'manage:roles', 
      'manage:permissions',
      'manage:bookings',
      'update:locations',
      'manage:reports',
      'manage:system',
      'view:all',
      'edit:all',
      'delete:all',
      'admin:all'
    ],
    'internal_admin': [
      'manage:users',
      'manage:bookings',
      'update:locations',
      'view:reports',
      'edit:organization',
      'view:all'
    ],
    'internal_field_manager': [
      'manage:bookings',
      'update:locations',
      'view:reports',
      'edit:assigned',
      'view:assigned'
    ],
    'brand_agent': [
      'view:bookings',
      'view:locations',
      'edit:owned',
      'view:owned'
    ],
    'client_manager': [
      'manage:bookings',
      'view:reports',
      'manage:team',
      'edit:organization',
      'view:organization'
    ],
    'client_user': [
      'view:bookings',
      'view:reports',
      'view:organization'
    ]
  };

  return permissions[role] || permissions['brand_agent'] || [];
}