import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // If no session, return null session response
    if (!session) {
      return NextResponse.json({
        user: null,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error(&quot;Session error:&quot;, error);
    return NextResponse.json({
      user: null,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

export const dynamic = &quot;force-dynamic&quot;;
