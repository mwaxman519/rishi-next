
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[Auth Service Session] Getting current user...');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('[Auth Service Session] No user found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          user: null 
        },
        { status: 401 }
      );
    }

    console.log('[Auth Service Session] User found:', user.username);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });

  } catch (error) {
    console.error('[Auth Service Session] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        user: null 
      },
      { status: 500 }
    );
  }
}
