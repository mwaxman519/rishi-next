import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Get current session
export async function GET(request: NextRequest) {
  try {
    console.log('[SESSION] GET - Session check requested');
    
    // For development - check stored session first
    const authorization = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    console.log('[SESSION] Headers:', {
      hasAuth: !!authorization,
      hasCookie: !!cookieHeader,
      origin: request.headers.get('origin')
    });

    // Try to get user from simple session storage (for Replit compatibility)
    if (cookieHeader?.includes('rishi-user=')) {
      const userMatch = cookieHeader.match(/rishi-user=([^;]+)/);
      if (userMatch && userMatch[1]) {
        try {
          const userData = JSON.parse(decodeURIComponent(userMatch[1]));
          console.log('[SESSION] Found stored user:', userData.username);
          return NextResponse.json(userData);
        } catch (e) {
          console.log('[SESSION] Invalid stored user data');
        }
      }
    }

    console.log('[SESSION] No valid session found');
    return NextResponse.json(null);
    
  } catch (error) {
    console.error('[SESSION] Error:', error);
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
  }
}

// Create new session (login)
export async function POST(request: NextRequest) {
  try {
    console.log('[SESSION] POST - Login attempt');
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Find user in database
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      console.log('[SESSION] User not found:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('[SESSION] Invalid password for user:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session data
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    console.log('[SESSION] Login successful for user:', username);

    // Return response with session cookie
    const response = NextResponse.json(sessionData);
    response.cookies.set('rishi-user', encodeURIComponent(JSON.stringify(sessionData)), {
      httpOnly: false, // Allow client access for Replit compatibility
      secure: false, // Allow HTTP for development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
    
  } catch (error) {
    console.error('[SESSION] Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// Delete session (logout)
export async function DELETE(request: NextRequest) {
  try {
    console.log('[SESSION] DELETE - Logout requested');
    
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('rishi-user');
    
    return response;
    
  } catch (error) {
    console.error('[SESSION] Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
