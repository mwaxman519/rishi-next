import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt for user:', username);

    // For development, allow specific test users
    if (username === 'mike' && password === 'wrench519') {
      const userData = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'mike',
        email: 'mike@rishiplatform.com',
        role: 'super_admin',
        roles: ['SUPER_ADMIN'],
        organizationId: '00000000-0000-0000-0000-000000000001',
        permissions: ['all']
      };

      return NextResponse.json({
        success: true,
        data: userData
      });
    }

    // Invalid credentials
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid username or password',
          details: 'Authentication failed'
        }
      },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}