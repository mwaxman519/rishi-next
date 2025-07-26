import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH-SERVICE] Session request received');
    
    // Get current user session
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('[AUTH-SERVICE] No valid session found');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    console.log('[AUTH-SERVICE] Valid session found for user:', user.username);
    
    // Return user session data
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('[AUTH-SERVICE] Session error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
