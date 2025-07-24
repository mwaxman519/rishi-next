/**
 * Authentication Middleware for Auth Microservice
 *
 * This middleware verifies JWT tokens and provides authenticated user information.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { errorResponse } from "../utils/response";
import { AUTH_CONFIG } from "../config";

/**
 * Middleware to verify JWT token and extract user information
 *
 * @param req - Next.js request object
 * @returns The request with user information attached or an error response
 */
export async function authMiddleware(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // Check for token in authorization header
    const authHeader = req.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    // Also check for token in cookies as a fallback
    const cookieToken = req.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    // Use either token source
    const accessToken = token || cookieToken;

    if (!accessToken) {
      return errorResponse("Authentication required", 401, "UNAUTHORIZED");
    }

    try {
      // Verify the token and extract user information
      const payload = await verifyToken(accessToken);

      // Call the handler with the authenticated user
      return await handler(req, payload);
    } catch (tokenError) {
      console.error("[Auth Service] Token verification failed:", tokenError);
      return errorResponse("Invalid or expired token", 401, "INVALID_TOKEN");
    }
  } catch (error) {
    console.error("[Auth Service] Authentication middleware error:", error);
    return errorResponse("Authentication error", 500, "AUTH_ERROR");
  }
}

/**
 * Handler wrapper that applies authentication middleware
 *
 * @param handler - The route handler that requires authentication
 * @returns A wrapped handler with authentication
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    return authMiddleware(req, handler);
  };
}
