
/**
 * Session utilities
 */
import { getCurrentUser } from './auth-server';

export { getCurrentUser };
export const currentUser = getCurrentUser;

/**
 * Get auth session for API routes
 */
export async function getAuthSession() {
  const user = await getCurrentUser();
  return user ? { user } : null;
}
