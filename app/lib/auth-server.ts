/**
 * Server-side authentication utilities
 */

import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserById } from "@/api/auth-service/models/user-repository";

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function getUser() {
  // Development mode mock user
  return {
    id: "mock-user-id",
    email: "admin@rishi.com",
    firstName: "Admin",
    lastName: "User",
    role: "super_admin",
  };
}

export async function getCurrentUser() {
  try {
    // Get the auth token from cookies (check both cookie names for compatibility)
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth_token") || cookieStore.get("auth-token");
    
    if (!authToken) {
      console.log("[Auth] No auth token found in cookies");
      return null;
    }

    // Verify the token using the same method as login
    let payload;
    try {
      payload = jwt.verify(authToken.value, process.env.JWT_SECRET!) as { id: string, username: string };
    } catch (error) {
      console.log("[Auth] Invalid token:", error);
      return null;
    }
    
    if (!payload || !payload.id) {
      console.log("[Auth] Invalid token payload");
      return null;
    }

    // Get user from database (id is the user ID)
    const user = await getUserById(payload.id);
    
    if (!user) {
      console.log("[Auth] User not found for token");
      return null;
    }

    console.log("[Auth] User authenticated:", user.username, "role:", user.role);

    return {
      id: user.id,
      username: user.username,
      email: user.email || null,
      fullName: user.fullName || null,
      role: user.role || "brand_agent",
      active: Boolean(user.active !== false),
    };
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    return null;
  }
}

export async function getAuthUser() {
  // Development mode mock user for API routes
  return {
    id: "mock-user-id",
    email: "admin@rishi.com",
    firstName: "Admin",
    lastName: "User",
    role: "super_admin",
    username: "admin",
    fullName: "Super Admin",
    organizationId: "00000000-0000-0000-0000-000000000001",
  };
}
