/**
 * JWT Utilities for Auth Microservice
 *
 * Functions for creating, validating, and working with JWT tokens.
 */
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { AUTH_CONFIG } from "../config";

// Create a secret key from the environment variable
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
};

/**
 * Create a JWT token for a user
 */
export async function createToken(id: string, expiresIn: string = "1d") {
  try {
    const alg = "HS256";
    const secretKey = getSecretKey();

    return await new SignJWT({ sub: id })
      .setProtectedHeader({ alg })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(secretKey);
  } catch (error) {
    console.error("Error creating JWT token:", error);
    throw new Error("Failed to create authentication token");
  }
}

/**
 * Verify a JWT token and return its payload
 */
export async function verifyToken(token: string) {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    throw new Error("Invalid or expired token");
  }
}

/**
 * Extract a token from the Authorization header
 * Expected format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader: string | null | undefined) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }

  return authHeader.split(" ")[1];
}
