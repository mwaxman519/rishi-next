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

export async function getCurrentUser() {
  console.log("[Auth Server] getCurrentUser function entry");
  try {
    console.log("[Auth Server] Starting cookie retrieval...");
    const cookieStore = cookies();
    console.log("[Auth Server] Cookie store created successfully");
    
    const allCookies = cookieStore.getAll();
    console.log("[Auth Server] All cookies:", allCookies.map(c => `${c.name}=${c.value.substring(0, 10)}...`));
    
    // Use the EXACT cookie name from AUTH_CONFIG
    const authToken = cookieStore.get("auth_token");
    
    console.log("[Auth Server] Looking for auth token in cookies...");
    console.log("[Auth Server] Available cookie names:", allCookies.map(c => c.name));
    console.log("[Auth Server] Auth token found:", !!authToken);
    console.log("[Auth Server] Auth token value length:", authToken?.value?.length || 0);
    
    if (!authToken) {
      console.log("[Auth Server] No auth token found in cookies - checking headers...");
      // Also check headers for authorization
      const headers = new Headers();
      try {
        const authHeader = headers.get('Authorization') || headers.get('authorization');
        console.log("[Auth Server] Authorization header:", !!authHeader);
      } catch (e) {
        console.log("[Auth Server] Cannot access headers:", e);
      }
      return null;
    }
    
    console.log("[Auth Server] Found auth token:", authToken.value.substring(0, 20) + "...");

    // Verify the token using the same method as auth service (JOSE library)
    let payload;
    try {
      // Use the same JWT secret as the auth service
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("[Auth Server] JWT_SECRET environment variable not set");
        return null;
      }
      console.log("[Auth Server] Using JWT secret for verification:", jwtSecret.substring(0, 10));
      
      // Use JOSE library for verification to match auth service
      const { jwtVerify } = await import("jose");
      const secretKey = new TextEncoder().encode(jwtSecret);
      const { payload: josePayload } = await jwtVerify(authToken.value, secretKey);
      payload = josePayload;
    } catch (error) {
      console.log("[Auth] Invalid token:", error);
      return null;
    }
    
    // JOSE uses 'sub' field for user ID, not 'id'
    const userId = payload.sub;
    if (!userId) {
      console.log("[Auth] Invalid token payload - no user ID");
      return null;
    }

    // Get user from database
    const user = await getUserById(userId);
    
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
    console.error("[Auth Server] Critical authentication error:", error);
    console.error("[Auth Server] Error stack:", (error as Error)?.stack);
    console.error("[Auth Server] Error type:", typeof error);
    return null;
  }
}

// Alias for backward compatibility
export const getUser = getCurrentUser;
export const getAuthUser = getCurrentUser;
