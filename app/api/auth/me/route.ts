import { NextRequest, NextResponse } from 'next/server';

async function getCurrentUser() {
  // This is a placeholder function. In a real application,
  // this function would fetch the user from the database or session store
  // based on cookies or tokens.
  // For demonstration purposes, we'll simulate a user being found.
  // Replace this with your actual user retrieval logic.

  // Example: Mocking a user object
  // const mockUser = {
  //   id: 'user-123',
  //   username: 'testuser',
  //   email: 'test@example.com',
  //   role: 'admin',
  //   active: true,
  //   organizationId: 'org-abc',
  //   organizationName: 'Awesome Corp'
  // };
  // return mockUser;

  // If no user is found (simulating no session or invalid session)
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Don't log - this is normal when user is not authenticated
      return NextResponse.json(
        { success: false, error: 'Not authenticated', user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        organizationId: user.organizationId || "1",
        organizationName: user.organizationName || "Default Organization"
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', user: null },
      { status: 500 }
    );
  }
}