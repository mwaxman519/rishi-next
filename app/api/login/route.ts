/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Login API Endpoint
 * Handles user authentication with secure password verification
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;../../../lib/db-connection&quot;;
import { users } from &quot;@shared/schema&quot;;
import { scrypt, timingSafeEqual } from &quot;crypto&quot;;
import { promisify } from &quot;util&quot;;
import { cookies } from &quot;next/headers&quot;;
import { getEnvironment } from &quot;@/lib/db-connection&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// Convert scrypt to a promise-based function
const scryptAsync = promisify(scrypt);

// Function to verify passwords
async function verifyPassword(
  supplied: string,
  stored: string,
): Promise<boolean> {
  try {
    // Split the stored hash and salt
    const [hashed, salt] = stored.split(&quot;.&quot;);

    // Hash the supplied password with the same salt
    const hashedBuf = Buffer.from(hashed, &quot;hex&quot;);
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    // Compare the hashes using a timing-safe comparison
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error(&quot;Error verifying password:&quot;, error);
    return false;
  }
}

// Login handler
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;Processing login request...&quot;);

    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: &quot;Username and password are required&quot; },
        { status: 400 },
      );
    }

    // Find the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: &quot;Invalid username or password&quot; },
        { status: 401 },
      );
    }

    // Verify the password
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: &quot;Invalid username or password&quot; },
        { status: 401 },
      );
    }

    // Create a session
    // For simplicity, we'll create a session cookie with the user ID
    // In a production app, you would use a proper session management system
    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      created: Date.now(),
    };

    // Set the session cookie
    const cookieStore = cookies();
    cookieStore.set(&quot;session&quot;, JSON.stringify(session), {
      httpOnly: true,
      secure: getEnvironment() !== &quot;development&quot;,
      sameSite: &quot;lax&quot;,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: &quot;/&quot;,
    });

    console.log(`User logged in successfully: ${user.username}`);

    // Return success response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error in login process:&quot;, error);

    // Log detailed error information for debugging
    const env = getEnvironment();
    console.error(`Login error in ${env} environment:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return appropriate error response
    return NextResponse.json(
      {
        error: &quot;Failed to authenticate user&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
