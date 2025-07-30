/**
 * Authentication Utilities
 * Provides helper functions for authentication in API endpoints
 */

import { NextRequest } from &quot;next/server&quot;;
import { getUserById } from &quot;../models/user-repository&quot;;
import { verifyToken } from &quot;./jwt&quot;;

/**
 * Get current user from request
 * @param req NextRequest object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get(&quot;Authorization&quot;);
    let token: string | null = null;

    if (authHeader && authHeader.startsWith(&quot;Bearer &quot;)) {
      token = authHeader.substring(7);
    } else {
      // Check for token in cookies
      const cookies = req.cookies;
      token = cookies.get(&quot;auth_token&quot;)?.value || null;
    }

    if (!token) {
      return null;
    }

    // Verify the JWT token
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return null;
    }

    // Get user from database
    const user = await getUserById(payload.sub as string);
    return user;
  } catch (error) {
    console.error(&quot;Error getting current user:&quot;, error);
    return null;
  }
}

/**
 * Check if user has required permission
 * @param user User object
 * @param requiredRole Role required for access
 * @returns boolean
 */
export function hasRequiredRole(user: any, requiredRole: string): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Define role hierarchy
  const roleHierarchy = {
    super_admin: 100,
    internal_admin: 80,
    internal_field_manager: 60,
    brand_agent: 40,
    client_manager: 30,
    client_user: 20,
  };

  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userRoleLevel >= requiredRoleLevel;
}