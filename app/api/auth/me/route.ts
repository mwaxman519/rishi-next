
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for session cookies
    const userSession = request.cookies.get('user-session');
    const userSessionBackup = request.cookies.get('user-session-backup');
    
    if (userSession || userSessionBackup) {
      try {
        const sessionData = userSession?.value || userSessionBackup?.value;
        const userData = JSON.parse(sessionData || '{}');
        
        return NextResponse.json({
          success: true,
          user: userData
        });
      } catch (parseError) {
        console.error('Error parsing session data:', parseError);
      }
    }

    // No valid session found
    return NextResponse.json({
      success: false,
      error: 'No session found'
    }, { status: 401 });

  } catch (error) {
    console.error('Auth me API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
