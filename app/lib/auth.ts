/**
 * Production authentication module
 * This provides real database authentication for all environments
 */

import { db } from &quot;./db&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import * as schema from &quot;../../shared/schema&quot;;
import { cookies } from &quot;next/headers&quot;;
import { verify } from &quot;jsonwebtoken&quot;;

// Get current user from JWT token in cookies
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get(&quot;auth-token&quot;)?.value;
    
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

    return user || null;
  } catch (error) {
    console.error(&quot;Error getting current user:&quot;, error);
    return null;
  }
}

// Auth function that returns database session
export async function auth() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Get user's primary organization
  const userOrgs = await getUserOrganizations(user.id);
  const primaryOrg = userOrgs.find(org => org.is_default) || userOrgs[0];

  return {
    user: {
      id: user.id,
      name: user.fullName || user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: primaryOrg?.id || null,
      organizationName: primaryOrg?.name || null,
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
  if ((process.env.NODE_ENV as string) === &quot;development&quot;) {
    return true; // Always authenticated in development
  }

  // For staging/production, check if user exists
  const user = await getCurrentUser();
  return user !== null;
}

// Get user by ID
export async function getUser(id: string) {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    return user || null;
  } catch (error) {
    console.error(&quot;Error getting user:&quot;, error);
    return null;
  }
}

// Auth options for NextAuth compatibility
export const authOptions = {
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
  },
};



// Get user organizations
export async function getUserOrganizations(userId: string) {
  try {
    const organizations = await db
      .select({
        id: schema.organizations.id,
        name: schema.organizations.name,
        type: schema.organizations.type,
        tier: schema.organizations.tier,
        role: schema.userOrganizations.role,
        is_default: schema.userOrganizations.is_default,
      })
      .from(schema.userOrganizations)
      .innerJoin(schema.organizations, eq(schema.userOrganizations.organization_id, schema.organizations.id))
      .where(eq(schema.userOrganizations.user_id, userId));
    
    return organizations;
  } catch (error) {
    console.error(&quot;Error getting user organizations:&quot;, error);
    return [];
  }
}

// Get JWT payload from token - used by RBAC system
export async function getJwtPayload(token?: string) {
  if (!token) {
    return null;
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(&quot;JWT_SECRET environment variable is required&quot;);
    }
    const decoded = verify(token, jwtSecret) as any;
    return decoded;
  } catch (error) {
    console.error(&quot;Error decoding JWT token:&quot;, error);
    return null;
  }
}

// Export other auth-related functions for development
export const signIn = async () => ({ ok: true, error: null });
export const signOut = async () => ({ ok: true, error: null });


