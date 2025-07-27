import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[USERS] GET - Fetching users');
    
    const userList = await db.select().from(users);
    
    console.log(`[USERS] Found ${userList.length} users`);
    return NextResponse.json(userList);
    
  } catch (error) {
    console.error('[USERS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[USERS] POST - Creating user');
    
    const body = await request.json();
    const { email, fullName, role, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const [newUser] = await db.insert(users).values({
      username: email, // Use email as username for now
      email,
      fullName: fullName || email,
      role: role || 'client_user',
      password
    }).returning();

    if (!newUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    console.log('[USERS] Created user:', newUser.username);
    return NextResponse.json(newUser);
    
  } catch (error) {
    console.error('[USERS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
