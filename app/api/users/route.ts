import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[USERS] GET - Fetching users');
    
    const userList = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      organizationId: users.organizationId,
      createdAt: users.createdAt
    }).from(users);
    
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
    const { username, email, fullName, role, organizationId, passwordHash } = body;

    if (!username || !passwordHash) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const [newUser] = await db.insert(users).values({
      username,
      email,
      fullName: fullName || username,
      role: role || 'client_user',
      organizationId,
      passwordHash
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      organizationId: users.organizationId
    });

    console.log('[USERS] Created user:', newUser.username);
    return NextResponse.json(newUser);
    
  } catch (error) {
    console.error('[USERS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
