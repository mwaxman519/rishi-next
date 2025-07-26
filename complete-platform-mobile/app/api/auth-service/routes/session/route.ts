import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: "No active session" 
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ 
      authenticated: false,
      error: "Session validation failed" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear session/logout
    const response = NextResponse.json({ 
      success: true, 
      message: "Session ended" 
    });
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json({ 
      error: "Failed to end session" 
    }, { status: 500 });
  }
}