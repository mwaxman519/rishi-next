/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Session API Endpoint for Auth Microservice
 *
 * This endpoint verifies user sessions and returns current user data.
 */
import { NextRequest } from &quot;next/server&quot;;
import { verifyToken, extractTokenFromHeader } from &quot;../../utils/jwt&quot;;
import { errorResponse, successResponse } from &quot;../../utils/response&quot;;
import {
  getUserById,
  getUserOrganizations,
} from &quot;../../models/user-repository&quot;;
import { AUTH_CONFIG } from &quot;../../config&quot;;

/**
 * Handle GET /api/auth-service/routes/session
 * Returns information about the current authenticated user session
 */
export async function GET(request: NextRequest) {
  try {
    console.log(&quot;[Auth Service] Session verification request&quot;);

    // Check for token in authorization header
    const authHeader = request.headers.get(&quot;authorization&quot;);
    const token = extractTokenFromHeader(authHeader);

    // Also check for token in cookies as a fallback
    const cookieToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    // Use either token source
    const accessToken = token || cookieToken;

    // Development mode option to bypass token for testing
    const urlParams = new URL(request.url).searchParams;
    const devModeParam = urlParams.get(&quot;dev_mode&quot;);

    // Handle development mode bypass if explicitly enabled
    if (AUTH_CONFIG.DEV_MODE && devModeParam === &quot;true&quot;) {
      console.log(&quot;[Auth Service] DEVELOPMENT MODE: Using mock user session&quot;);

      return successResponse({
        user: {
          id: &quot;00000000-0000-0000-0000-000000000001&quot;,
          email: &quot;admin@example.com&quot;,
          name: &quot;Admin User&quot;,
          role: &quot;super_admin&quot;,
          organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
          roles: [&quot;SUPER_ADMIN&quot;],
        },
      });
    }

    // No token available
    if (!accessToken) {
      console.log(&quot;[Auth Service] No session token found&quot;);
      return successResponse({ user: null });
    }

    try {
      // Verify the token
      const payload = await verifyToken(accessToken);

      // Get the complete user data
      if (!payload.sub) {
        return errorResponse(&quot;Invalid token: missing user ID&quot;, 401);
      }
      const user = await getUserById(payload.sub);

      if (!user) {
        console.log(
          `[Auth Service] User not found for token payload: ${payload.sub}`,
        );
        return successResponse({ user: null });
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;

      // Get user organizations
      const userOrgs = await getUserOrganizations(user.id);

      // Find default organization
      const defaultOrg = userOrgs.find((org: any) => org.isDefault) || userOrgs[0];

      // Return session information
      return successResponse({
        user: {
          ...userWithoutPassword,
          organizations: userOrgs,
          currentOrganization: defaultOrg,
        },
      });
    } catch (tokenError) {
      console.error(&quot;[Auth Service] Token validation error:&quot;, tokenError);
      return successResponse({ user: null });
    }
  } catch (error) {
    console.error(&quot;[Auth Service] Session verification error:&quot;, error);
    return errorResponse(&quot;Session error&quot;, 500, &quot;SESSION_ERROR&quot;);
  }
}
