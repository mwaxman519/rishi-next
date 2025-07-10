/**
 * Helper utilities for working with user repository data
 * Contains type-safe conversion functions between DB and domain models
 */
import { UserRole } from "./schema";
import { UserProfile, UserWithCredentials } from "../services/users/models";

/**
 * Safely converts a database user record to the UserWithCredentials domain model
 */
export function mapDatabaseUserToCredentials(user: any): UserWithCredentials {
  if (!user) {
    throw new Error("Cannot map null or undefined user");
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt,
    password: user.password,
    // Optional fields with explicit undefined handling
    ...(user.fullName ? { fullName: user.fullName } : {}),
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.profileImage ? { profileImage: user.profileImage } : {}),
  };
}

/**
 * Safely converts a database user record to the UserProfile domain model (without password)
 */
export function mapDatabaseUserToProfile(user: any): UserProfile {
  if (!user) {
    throw new Error("Cannot map null or undefined user");
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt,
    // Optional fields with explicit undefined handling
    ...(user.fullName ? { fullName: user.fullName } : {}),
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.profileImage ? { profileImage: user.profileImage } : {}),
  };
}
