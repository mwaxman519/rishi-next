/**
 * Logout API Endpoint
 * Handles user logout by clearing session cookies
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Logout handler
export async function POST(request: NextRequest) {
  try {
    console.log("Processing logout request...");

    // Clear the session cookie
    const cookieStore = cookies();
    cookieStore.delete("session");

    console.log("User logged out successfully");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in logout process:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to logout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
