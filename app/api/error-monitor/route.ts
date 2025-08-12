import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;


// Production error monitoring endpoint
export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // Log production errors for debugging
    console.error('PRODUCTION ERROR:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      error: errorData
    });
    
    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('Error monitor failed:', error);
    return NextResponse.json({ error: 'Monitor failed' }, { status: 500 });
  }
}