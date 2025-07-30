/**
 * Session helper functions
 * Production implementation using database authentication
 */

import { db } from &quot;./db&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import * as schema from &quot;@shared/schema&quot;;
import { cookies } from &quot;next/headers&quot;;
import { verify } from &quot;jsonwebtoken&quot;;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Get the user from the session
 * Production implementation using JWT and database
 */
export async function getUserFromSession(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(&quot;auth-token&quot;)?.value;
    
    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(&quot;JWT_SECRET environment variable is required&quot;);
    }
    const decoded = verify(token, jwtSecret) as any;
    
    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.id));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.fullName || user.username,
      email: user.email || null,
      role: user.role,
    };
  } catch (error) {
    console.error(&quot;Error getting user from session:&quot;, error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getUserFromSession()) !== null;
}

/**
 * Get current user (alias for getUserFromSession)
 */
export const currentUser = getUserFromSession;

/**
 * Get authenticated session (alias for getUserFromSession)
 */
export const getAuthSession = getUserFromSession;
