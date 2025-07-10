/**
 * Server-side authentication utilities
 */

import bcrypt from "bcryptjs";

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

export async function getUser() {
  // Development mode mock user
  return {
    id: "mock-user-id",
    email: "admin@rishi.com",
    firstName: "Admin",
    lastName: "User",
    role: "super_admin",
  };
}

export async function getCurrentUser() {
  return getUser();
}

export async function getAuthUser() {
  // Development mode mock user for API routes
  return {
    id: "mock-user-id",
    email: "admin@rishi.com",
    firstName: "Admin",
    lastName: "User",
    role: "super_admin",
    username: "admin",
    fullName: "Super Admin",
    organizationId: "00000000-0000-0000-0000-000000000001",
  };
}
