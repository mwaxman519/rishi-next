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
    // For development, return a mock user
    if (process.env.NODE_ENV === "development") {
      return {
        id: "dev-user-1",
        username: "dev-user",
        email: "dev@example.com",
        role: "super_admin" as const,
        fullName: "Development User",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // In production, implement proper JWT token validation
    return null;
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
  // For development, return a mock hash
  if (process.env.NODE_ENV === 'development') {
    return `hashed_${password}`;
  }
  
  // In production, use proper bcrypt hashing
  return password;
}

/**
 * Compare passwords utility
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  // For development, simple comparison
  if (process.env.NODE_ENV === 'development') {
    return hashedPassword === `hashed_${password}`;
  }
  
  // In production, use proper bcrypt comparison
  return password === hashedPassword;
}