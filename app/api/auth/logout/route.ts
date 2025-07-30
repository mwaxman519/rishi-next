import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { cookies } from &quot;next/headers&quot;;

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = cookies();
    
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: &quot;Logged out successfully&quot; 
    });

    // Clear the auth token cookie
    response.cookies.set(&quot;auth-token&quot;, "&quot;, {
      httpOnly: true,
      secure: process.env.NODE_ENV === &quot;production&quot;,
      sameSite: &quot;lax&quot;,
      maxAge: 0, // Expire immediately
      path: &quot;/&quot;,
    });

    return response;
  } catch (error) {
    console.error(&quot;Error during logout:&quot;, error);
    return NextResponse.json(
      { 
        success: false, 
        error: &quot;Failed to logout" 
      },
      { status: 500 }
    );
  }
}