import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = cookies();
    
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

    // Clear the auth token cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to logout" 
      },
      { status: 500 }
    );
  }
}