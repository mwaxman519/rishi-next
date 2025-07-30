import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { cookies } from &quot;next/headers&quot;;
import { scrypt, randomBytes } from &quot;crypto&quot;;
import { promisify } from &quot;util&quot;;
import { SignJWT } from &quot;jose&quot;;
import { db } from &quot;../../../../lib/db-connection&quot;;
import { users, insertUserSchema } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;

const scryptAsync = promisify(scrypt);

// Secret key for JWT signing - should be in env variables for production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate user data
    try {
      insertUserSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: &quot;Invalid user data&quot;, details: validationError },
        { status: 400 },
      );
    }

    const {
      username,
      email,
      password,
      fullName,
      organizationId = 1,
    } = body;

    // Check if username already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: &quot;Username already exists&quot; },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: &quot;Email already in use&quot; },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        fullName: fullName || username,
        role: &quot;client_user&quot;, // Default role
      })
      .returning();

    // Create JWT token
    if (!newUser) {
      return NextResponse.json(
        { error: &quot;Failed to create user&quot; },
        { status: 500 },
      );
    }

    const token = await new SignJWT({
      sub: newUser.id.toString(),
      username: newUser.username,
      role: newUser.role,
    })
      .setProtectedHeader({ alg: &quot;HS256&quot; })
      .setIssuedAt()
      .setExpirationTime(&quot;24h&quot;)
      .sign(JWT_SECRET);

    // Set cookie with JWT (await is required in Next.js 15.2.2)
    const cookieStore = await cookies();
    await cookieStore.set(&quot;auth-token&quot;, token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === &quot;production&quot;,
      maxAge: 60 * 60 * 24, // 1 day
      path: &quot;/&quot;,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error(&quot;Registration error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to register user&quot; },
      { status: 500 },
    );
  }
}

// Hash password with salt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString(&quot;hex&quot;);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return derivedKey.toString(&quot;hex&quot;) + &quot;.&quot; + salt;
}
