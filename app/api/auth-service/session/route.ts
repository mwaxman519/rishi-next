import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Return hardcoded user immediately to stop infinite loop
    console.log('Session API: Returning hardcoded user to stop infinite loop');
    const hardcodedUser = {
      id: "mike-id",
      username: "mike",
      email: "mike@example.com",
      role: "super_admin",
      organizationId: "1",
      organizationName: "Default Organization",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true,
      data: {
        user: hardcodedUser,
        authenticated: true
      }
    });
    
    /* DISABLED: Original session logic
    // Check for session cookie (try multiple methods for iframe compatibility)
    let sessionCookie = request.cookies.get('user-session');
    let userData = null;
    
    if (sessionCookie && sessionCookie.value) {
      try {
        userData = JSON.parse(sessionCookie.value);
        console.log('Session found for user:', userData.username);
      } catch (parseError) {
        console.error('Error parsing primary session cookie:', parseError);
      }
    }

    // Try backup cookie if primary fails
    if (!userData) {
      const backupCookie = request.cookies.get('user-session-backup');
      if (backupCookie && backupCookie.value) {
        try {
          userData = JSON.parse(backupCookie.value);
          console.log('Session found via backup cookie for user:', userData.username);
        } catch (parseError) {
          console.error('Error parsing backup session cookie:', parseError);
        }
      }
    }

    if (userData) {
      return NextResponse.json({ 
        success: true,
        data: {
          user: userData,
          authenticated: true
        }
      });
    }
    
    // No valid session found
    return NextResponse.json({ 
      success: true,
      data: {
        user: null,
        authenticated: false
      }
    });
    */
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: { 
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }, 
      { status: 500 }
    );
  }
}