/**
 * Jest configuration for ES modules
 */

export default {
  // Use ESM for test files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  // Test environment
  testEnvironment: "node",

  // Enable ESM support - only for TypeScript files
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],

  // Automatically clear mock calls and instances between tests
  clearMocks: true,

  // Root directory to search for tests
  roots: ["<rootDir>/app"],

  // File pattern for test files
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],

  // Ignore paths
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Module file extensions
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "mjs"],

  // Module name mapper for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },

  // Set up global test environment
  setupFilesAfterEnv: ["<rootDir>/app/tests/setup.js"],

  // Test timeout
  testTimeout: 10000,
};
