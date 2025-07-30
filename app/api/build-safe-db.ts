/**
 * Build-Safe Database Wrapper
 * Prevents database calls during Next.js static generation
 */

import { db as originalDb } from &quot;./auth-service/db&quot;;

// Build-time safety wrapper
export function createBuildSafeDb() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('[Build Safe DB] Database operations disabled during static generation');
    
    // Return a proxy that throws helpful errors for build-time database calls
    return new Proxy({} as typeof originalDb, {
      get(target, prop) {
        throw new Error(`[Build Safe DB] Database operation '${String(prop)}' attempted during static generation. Use build-time guards.`);
      }
    });
  }
  
  return originalDb;
}

export const db = createBuildSafeDb();
