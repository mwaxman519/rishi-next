/**
 * Auth Microservice Configuration
 *
 * Central configuration for the auth microservice.
 */

export const AUTH_CONFIG = {
  // Service information
  SERVICE_NAME: &quot;auth-service&quot;,
  SERVICE_VERSION: &quot;1.0.0&quot;,

  // Authentication settings
  TOKEN_EXPIRY: &quot;1d&quot;,
  REFRESH_TOKEN_EXPIRY: &quot;7d&quot;,
  COOKIE_NAME: &quot;auth_token&quot;,
  REFRESH_COOKIE_NAME: &quot;refresh_token&quot;,
  COOKIE_MAX_AGE: 86400, // 1 day in seconds

  // Development mode
  DEV_MODE: process.env.NODE_ENV === &quot;development&quot;,

  // Default secret for development only
  DEFAULT_JWT_SECRET: &quot;dev_jwt_secret_replace_in_production&quot;,

  // Password settings
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000, // 15 minutes

  // Admin and internal authentication
  ADMIN_AUTH_TOKEN: process.env.ADMIN_AUTH_TOKEN || &quot;admin_dev_token&quot;,
  INTERNAL_AUTH_TOKEN: process.env.INTERNAL_AUTH_TOKEN || &quot;internal_dev_token&quot;,

  // Registration settings
  ALLOW_SELF_REGISTRATION: process.env.ALLOW_SELF_REGISTRATION === &quot;true&quot;,
  ALLOW_ORG_CREATION: process.env.ALLOW_ORG_CREATION === &quot;true&quot; || false,
  REGISTRATION_PASSCODE: process.env.REGISTRATION_PASSCODE || &quot;mattmikeryan&quot;,
};
