import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return empty object for now - frontend expects this structure
    return NextResponse.json({});
  } catch (error) {
    console.error('User organization preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}