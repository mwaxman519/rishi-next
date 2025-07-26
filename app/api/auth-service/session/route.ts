import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH-SERVICE] Session request received');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('[AUTH-SERVICE] No authenticated user found');
      return NextResponse.json({ 
        authenticated: false,
        message: "No active session" 
      }, { status: 401 });
    }

    console.log('[AUTH-SERVICE] Valid session found for user:', user.username);
    
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
    console.error('[AUTH-SERVICE] Session check error:', error);
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

export async function PUT(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app",
    route: "auth-service/session", 
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(request?: NextRequest) {
  return NextResponse.json({
    message: "VoltBuilder build-time route - functionality available in deployed app",
    route: "auth-service/session",
    timestamp: new Date().toISOString()
  });
}
