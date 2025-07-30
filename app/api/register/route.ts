/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Registration API Endpoint
 * Handles user registration with proper validation and error handling
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;../../../lib/db-connection&quot;;
import { users } from &quot;@shared/schema&quot;;
import { scrypt, randomBytes, timingSafeEqual } from &quot;crypto&quot;;
import { promisify } from &quot;util&quot;;
import { getEnvironment } from &quot;@/lib/db-connection&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// Convert scrypt to a promise-based function
const scryptAsync = promisify(scrypt);

// Function to hash passwords securely
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString(&quot;hex&quot;);
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString(&quot;hex&quot;)}.${salt}`;
}

// Registration handler
export async function POST(request: NextRequest) {
  try {
    console.log(&quot;Processing registration request...&quot;);

    // Parse the request body
    const body = await request.json();
    const {
      username,
      email,
      password,
      fullName,
      role,
      organizationOption,
    } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: &quot;Username and password are required&quot; },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: &quot;Username already exists&quot; },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Use fullName from request body or default to username

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        role: role || &quot;user&quot;,
        fullName: fullName || username,
        email: email || username, // Use email if provided, otherwise use username
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      });

    console.log(`User created successfully: ${newUser.username}`);

    // Return success response with user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(&quot;Error in registration process:&quot;, error);

    // Log detailed error information for debugging
    const env = getEnvironment();
    console.error(`Registration error in ${env} environment:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return appropriate error response
    return NextResponse.json(
      {
        error: &quot;Failed to register user&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
