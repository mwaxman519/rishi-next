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

// Auth function that returns a mock session
export async function auth() {
  console.log("DEVELOPMENT MODE: Using mock auth session");
  return mockSession;
}

// Function to get the current session with user information
export async function getSession() {
  return mockSession;
}

// Function to check if a user is authenticated
export async function isAuthenticated() {
  return true; // Always authenticated in development
}

// Get user function - used by API routes
export async function getUser() {
  console.log("DEVELOPMENT MODE: Using mock user for testing");
  return mockUser;
}

// Get current user function for API routes
export async function getCurrentUser(req?: Request) {
  console.log("DEVELOPMENT MODE: Using mock user for testing");
  return mockUser;
}

// Get user organizations
export async function getUserOrganizations() {
  console.log("DEVELOPMENT MODE: Using mock user organizations for testing");
  return mockUserOrganizations;
}

// Get JWT payload from token - used by RBAC system
export async function getJwtPayload(token?: string) {
  return mockJwtPayload;
}

// Export other auth-related functions for development
export const signIn = async () => ({ ok: true, error: null });
export const signOut = async () => ({ ok: true, error: null });
