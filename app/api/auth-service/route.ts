/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Main API Route for Auth Microservice
 *
 * This is the entry point for the auth microservice that provides
 * information about the service and its capabilities.
 */
import { NextRequest } from &quot;next/server&quot;;
import { successResponse } from &quot;./utils/response&quot;;
import { AUTH_CONFIG } from &quot;./config&quot;;
import { testConnection } from &quot;./db&quot;;

/**
 * Handle GET /api/auth-service
 * Returns information about the auth microservice
 */
export async function GET(request: NextRequest) {
  console.log(&quot;[Auth Service] Service information request&quot;);

  // Test database connection
  const dbStatus = await testConnection();

  return successResponse({
    service: AUTH_CONFIG.SERVICE_NAME,
    version: AUTH_CONFIG.SERVICE_VERSION,
    status: &quot;active&quot;,
    environment: process.env.NODE_ENV,
    database: dbStatus,
    endpoints: [
      {
        path: &quot;/api/auth-service/routes/login&quot;,
        method: &quot;POST&quot;,
        description: &quot;Authenticate a user and get a session token&quot;,
      },
      {
        path: &quot;/api/auth-service/routes/register&quot;,
        method: &quot;POST&quot;,
        description: &quot;Register a new user account&quot;,
      },
      {
        path: &quot;/api/auth-service/routes/logout&quot;,
        method: &quot;POST&quot;,
        description: &quot;End a user session&quot;,
      },
      {
        path: &quot;/api/auth-service/routes/session&quot;,
        method: &quot;GET&quot;,
        description: &quot;Get information about the current user session&quot;,
      },
    ],
  });
}
