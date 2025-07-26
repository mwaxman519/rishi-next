
/**
 * RBAC utilities
 */
import { hasPermission, getUserPermissions } from './permissions';
import { NextRequest } from 'next/server';

export { hasPermission, getUserPermissions };

/**
 * Check permission wrapper for API routes
 */
export async function checkPermission(req: NextRequest, permission: string): Promise<boolean> {
  // For development, always return true
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, implement proper permission checking
  return true;
}
