/**
 * JWT Utilities for Auth Microservice
 *
 * Functions for creating, validating, and working with JWT tokens.
 */
import { SignJWT, jwtVerify } from &quot;jose&quot;;
import { nanoid } from &quot;nanoid&quot;;
import { AUTH_CONFIG } from &quot;../config&quot;;

// Create a secret key from the environment variable
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(&quot;JWT_SECRET environment variable is required&quot;);
  }
  return new TextEncoder().encode(secret);
};

/**
 * Create a JWT token for a user
 */
export async function createToken(id: string, expiresIn: string = &quot;1d&quot;) {
  try {
    const alg = &quot;HS256&quot;;
    const secretKey = getSecretKey();

    return await new SignJWT({ sub: id })
      .setProtectedHeader({ alg })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(secretKey);
  } catch (error) {
    console.error(&quot;Error creating JWT token:&quot;, error);
    throw new Error(&quot;Failed to create authentication token&quot;);
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
    console.error(&quot;Error verifying JWT token:&quot;, error);
    throw new Error(&quot;Invalid or expired token&quot;);
  }
}

/**
 * Extract a token from the Authorization header
 * Expected format: &quot;Bearer <token>&quot;
 */
export function extractTokenFromHeader(authHeader: string | null | undefined) {
  if (!authHeader || !authHeader.startsWith(&quot;Bearer &quot;)) {
    return undefined;
  }

  return authHeader.split(&quot; &quot;)[1];
}
