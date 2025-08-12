import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { successResponse, errorResponse } from "../utils/response";
import { AUTH_CONFIG } from "../config";
import { getUserById } from "../models/user-repository";
import * as jwt from "jsonwebtoken";

/**
 * GET /api/auth-service/session
 * Get current session information
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Auth Service] Session request received");

    // Get the auth token from cookies (check both cookie names for compatibility)
    const authToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME) || request.cookies.get("auth-token");
    
    if (!authToken) {
      console.log("[Auth Service] No auth token found in cookies");
      return successResponse({ user: null }, 200);
    }

    // Verify the token using the same method as login
    let payload;
    try {
      payload = jwt.verify(authToken.value, process.env.JWT_SECRET!) as { id: string, username: string };
    } catch (error) {
      console.log("[Auth Service] Invalid token:", error);
      return successResponse({ user: null }, 200);
    }
    
    if (!payload || !payload.id) {
      console.log("[Auth Service] Invalid token payload");
      return successResponse({ user: null }, 200);
    }

    // Get user from database (id is the user ID)
    const user = await getUserById(payload.id);
    
    if (!user) {
      console.log("[Auth Service] User not found for token");
      return successResponse({ user: null }, 200);
    }

    // Create session user object (similar to login endpoint)
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email || null,
      fullName: user.fullName || null,
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