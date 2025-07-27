import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { comparePasswords } from "@/lib/auth-server";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
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
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);
    
    if (!isValid) {
      console.log('Login: Password validation failed for username:', username);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
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
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}