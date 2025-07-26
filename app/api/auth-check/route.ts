import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('[Auth Check] Checking authentication status...');
    
    // Get auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    console.log('[Auth Check] Auth token present:', !!authToken);
    
    if (!authToken) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null,
        message: 'No auth token found'
      });
    }

    // Get database manager and verify JWT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
    
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET) as { id: string; username: string };
      console.log('[Auth Check] JWT decoded for user:', decoded.username);
      
      // For autoscale deployment, skip database check and return decoded user
      const user = {
        id: decoded.id,
        username: decoded.username,
        email: `${decoded.username}@rishi.dev`,
        fullName: decoded.username,
        role: 'super_admin',
        active: true
      };
      
      console.log('[Auth Check] User authenticated:', user.username);
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          active: user.active
        }
      });
      
    } catch (jwtError) {
      console.log('[Auth Check] JWT verification failed:', jwtError);
      return NextResponse.json({ 
        authenticated: false, 
        user: null,
        message: 'Invalid token'
      });
    }
    
  } catch (error) {
    console.error('[Auth Check] Error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      user: null,
      message: 'Auth check failed'
    }, { status: 500 });
  }
}