// VoltBuilder Build-Safe Database Module
// This module is replaced during VoltBuilder builds to prevent database import failures
// Original database functionality will work in the deployed mobile app

console.log('[Auth Service DB] VoltBuilder build-safe version loaded');

export const db = {
  select: () => ({
    from: () => ({
      where: () => []
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => []
    })
  })
};

export const pool = {
  connect: () => Promise.resolve({
    query: () => Promise.resolve({ rows: [] }),
    release: () => {}
  })
};

export function getEnvironment(): "development" | "staging" | "production" {
  return "development";
}