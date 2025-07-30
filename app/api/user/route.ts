/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * User API Endpoint
 * Returns the current authenticated user's information
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;../../../lib/db-connection&quot;;
import { users } from &quot;@shared/schema&quot;;
import { cookies } from &quot;next/headers&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// Handler to get current user
export async function GET(request: NextRequest) {
  try {
    console.log(&quot;Getting current user info...&quot;);

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(&quot;session&quot;);

    if (!sessionCookie) {
      return NextResponse.json({ error: &quot;Not authenticated&quot; }, { status: 401 });
    }

    // Parse the session
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error(&quot;Failed to parse session cookie:&quot;, error);
      return NextResponse.json({ error: &quot;Invalid session&quot; }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: &quot;Invalid session&quot; }, { status: 401 });
    }

    // Find the user
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: &quot;User not found&quot; }, { status: 404 });
    }

    console.log(`Retrieved user info: ${user.username}`);

    // Return user info
    return NextResponse.json(user);
  } catch (error) {
    console.error(&quot;Error getting user info:&quot;, error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: &quot;Failed to get user info&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
