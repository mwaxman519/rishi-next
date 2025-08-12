import { NextRequest, NextResponse } from 'next/server';

// Simple hardcoded users for testing
const users = [
  {
    id: 'mike-id',
    username: 'mike',
    password: 'password123', // In production, this would be hashed
    email: 'mike@example.com',
    fullName: 'Mike User',
    role: 'super_admin'
  },
  {
    id: 'admin-id',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'super_admin'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}