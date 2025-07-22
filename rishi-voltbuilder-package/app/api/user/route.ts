/**
 * User API Endpoint
 * Returns the current authenticated user's information
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { users } from "@shared/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

// Handler to get current user
export async function GET(request: NextRequest) {
  try {
    console.log("Getting current user info...");

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse the session
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Failed to parse session cookie:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Find the user
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`Retrieved user info: ${user.username}`);

    // Return user info
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting user info:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to get user info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
