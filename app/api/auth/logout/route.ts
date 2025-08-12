import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Logout request received');

    // Create response and clear the session cookie
    const response = NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });

    // Clear the session cookie
    response.cookies.set('user-session', '', {
      httpOnly: false,
      secure: false,
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
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