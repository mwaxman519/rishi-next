import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('user-session');
    
    if (sessionCookie && sessionCookie.value) {
      try {
        const userData = JSON.parse(sessionCookie.value);
        console.log('Session found for user:', userData.username);
        
        return NextResponse.json({ 
          success: true,
          data: {
            user: userData,
            authenticated: true
          }
        });
      } catch (parseError) {
        console.error('Error parsing session cookie:', parseError);
      }
    }
    
    // No valid session found
    return NextResponse.json({ 
      success: true,
      data: {
        user: null,
        authenticated: false
      }
    });
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