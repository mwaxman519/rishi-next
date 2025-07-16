import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "../../../lib/auth-server";

/**
 * Get current authenticated user
 * @returns NextResponse with user data or error
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Return in the format expected by useAuth hook
    return NextResponse.json({
      authenticated: true,
      user: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Error getting user",
      },
      { status: 500 },
    );
  }
}
