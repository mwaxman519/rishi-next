import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { SignJWT } from "jose";
import { db } from "@db";
import { users, insertUserSchema } from "../../../lib/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Secret key for JWT signing - should be in env variables for production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key-change-in-production",
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate user data
    try {
      insertUserSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: "Invalid user data", details: validationError },
        { status: 400 },
      );
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
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
        { error: "Username already exists" },
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
        { error: "Email already in use" },
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
        firstName,
        lastName,
        role: "client_user", // Default role
        organizationId: organizationId,
      })
      .returning();

    // Create JWT token
    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    const token = await new SignJWT({
      sub: newUser.id.toString(),
      username: newUser.username,
      role: newUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set cookie with JWT (await is required in Next.js 15.2.2)
    const cookieStore = await cookies();
    await cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}

// Hash password with salt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return derivedKey.toString("hex") + "." + salt;
}
