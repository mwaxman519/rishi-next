/**
 * Server-side authentication utilities
 * Handles JWT tokens and user authentication on the server
 */

import { NextRequest } from "next/server";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "../shared/schema";

/**
 * Get current user from request
 */
export async function getCurrentUser(request?: NextRequest) {
  try {
    // Always use real database authentication - no mock data
    const token = request?.cookies.get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    // Verify JWT token and get user from database
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, username: string };
    
    // Get user from database
    const { db } = await import("@/lib/db");
    const { users } = await import("@/shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    
    return user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentAuthUser(request?: NextRequest) {
  return getCurrentUser(request);
}

/**
 * Validate request authentication
 */
export async function validateRequest(request: NextRequest) {
  const user = await getCurrentUser(request);
  return user ? { user } : null;
}

/**
 * Authentication options
 */
export const authOptions = {
  // Authentication configuration
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  session: {
    strategy: "jwt" as const,
  },
};

/**
 * Auth function for backwards compatibility
 */
export function auth() {
  return authOptions;
}

/**
 * Hash password utility
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

/**
 * Compare passwords utility
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}