// This file contains only Edge-compatible auth functions for use in middleware
import { jwtVerify } from &quot;./jose-wrapper&quot;;
import { cookies } from &quot;next/headers&quot;;
import { UserRole } from &quot;./schema&quot;;

// JWT verification for middleware - MUST use environment variable
if (!process.env.JWT_SECRET) {
  console.error(
    &quot;JWT_SECRET environment variable is not set. Authentication will fail.&quot;,
  );
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(&quot;JWT_SECRET environment variable is required&quot;);
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
    console.log(&quot;Edge verifyJwt called with token length:&quot;, token.length);
    console.log(&quot;Edge JWT_SECRET length:&quot;, JWT_SECRET.length);

    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log(&quot;Edge JWT verification succeeded with payload:&quot;, payload);

    // Make sure we have the required fields
    if (!payload.id || !payload.username || !payload.role) {
      console.error(&quot;Invalid token payload:&quot;, payload);
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
    console.error(&quot;JWT verification failed:&quot;, error);
    // Edge runtime compatible error handling (no dynamic code evaluation)
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(&quot;token&quot;);
    return token?.value;
  } catch (error) {
    console.error(&quot;Failed to read auth token:&quot;, error);
    return undefined;
  }
}
