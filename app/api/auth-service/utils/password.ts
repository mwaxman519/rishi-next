/**
 * Password Utilities for Auth Microservice
 *
 * Functions for securely handling passwords.
 */
import * as bcrypt from &quot;bcryptjs&quot;;
import { AUTH_CONFIG } from &quot;../config&quot;;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(AUTH_CONFIG.SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(
  password: string,
  minLength: number = AUTH_CONFIG.MIN_PASSWORD_LENGTH,
): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: &quot;Password is required&quot; };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  // Add additional password strength rules as needed
  // For example, requiring uppercase, lowercase, numbers, special characters, etc.

  return { valid: true };
}
