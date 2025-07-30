import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;../../../../lib/db-connection&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import * as schema from &quot;@shared/schema&quot;;
import { comparePasswords } from &quot;@/lib/auth-server&quot;;
import { sign } from &quot;jsonwebtoken&quot;;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: &quot;Username and password are required&quot; },
        { status: 400 }
      );
    }

    // Use real database authentication for both development and production

    // Production authentication
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user || !user.password) {
      console.log('Login: User not found or no password for username:', username);
      return NextResponse.json(
        { success: false, error: &quot;Invalid credentials&quot; },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);
    
    if (!isValid) {
      console.log('Login: Password validation failed for username:', username);
      return NextResponse.json(
        { success: false, error: &quot;Invalid credentials&quot; },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: &quot;24h&quot; }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set(&quot;auth-token&quot;, token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === &quot;production&quot;,
      sameSite: &quot;lax&quot;,
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error(&quot;Login error:&quot;, error);
    return NextResponse.json(
      { success: false, error: &quot;Internal server error&quot; },
      { status: 500 }
    );
  }
}