import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentUser } from &quot;@/lib/auth-server&quot;;

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.active,
    });
  } catch (error) {
    console.error(&quot;Error fetching user:&quot;, error);
    return NextResponse.json({ error: &quot;Internal server error&quot; }, { status: 500 });
  }
}