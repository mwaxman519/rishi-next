/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Logout API for Auth Microservice
 *
 * Handles user logout by clearing authentication cookies.
 */
import { NextRequest } from &quot;next/server&quot;;
import {
  errorResponse,
  responseWithClearAuthCookie,
} from &quot;../../utils/response&quot;;
import { AUTH_CONFIG } from &quot;../../config&quot;;

/**
 * Handle POST /api/auth-service/routes/logout
 * End a user session
 */
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;[Auth Service] Logout request&quot;);

    // Development mode option
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      const devModeParam = urlParams.get(&quot;dev_mode&quot;);

      if (devModeParam === &quot;true&quot;) {
        console.log(
          &quot;[Auth Service] DEVELOPMENT MODE: Simulating successful logout&quot;,
        );

        return responseWithClearAuthCookie({
          message: &quot;Successfully logged out&quot;,
        });
      }
    }

    // For real logout, just clear the auth cookie
    return responseWithClearAuthCookie({
      message: &quot;Successfully logged out&quot;,
    });
  } catch (error) {
    console.error(&quot;[Auth Service] Logout error:&quot;, error);

    return errorResponse(
      &quot;Logout failed&quot;,
      500,
      &quot;SERVER_ERROR&quot;,
      process.env.NODE_ENV === &quot;development&quot; ? String(error) : undefined,
    );
  }
}
