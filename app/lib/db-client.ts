/**
 * Client-side db stub
 *
 * This file provides a safe import for client components that need db-related types
 * but not the actual database connection.
 *
 * It prevents the "server-only" module error when importing from client components.
 */

// This is a dummy db object for client components
// It will throw errors if actually used at runtime
export const db = {
  __note: "Production client-side database interface",
};

// Dummy SQL function for use in client components
// Will throw errors if actually used at runtime
export const sql = () => {
  throw new Error("SQL cannot be used in client components");
};

// Export a function that serves as a clear error message
export function getClientDbError() {
  return new Error(
    "Database connections cannot be used in client components. " +
      "Use server components, API routes, or Server Actions instead.",
  );
}
