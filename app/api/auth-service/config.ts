/**
 * Auth Microservice Configuration
 *
 * Central configuration for the auth microservice.
 */

export const AUTH_CONFIG = {
  // Service information
  SERVICE_NAME: "auth-service",
  SERVICE_VERSION: "1.0.0",

  // Authentication settings
  TOKEN_EXPIRY: "1d",
  REFRESH_TOKEN_EXPIRY: "7d",
  COOKIE_NAME: "auth_token",
  REFRESH_COOKIE_NAME: "refresh_token",
  COOKIE_MAX_AGE: 86400, // 1 day in seconds

  // Development mode
  DEV_MODE: process.env.NODE_ENV === "development",

  // Default secret for development only
  DEFAULT_JWT_SECRET: "dev_jwt_secret_replace_in_production",

  // Password settings
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000, // 15 minutes

  // Admin and internal authentication
  ADMIN_AUTH_TOKEN: process.env.ADMIN_AUTH_TOKEN || "admin_dev_token",
  INTERNAL_AUTH_TOKEN: process.env.INTERNAL_AUTH_TOKEN || "internal_dev_token",

  // Registration settings
  ALLOW_SELF_REGISTRATION: process.env.ALLOW_SELF_REGISTRATION === "true",
  ALLOW_ORG_CREATION: process.env.ALLOW_ORG_CREATION === "true" || false,
  REGISTRATION_PASSCODE: process.env.REGISTRATION_PASSCODE || "mattmikeryan",
};
