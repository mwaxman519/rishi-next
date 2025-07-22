/**
 * Logout API for Auth Microservice
 * 
 * Handles user logout and cookie clearing.
 */
import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "../utils/response";
import { AUTH_CONFIG } from "../config";

/**
 * Handle POST /api/auth-service/logout
 * Logout a user and clear authentication cookie
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Auth Service] Logout request received");

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      service: "auth-service",
      version: "1.0.0",
    });

    // Clear both potential authentication cookies for complete logout
    response.cookies.set(AUTH_CONFIG.COOKIE_NAME, "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    
    // Also clear the fallback cookie name for backward compatibility
    response.cookies.set("auth-token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    console.log("[Auth Service] Logout successful, cookie cleared");
    
    return response;
  } catch (error) {
    console.error("[Auth Service] Logout error:", error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: "Logout failed",
        code: "LOGOUT_ERROR",
      },
      service: "auth-service",
      version: "1.0.0",
    }, { status: 500 });
  }
}