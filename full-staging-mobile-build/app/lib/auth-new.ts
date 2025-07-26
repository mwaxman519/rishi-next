/**
 * Production authentication module
 * This provides real database authentication for production use
 */

import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// Get current user from JWT token in cookies
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    const decoded = verify(token, jwtSecret) as any;
    
    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.id));

    return user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Auth function that returns database session
export async function auth() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      name: user.fullName || user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      image: user.profileImage,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Function to get the current session with user information
export async function getSession() {
  return await auth();
}

// Function to check if a user is authenticated
export async function isAuthenticated() {
  const session = await auth();
  return session !== null;
}

// Get user function - used by API routes
export async function getUser() {
  return await getCurrentUser();
}

// Get user organizations from database
export async function getUserOrganizations(userId?: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const targetUserId = userId || user.id;
  
  // Get user organizations from database
  const userOrgs = await db
    .select({
      organizationId: schema.userOrganizations.organizationId,
      organization: schema.organizations,
    })
    .from(schema.userOrganizations)
    .leftJoin(schema.organizations, eq(schema.userOrganizations.organizationId, schema.organizations.id))
    .where(eq(schema.userOrganizations.userId, targetUserId));
    
  return userOrgs;
}

// Get JWT payload from token - used by RBAC system
export async function getJwtPayload(token?: string) {
  if (!token) return null;
  
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    
    const decoded = verify(token, jwtSecret) as any;
    return decoded;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
}
