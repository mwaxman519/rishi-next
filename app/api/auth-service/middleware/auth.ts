/**
 * Authentication Middleware for Auth Microservice
 *
 * This middleware verifies JWT tokens and provides authenticated user information.
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { verifyToken, extractTokenFromHeader } from &quot;../utils/jwt&quot;;
import { errorResponse } from &quot;../utils/response&quot;;
import { AUTH_CONFIG } from &quot;../config&quot;;

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
    const authHeader = req.headers.get(&quot;authorization&quot;);
    const token = extractTokenFromHeader(authHeader);

    // Also check for token in cookies as a fallback
    const cookieToken = req.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    // Use either token source
    const accessToken = token || cookieToken;

    if (!accessToken) {
      return errorResponse(&quot;Authentication required&quot;, 401, &quot;UNAUTHORIZED&quot;);
    }

    try {
      // Verify the token and extract user information
      const payload = await verifyToken(accessToken);

      // Call the handler with the authenticated user
      return await handler(req, payload);
    } catch (tokenError) {
      console.error(&quot;[Auth Service] Token verification failed:&quot;, tokenError);
      return errorResponse(&quot;Invalid or expired token&quot;, 401, &quot;INVALID_TOKEN&quot;);
    }
  } catch (error) {
    console.error(&quot;[Auth Service] Authentication middleware error:&quot;, error);
    return errorResponse(&quot;Authentication error&quot;, 500, &quot;AUTH_ERROR&quot;);
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
