/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Logout API for Auth Microservice
 * 
 * Handles user logout and cookie clearing.
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { successResponse } from &quot;../utils/response&quot;;
import { AUTH_CONFIG } from &quot;../config&quot;;

/**
 * Handle POST /api/auth-service/logout
 * Logout a user and clear authentication cookie
 */
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;[Auth Service] Logout request received&quot;);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: &quot;Logged out successfully&quot;,
      service: &quot;auth-service&quot;,
      version: &quot;1.0.0&quot;,
    });

    // Clear both potential authentication cookies for complete logout
    response.cookies.set(AUTH_CONFIG.COOKIE_NAME, "&quot;, {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === &quot;production&quot;,
      sameSite: &quot;lax&quot;,
      path: &quot;/&quot;,
    });
    
    // Also clear the fallback cookie name for backward compatibility
    response.cookies.set(&quot;auth-token&quot;, &quot;&quot;, {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === &quot;production&quot;,
      sameSite: &quot;lax&quot;,
      path: &quot;/&quot;,
    });

    console.log(&quot;[Auth Service] Logout successful, cookie cleared&quot;);
    
    return response;
  } catch (error) {
    console.error(&quot;[Auth Service] Logout error:&quot;, error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: &quot;Logout failed&quot;,
        code: &quot;LOGOUT_ERROR&quot;,
      },
      service: &quot;auth-service&quot;,
      version: &quot;1.0.0",
    }, { status: 500 });
  }
}