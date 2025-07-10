/**
 * Jest configuration for the project
 */

module.exports = {
  // Use TypeScript for test files
  preset: "ts-jest",

  // Test environment
  testEnvironment: "node",

  // Automatically clear mock calls and instances between tests
  clearMocks: true,

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Root directory to search for tests
  roots: ["<rootDir>/app"],

  // File pattern for test files
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],

  // Ignore paths
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Module file extensions
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],

  // Module name mapper for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },

  // Transform files with ts-jest
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },

  // Set up global test environment
  setupFilesAfterEnv: ["<rootDir>/app/tests/setup.js"],

  // Test coverage configuration
  collectCoverage: false,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/_*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/tests/**/*",
  ],

  // Timeouts for tests
  testTimeout: 10000,
};
