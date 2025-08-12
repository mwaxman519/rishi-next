/**
 * Server-side authentication utilities
 */

import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    
    // Check for session cookies from login
    const sessionCookie = cookieStore.get("user-session") || cookieStore.get("user-session-backup");
    
    if (sessionCookie) {
      try {
        const userData = JSON.parse(sessionCookie.value);
        if (userData && userData.id) {
          return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            active: true,
            organizationId: userData.organizationId,
            organizationName: userData.organizationName
          };
        }
      } catch (parseError) {
        console.error("[Auth Server] Session cookie parse error:", parseError);
      }
    }
    
    // Look for JWT token
    const authToken = cookieStore.get("auth_token");
    
    if (!authToken) {
      return null;
    }
    
    // Verify the token using JOSE library
    let payload;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return null;
      }
      
      const { jwtVerify } = await import("jose");
      const secretKey = new TextEncoder().encode(jwtSecret);
      const { payload: josePayload } = await jwtVerify(authToken.value, secretKey);
      payload = josePayload;
    } catch (error) {
      return null;
    }
    
    // JOSE uses 'sub' field for user ID, not 'id'
    const userId = payload.sub;
    if (!userId) {
      return null;
    }

    // Return user data from token payload
    const user = {
      id: userId,
      username: payload.username || payload.email?.split('@')[0] || 'user',
      email: payload.email || null,
      fullName: payload.fullName || null,
      role: payload.role || "brand_agent",
      active: true,
      organizationId: payload.organizationId || "1",
      organizationName: payload.organizationName || "Default Organization"
    };

    return user;
  } catch (error) {
    console.error("[Auth Server] Authentication error:", error);
    return null;
  }
}

// Alias for backward compatibility
export const getUser = getCurrentUser;
export const getAuthUser = getCurrentUser;
