/**
 * Logout API for Auth Microservice
 *
 * Handles user logout by clearing authentication cookies.
 */
import { NextRequest } from "next/server";
import {
  errorResponse,
  responseWithClearAuthCookie,
} from "../../utils/response";
import { AUTH_CONFIG } from "../../config";

/**
 * Handle POST /api/auth-service/routes/logout
 * End a user session
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Auth Service] Logout request");

    // Development mode option
    if (AUTH_CONFIG.DEV_MODE) {
      const urlParams = new URL(request.url).searchParams;
      const devModeParam = urlParams.get("dev_mode");

      if (devModeParam === "true") {
        console.log(
          "[Auth Service] DEVELOPMENT MODE: Simulating successful logout",
        );

        return responseWithClearAuthCookie({
          message: "Successfully logged out",
        });
      }
    }

    // For real logout, just clear the auth cookie
    return responseWithClearAuthCookie({
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("[Auth Service] Logout error:", error);

    return errorResponse(
      "Logout failed",
      500,
      "SERVER_ERROR",
      process.env.NODE_ENV === "development" ? String(error) : undefined,
    );
  }
}
