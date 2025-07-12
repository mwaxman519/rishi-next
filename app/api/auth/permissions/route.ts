import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../auth-service/utils/jwt";
import { AUTH_CONFIG } from "../../auth-service/config";
import { getUserById } from "../../auth-service/models/user-repository";

/**
 * GET /api/auth/permissions
 * Get permissions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Auth Permissions] Permission check request received");

    // Get the auth token from cookies
    const authToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME);
    
    if (!authToken) {
      console.log("[Auth Permissions] No auth token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await verifyToken(authToken.value);
    
    if (!payload || !payload.sub) {
      console.log("[Auth Permissions] Invalid token");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(payload.sub as string);
    
    if (!user) {
      console.log("[Auth Permissions] User not found");
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Get organization ID from query params
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || undefined;

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

      console.log("[Auth Permissions] Returning super_admin permissions");
      return NextResponse.json({
        permissions: superAdminPermissions,
        role: user.role,
        organizationId: organizationId || "ec83b1b1-af6e-4465-806e-8d51a1449e86"
      });
    }

    // For other roles, return role-specific permissions
    const rolePermissions = getRolePermissions(user.role || 'brand_agent');
    
    console.log("[Auth Permissions] Returning permissions for role:", user.role);
    return NextResponse.json({
      permissions: rolePermissions,
      role: user.role,
      organizationId: organizationId || "ec83b1b1-af6e-4465-806e-8d51a1449e86"
    });

  } catch (error) {
    console.error("[Auth Permissions] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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