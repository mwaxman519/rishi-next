/**

export const dynamic = "force-static";
export const revalidate = false;

 * Main API Route for Auth Microservice
 *
 * This is the entry point for the auth microservice that provides
 * information about the service and its capabilities.
 */
import { NextRequest } from "next/server";
import { successResponse } from "./utils/response";
import { AUTH_CONFIG } from "./config";
import { testConnection } from "./db";

/**
 * Handle GET /api/auth-service
 * Returns information about the auth microservice
 */
export async function GET(request: NextRequest) {
  console.log("[Auth Service] Service information request");

  // Test database connection only if not in VoltBuilder build
  let dbStatus = true;
  if (process.env.VOLTBUILDER_BUILD !== 'true') {
    dbStatus = await testConnection();
  } else {
    console.log("[Auth Service] Skipping database test for VoltBuilder build");
  }

  return successResponse({
    service: AUTH_CONFIG.SERVICE_NAME,
    version: AUTH_CONFIG.SERVICE_VERSION,
    status: "active",
    environment: process.env.NODE_ENV,
    database: dbStatus,
    endpoints: [
      {
        path: "/api/auth-service/routes/login",
        method: "POST",
        description: "Authenticate a user and get a session token",
      },
      {
        path: "/api/auth-service/routes/register",
        method: "POST",
        description: "Register a new user account",
      },
      {
        path: "/api/auth-service/routes/logout",
        method: "POST",
        description: "End a user session",
      },
      {
        path: "/api/auth-service/routes/session",
        method: "GET",
        description: "Get information about the current user session",
      },
    ],
  });
}
