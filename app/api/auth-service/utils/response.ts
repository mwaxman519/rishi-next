/**
 * Standard response utilities for the auth microservice
 *
 * These functions ensure consistent response format across all auth service endpoints.
 */
import { NextResponse } from &quot;next/server&quot;;
import { AUTH_CONFIG } from &quot;../config&quot;;
import { cookies } from &quot;next/headers&quot;;

/**
 * Create a standard error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code: string = &quot;ERROR&quot;,
  details?: any,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );
}

/**
 * Create a standard success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );
}

/**
 * Create a success response with an auth token cookie
 */
export function responseWithAuthCookie(
  data: any,
  token: string,
  status: number = 200,
) {
  const response = NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );

  // Set the auth cookie
  // In staging/autoscale environment, we need secure cookies for HTTPS
  const isSecureEnvironment = process.env.NODE_ENV === &quot;production&quot; || 
                            process.env.REPLIT_DOMAINS?.includes(&quot;.replit.dev&quot;);
  
  const cookieOptions = {
    name: AUTH_CONFIG.COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecureEnvironment,
    maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
    path: &quot;/&quot;,
    sameSite: &quot;lax&quot; as const,
  };
  
  console.log(&quot;[Auth Service] Setting cookie:&quot;, cookieOptions.name, &quot;secure:&quot;, cookieOptions.secure, &quot;value length:&quot;, cookieOptions.value.length);
  response.cookies.set(cookieOptions);
  
  // Verify cookie was set
  const setCookieHeader = response.headers.get('set-cookie');
  console.log(&quot;[Auth Service] Set-Cookie header:&quot;, setCookieHeader ? &quot;present&quot; : &quot;missing&quot;);

  return response;
}

/**
 * Create a response that clears the auth cookie
 */
export function responseWithClearAuthCookie(data: any, status: number = 200) {
  const response = NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );

  // Clear the auth cookie
  // In staging/autoscale environment, we need secure cookies for HTTPS
  const isSecureEnvironment = process.env.NODE_ENV === &quot;production&quot; || 
                            process.env.REPLIT_DOMAINS?.includes(&quot;.replit.dev&quot;);
  
  response.cookies.set({
    name: AUTH_CONFIG.COOKIE_NAME,
    value: "&quot;,
    httpOnly: true,
    secure: isSecureEnvironment,
    maxAge: 0,
    path: &quot;/&quot;,
    sameSite: &quot;lax",
  });

  return response;
}
