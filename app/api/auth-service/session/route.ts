import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return a basic response that the frontend expects
    // TODO: Implement proper session validation when Express server is fixed
    return NextResponse.json({ 
      success: false, 
      user: null,
      authenticated: false 
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}