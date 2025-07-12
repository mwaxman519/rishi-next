/**
 * Session helper functions
 * Production implementation using database authentication
 */

import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Get the user from the session
 * Production implementation using JWT and database
 */
export async function getUserFromSession(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    
    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.id));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.fullName || user.username,
      email: user.email || "",
      role: user.role,
    };
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getUserFromSession()) !== null;
}

/**
 * Get current user (alias for getUserFromSession)
 */
export const currentUser = getUserFromSession;

/**
 * Get authenticated session (alias for getUserFromSession)
 */
export const getAuthSession = getUserFromSession;
