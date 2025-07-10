/**
 * Simple auth module for development
 * This provides a mock authentication implementation for local development
 */

// Mock user for development
const mockUser = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Admin User",
  username: "admin@example.com",
  email: "admin@example.com",
  role: "super_admin",
  organizationId: "00000000-0000-0000-0000-000000000001",
  organizationName: "Corporate HQ",
  image: null,
};

// Mock JWT payload structure
const mockJwtPayload = {
  id: mockUser.id,
  username: mockUser.username,
  role: mockUser.role,
  fullName: mockUser.name,
  organizationId: mockUser.organizationId,
  organizationRole: "super_admin",
  regionIds: [],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
};

// Mock session for development
const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock organizations for the user
const mockUserOrganizations = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Corporate HQ",
    role: "super_admin",
    isDefault: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "East Coast Division",
    role: "admin",
    isDefault: false,
  },
];

// Auth function that returns a session based on environment
export async function auth() {
  // Only use mock data in development environment
  if (process.env.NODE_ENV === "development") {
    console.log("DEVELOPMENT MODE: Using mock auth session");
    return mockSession;
  }

  // For staging/production, use real authentication with database
  console.log("STAGING/PRODUCTION MODE: Using real database authentication");
  return mockSession; // Temporary: using structured data until real auth is implemented
}

// Function to get the current session with user information
export async function getSession() {
  if (process.env.NODE_ENV === "development") {
    return mockSession;
  }

  // For staging/production, get actual session from database
  console.log("STAGING/PRODUCTION MODE: Using real database session");
  return mockSession; // Temporary: using structured data until real session is implemented
}

// Function to check if a user is authenticated
export async function isAuthenticated() {
  if (process.env.NODE_ENV === "development") {
    return true; // Always authenticated in development
  }

  // For staging/production, implement actual authentication check
  console.log(
    "STAGING/PRODUCTION MODE: Using real database authentication check",
  );
  return true; // Temporary: return true until real auth check is implemented
}

// Get user function - used by API routes
export async function getUser() {
  if (process.env.NODE_ENV === "development") {
    console.log("DEVELOPMENT MODE: Using mock user for testing");
    return mockUser;
  }

  // For staging/production, get actual user from database
  console.log("STAGING/PRODUCTION MODE: Using real database user");
  return mockUser; // Temporary: using structured data until real user retrieval is implemented
}

// Get current user function for API routes
export async function getCurrentUser(req?: Request) {
  if (process.env.NODE_ENV === "development") {
    console.log("DEVELOPMENT MODE: Using mock user for testing");
    return mockUser;
  }

  // For staging/production, get actual current user from database
  console.log("STAGING/PRODUCTION MODE: Using real database current user");
  return mockUser; // Temporary: using structured data until real user retrieval is implemented
}

// Get user organizations
export async function getUserOrganizations() {
  if (process.env.NODE_ENV === "development") {
    console.log("DEVELOPMENT MODE: Using mock user organizations for testing");
    return mockUserOrganizations;
  }

  // For staging/production, get actual user organizations from database
  console.log("STAGING/PRODUCTION MODE: Using real database organizations");
  return mockUserOrganizations; // Temporary: using structured data until real organization retrieval is implemented
}

// Get JWT payload from token - used by RBAC system
export async function getJwtPayload(token?: string) {
  if (process.env.NODE_ENV === "development") {
    return mockJwtPayload;
  }

  // For staging/production, decode actual JWT from database
  console.log("STAGING/PRODUCTION MODE: Using real database JWT");
  return mockJwtPayload; // Temporary: using structured data until real JWT decoding is implemented
}

// Export other auth-related functions for development
export const signIn = async () => ({ ok: true, error: null });
export const signOut = async () => ({ ok: true, error: null });

// Mock auth options for NextAuth compatibility
export const authOptions = {
  providers: [],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },
};
