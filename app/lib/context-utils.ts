import { PermissionContext } from &quot;./rbac-enhanced&quot;;

/**
 * Extract organization ID from a URL path
 * Supports patterns like:
 * - /organizations/123/...
 * - /orgs/123/...
 * - /organization/123/...
 * - /org/123/...
 */
export function extractOrganizationIdFromPath(
  path: string,
): number | undefined {
  // Different URL patterns to extract organization ID from
  const patterns = [
    /\/organizations?\/(\d+)/i, // Match /organization/123 or /organizations/123
    /\/orgs?\/(\d+)/i, // Match /org/123 or /orgs/123
  ];

  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * Extract region IDs from a URL path
 * Supports patterns like:
 * - /regions/123,...
 * - /region/123,...
 */
export function extractRegionIdsFromPath(path: string): number[] | undefined {
  // Match region ID(s) in the URL
  const regionMatch = path.match(/\/regions?\/([0-9,]+)/i);

  if (regionMatch && regionMatch[1]) {
    // Support comma-separated list of region IDs
    return regionMatch[1].split(&quot;,&quot;).map((id) => parseInt(id.trim(), 10));
  }

  return undefined;
}

/**
 * Extract resource owner ID from a URL path
 * Supports patterns like:
 * - /users/abc-123-...
 * - /user/abc-123-...
 */
export function extractResourceOwnerIdFromPath(
  path: string,
): string | undefined {
  // Match UUID pattern for user IDs
  const userMatch = path.match(
    /\/users?\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );

  if (userMatch && userMatch[1]) {
    return userMatch[1];
  }

  return undefined;
}

/**
 * Create a permission context from a URL path by extracting organization ID,
 * region IDs, and resource owner ID if present in the path
 */
export function createContextFromPath(path: string): PermissionContext {
  return {
    organizationId: extractOrganizationIdFromPath(path),
    regionIds: extractRegionIdsFromPath(path),
    resourceOwnerId: extractResourceOwnerIdFromPath(path),
  };
}

/**
 * Create a permission context combining current user context with URL-extracted context
 */
export function createMergedContext(
  userOrganizationId?: number,
  userRegionIds?: number[],
  path?: string,
): PermissionContext {
  const pathContext = path ? createContextFromPath(path) : {};

  return {
    organizationId: pathContext.organizationId || userOrganizationId,
    regionIds: pathContext.regionIds || userRegionIds,
    resourceOwnerId: pathContext.resourceOwnerId,
  };
}
