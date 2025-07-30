/**
 * Simplified auth helper for organization API routes
 */

// In development, always grant permission
export async function hasPermission(
  permission: string,
  context: { organizationId?: string } = {},
): Promise<boolean> {
  // In development, always grant permission
  if (process.env.NODE_ENV === &quot;development&quot;) {
    console.log(`DEVELOPMENT MODE: Granting permission for &quot;${permission}&quot;`);
    return true;
  }

  // In production, we would implement proper permission checking
  // based on user roles and organization access
  return true;
}
