import { NextRequest, NextResponse } from 'next/server';

async function getCurrentUser() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    // Check for session cookies from login
    const sessionCookie = cookieStore.get("user-session") || cookieStore.get("user-session-backup");
    
    if (sessionCookie) {
      try {
        const userData = JSON.parse(sessionCookie.value);
        if (userData && userData.id) {
          return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            active: true,
            organizationId: userData.organizationId || "1",
            organizationName: userData.organizationName || "Default Organization"
          };
        }
      } catch (parseError) {
        console.error("[Auth Me] Session cookie parse error:", parseError);
      }
    }
    
    // For development, return mike user if no session found
    if (process.env.NODE_ENV === 'development') {
      return {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'mike',
        email: 'mike@rishiplatform.com',
        role: 'super_admin',
        active: true,
        organizationId: '00000000-0000-0000-0000-000000000001',
        organizationName: 'Rishi Management'
      };
    }
    
    return null;
  } catch (error) {
    console.error("[Auth Me] Error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Don't log - this is normal when user is not authenticated
      return NextResponse.json(
        { success: false, error: 'Not authenticated', user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        organizationId: user.organizationId || "1",
        organizationName: user.organizationName || "Default Organization"
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', user: null },
      { status: 500 }
    );
  }
}