import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "../utils/response";
import { verifyToken } from "../utils/jwt";
import { AUTH_CONFIG } from "../config";
import { getUserById } from "../models/user-repository";

/**
 * GET /api/auth-service/session
 * Get current session information
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Auth Service] Session request received");

    // Get the auth token from cookies
    const authToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME);
    
    if (!authToken) {
      console.log("[Auth Service] No auth token found in cookies");
      return successResponse({ user: null }, 200);
    }

    // Verify the token
    const payload = await verifyToken(authToken.value);
    
    if (!payload || !payload.sub) {
      console.log("[Auth Service] Invalid token");
      return successResponse({ user: null }, 200);
    }

    // Get user from database (sub is the user ID)
    const user = await getUserById(payload.sub as string);
    
    if (!user) {
      console.log("[Auth Service] User not found for token");
      return successResponse({ user: null }, 200);
    }

    // Create session user object (similar to login endpoint)
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email || null,
      fullName: user.fullName || user.name || user.name || null,
      role: user.role || "brand_agent",
      active: Boolean(user.active !== false),
      organizations: [
        {
          orgId: "ec83b1b1-af6e-4465-806e-8d51a1449e86",
          orgName: "Rishi Internal",
          orgType: "internal",
          role: user.role,
          isPrimary: true,
        },
      ],
      currentOrganization: {
        orgId: "ec83b1b1-af6e-4465-806e-8d51a1449e86",
        orgName: "Rishi Internal",
        orgType: "internal",
        role: user.role,
        isPrimary: true,
      },
    };

    console.log("[Auth Service] Session found for user:", user.username, "role:", user.role);

    return successResponse({ user: sessionUser }, 200);
  } catch (error) {
    console.error("[Auth Service] Session check error:", error);
    return successResponse({ user: null }, 200);
  }
}