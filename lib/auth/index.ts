/**
 * Authentication Utilities
 * Provides authentication functions and user management
 */

import { User, UserRole } from "../../shared/schema";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT secret for development - should be environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token and return user data
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Get mock user for development
 */
export function getMockUser(): User {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "admin@rishi.com",
    name: "Admin User",
    role: "super_admin" as UserRole,
    organizationId: "550e8400-e29b-41d4-a716-446655440001",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null && user.isActive;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return ['super_admin', 'internal_admin'].includes(user.role);
}

/**
 * Check if user belongs to organization
 */
export function belongsToOrganization(user: User | null, organizationId: string): boolean {
  if (!user) return false;
  return user.organizationId === organizationId;
}

/**
 * Extract user from request headers
 */
export function extractUserFromRequest(headers: Headers): User | null {
  const authHeader = headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) return null;

  // In production, this would fetch from database
  // For development, return mock user
  return getMockUser();
}

/**
 * Get current user from session/token
 */
export function getCurrentUser(): User | null {
  // For development, return mock user
  return getMockUser();
}

/**
 * Check if user has specific permission
 */
export function checkPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  // Basic permission checking based on role
  const rolePermissions: Record<string, string[]> = {
    internal_admin: ['read', 'write', 'admin'],
    internal_field_manager: ['read', 'write'],
    brand_agent: ['read', 'write'],
    client_manager: ['read', 'write'],
    client_user: ['read'],
  };
  
  return rolePermissions[user.role]?.includes(permission) || false;
}

// Default export for compatibility
export default {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  getMockUser,
  isAuthenticated,
  isAdmin,
  belongsToOrganization,
  extractUserFromRequest,
  getCurrentUser,
  checkPermission,
};