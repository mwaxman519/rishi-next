/**
 * Login API Endpoint
 * Handles user authentication with secure password verification
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { users } from "@shared/schema";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { getEnvironment } from "@/lib/db-connection";
import { eq } from "drizzle-orm";

// Convert scrypt to a promise-based function
const scryptAsync = promisify(scrypt);

// Function to verify passwords
async function verifyPassword(
  supplied: string,
  stored: string,
): Promise<boolean> {
  try {
    // Split the stored hash and salt
    const [hashed, salt] = stored.split(".");

    // Hash the supplied password with the same salt
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    // Compare the hashes using a timing-safe comparison
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

// Login handler
export async function POST(request: NextRequest) {
  try {
    console.log("Processing login request...");

    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
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
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Verify the password
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
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
    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: getEnvironment() !== "development",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
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
    console.error("Error in login process:", error);

    // Log detailed error information for debugging
    const env = getEnvironment();
    console.error(`Login error in ${env} environment:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to authenticate user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
