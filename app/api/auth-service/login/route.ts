import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabaseConnection } from "../utils/db-connection";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH-LOGIN] Login request received');
    
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    console.log('[AUTH-LOGIN] Attempting login for user:', username);

    // Get database connection with error handling
    let db;
    try {
      db = getDatabaseConnection();
      console.log('[AUTH-LOGIN] Database connection established');
    } catch (dbError) {
      console.error('[AUTH-LOGIN] Database connection failed:', dbError);
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // Find user in database with error handling
    let user;
    try {
      const results = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      user = results[0];
    } catch (queryError) {
      console.error('[AUTH-LOGIN] Database query failed:', queryError);
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable" },
        { status: 503 }
      );
    }

    if (!user) {
      console.log('[AUTH-LOGIN] User not found:', username);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log('[AUTH-LOGIN] User found, checking password');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('[AUTH-LOGIN] Invalid password for user:', username);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log('[AUTH-LOGIN] Password valid, creating JWT');

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-dev-secret',
      { expiresIn: '7d' }
    );

    console.log('[AUTH-LOGIN] Login successful for user:', username);

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.active
      }
    });

    // Set auth cookie for JWT
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Allow in development
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Also set a simple user cookie for Replit compatibility
    response.cookies.set('rishi-user', encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.active
    })), {
      httpOnly: false, // Allow client access for Replit compatibility
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('[AUTH-LOGIN] Login error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}