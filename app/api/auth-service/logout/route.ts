import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH-LOGOUT] Logout request received');
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

    // Clear all auth cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0
    });

    response.cookies.set('rishi-user', '', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0
    });

    console.log('[AUTH-LOGOUT] Logout successful, cookies cleared');
    return response;

  } catch (error) {
    console.error('[AUTH-LOGOUT] Logout error:', error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}