import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for any session cookies or authentication state
    // For now, return no authenticated user to allow login flow
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