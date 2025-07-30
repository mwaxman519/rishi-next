/**
 * Server-side authentication utilities
 */

import bcrypt from &quot;bcryptjs&quot;;
import * as jwt from &quot;jsonwebtoken&quot;;
import { cookies } from &quot;next/headers&quot;;
import { getUserById } from &quot;@/api/auth-service/models/user-repository&quot;;

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
  console.log(&quot;[Auth Server] getCurrentUser function entry&quot;);
  try {
    console.log(&quot;[Auth Server] Starting cookie retrieval...&quot;);
    const cookieStore = cookies();
    console.log(&quot;[Auth Server] Cookie store created successfully&quot;);
    
    const allCookies = cookieStore.getAll();
    console.log(&quot;[Auth Server] All cookies:&quot;, allCookies.map(c => `${c.name}=${c.value.substring(0, 10)}...`));
    
    // Use the EXACT cookie name from AUTH_CONFIG
    const authToken = cookieStore.get(&quot;auth_token&quot;);
    
    console.log(&quot;[Auth Server] Looking for auth token in cookies...&quot;);
    console.log(&quot;[Auth Server] Available cookie names:&quot;, allCookies.map(c => c.name));
    console.log(&quot;[Auth Server] Auth token found:&quot;, !!authToken);
    console.log(&quot;[Auth Server] Auth token value length:&quot;, authToken?.value?.length || 0);
    
    // Debug: Try different cookie access methods
    if (!authToken) {
      console.log(&quot;[Auth Server] Trying alternative cookie access...&quot;);
      try {
        const { cookies: nextCookies } = await import(&quot;next/headers&quot;);
        const cookieStore2 = nextCookies();
        const authToken2 = cookieStore2.get(&quot;auth_token&quot;);
        console.log(&quot;[Auth Server] Alternative method found token:&quot;, !!authToken2);
      } catch (e) {
        console.log(&quot;[Auth Server] Alternative method failed:&quot;, e);
      }
    }
    
    if (!authToken) {
      console.log(&quot;[Auth Server] No auth token found in cookies - checking headers...&quot;);
      // Also check headers for authorization
      const headers = new Headers();
      try {
        const authHeader = headers.get('Authorization') || headers.get('authorization');
        console.log(&quot;[Auth Server] Authorization header:&quot;, !!authHeader);
      } catch (e) {
        console.log(&quot;[Auth Server] Cannot access headers:&quot;, e);
      }
      return null;
    }
    
    console.log(&quot;[Auth Server] Found auth token:&quot;, authToken.value.substring(0, 20) + &quot;...&quot;);

    // Verify the token using the same method as auth service (JOSE library)
    let payload;
    try {
      // Use the same JWT secret as the auth service
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error(&quot;[Auth Server] JWT_SECRET environment variable not set&quot;);
        return null;
      }
      console.log(&quot;[Auth Server] Using JWT secret for verification:&quot;, jwtSecret.substring(0, 10));
      
      // Use JOSE library for verification to match auth service
      const { jwtVerify } = await import(&quot;jose&quot;);
      const secretKey = new TextEncoder().encode(jwtSecret);
      const { payload: josePayload } = await jwtVerify(authToken.value, secretKey);
      payload = josePayload;
    } catch (error) {
      console.log(&quot;[Auth] Invalid token:&quot;, error);
      return null;
    }
    
    // JOSE uses 'sub' field for user ID, not 'id'
    const userId = payload.sub;
    if (!userId) {
      console.log(&quot;[Auth] Invalid token payload - no user ID&quot;);
      return null;
    }

    // Get user from database
    const user = await getUserById(userId);
    
    if (!user) {
      console.log(&quot;[Auth] User not found for token&quot;);
      return null;
    }

    console.log(&quot;[Auth] User authenticated:&quot;, user.username, &quot;role:&quot;, user.role);

    return {
      id: user.id,
      username: user.username,
      email: user.email || null,
      fullName: user.fullName || null,
      role: user.role || &quot;brand_agent&quot;,
      active: Boolean(user.active !== false),
    };
  } catch (error) {
    console.error(&quot;[Auth Server] Critical authentication error:&quot;, error);
    console.error(&quot;[Auth Server] Error stack:&quot;, (error as Error)?.stack);
    console.error(&quot;[Auth Server] Error type:&quot;, typeof error);
    return null;
  }
}

// Alias for backward compatibility
export const getUser = getCurrentUser;
export const getAuthUser = getCurrentUser;
