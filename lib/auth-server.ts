/**
 * Server-side authentication utilities
 * Handles JWT tokens, password hashing, and user validation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name?: string;
  active: boolean;
}

export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get authenticated user from JWT token
 */
export async function getAuthUser(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user || !user.active) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role,
      full_name: user.full_name || undefined,
      active: user.active,
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Validate request with authentication
 */
export async function validateRequest(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return await getAuthUser(token);
  } catch (error) {
    console.error('Error validating request:', error);
    return null;
  }
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || !user.active) {
      return null;
    }

    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role,
      full_name: user.full_name || undefined,
      active: user.active,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
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

/**
 * Create a new user
 */
export async function createUser(userData: {
  username: string;
  password: string;
  email: string;
  role: string;
  full_name?: string;
}): Promise<AuthUser | null> {
  try {
    const hashedPassword = await hashPassword(userData.password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name,
        active: true,
      })
      .returning();

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email || '',
      role: newUser.role,
      full_name: newUser.full_name || undefined,
      active: newUser.active,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ password: hashedPassword, updated_at: new Date() })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    return false;
  }
}

// Add getUser function for compatibility
export async function getUser(id?: string) {
  try {
    // If no ID provided, get current user from cookies/session
    if (!id) {
      const user = await getCurrentUser();
      return user;
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user || null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// Add auth function for compatibility
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

// Helper function to get current user from cookies
async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));

    return user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Helper function to get user organizations
async function getUserOrganizations(userId: string) {
  try {
    const { organizations, userOrganizations } = await import("@/shared/schema");
    
    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        is_default: userOrganizations.isDefault,
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, userId));

    return userOrgs;
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

/**
 * Get user from request (alternative function name)
 */
export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  return await validateRequest(request);
}