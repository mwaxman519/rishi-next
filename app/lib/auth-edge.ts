// This file contains only Edge-compatible auth functions for use in middleware
import { jwtVerify } from "./jose-wrapper";
import { cookies } from "next/headers";
import { UserRole } from "./schema";

// JWT verification for middleware - MUST use environment variable
if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET environment variable is not set. Authentication will fail.",
  );
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
})();

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName: string | undefined;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    // Add extra debugging
    console.log("Edge verifyJwt called with token length:", token.length);
    console.log("Edge JWT_SECRET length:", JWT_SECRET.length);

    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Edge JWT verification succeeded with payload:", payload);

    // Make sure we have the required fields
    if (!payload.id || !payload.username || !payload.role) {
      console.error("Invalid token payload:", payload);
      return null;
    }

    // Explicitly cast to our JwtPayload interface to ensure type safety
    return {
      id: Number(payload.id),
      username: String(payload.username),
      role: String(payload.role) as UserRole,
      fullName: payload.fullName ? String(payload.fullName) : undefined,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    // Edge runtime compatible error handling (no dynamic code evaluation)
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    return token?.value;
  } catch (error) {
    console.error("Failed to read auth token:", error);
    return undefined;
  }
}
