/**
 * Session API Endpoint for Auth Microservice
 *
 * This endpoint verifies user sessions and returns current user data.
 */
import { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader } from "../../utils/jwt";
import { errorResponse, successResponse } from "../../utils/response";
import {
  getUserById,
  getUserOrganizations,
} from "../../models/user-repository";
import { AUTH_CONFIG } from "../../config";

/**
 * Handle GET /api/auth-service/routes/session
 * Returns information about the current authenticated user session
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Auth Service] Session verification request");

    // Check for token in authorization header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    // Also check for token in cookies as a fallback
    const cookieToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    // Use either token source
    const accessToken = token || cookieToken;

    // Development mode option to bypass token for testing
    const urlParams = new URL(request.url).searchParams;
    const devModeParam = urlParams.get("dev_mode");

    // Handle development mode bypass if explicitly enabled
    if (AUTH_CONFIG.DEV_MODE && devModeParam === "true") {
      console.log("[Auth Service] DEVELOPMENT MODE: Using mock user session");

      return successResponse({
        user: {
          id: "00000000-0000-0000-0000-000000000001",
          email: "admin@example.com",
          name: "Admin User",
          role: "super_admin",
          organizationId: "00000000-0000-0000-0000-000000000001",
          roles: ["SUPER_ADMIN"],
        },
      });
    }

    // No token available
    if (!accessToken) {
      console.log("[Auth Service] No session token found");
      return successResponse({ user: null });
    }

    try {
      // Verify the token
      const payload = await verifyToken(accessToken);

      // Get the complete user data
      if (!payload.sub) {
        return errorResponse("Invalid token: missing user ID", 401);
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
      console.error("[Auth Service] Token validation error:", tokenError);
      return successResponse({ user: null });
    }
  } catch (error) {
    console.error("[Auth Service] Session verification error:", error);
    return errorResponse("Session error", 500, "SESSION_ERROR");
  }
}
