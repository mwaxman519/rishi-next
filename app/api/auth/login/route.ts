import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { eq } from "drizzle-orm";
import * as schema from "../../../../shared/schema";
import { comparePasswords } from "../../../lib/auth-server";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // In development, use mock authentication
    if (process.env.NODE_ENV === "development") {
      const mockUser = {
        id: "mock-user-id",
        username: "admin",
        email: "admin@rishi.com",
        fullName: "Super Admin",
        role: "super_admin",
        organizationId: "00000000-0000-0000-0000-000000000001",
      };

      // Create JWT token
      const token = sign(
        { id: mockUser.id, username: mockUser.username },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      const response = NextResponse.json({
        success: true,
        user: mockUser,
      });

      // Set cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      });

      return response;
    }

    // Production authentication
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.name,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}