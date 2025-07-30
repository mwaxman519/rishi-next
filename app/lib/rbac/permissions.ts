import { UserRole, PermissionMap } from &quot;.&quot;;

/**
 * Returns the permissions for a specific role
 *
 * @param role The user role to get permissions for
 * @returns A map of resources to arrays of permissions
 */
export function getRolePermissions(role: UserRole): PermissionMap {
  switch (role) {
    case &quot;super_admin&quot;:
      return {
        locations: [
          &quot;create&quot;,
          &quot;read&quot;,
          &quot;update&quot;,
          &quot;delete&quot;,
          &quot;approve&quot;,
          &quot;reject&quot;,
          &quot;manage&quot;,
          &quot;export&quot;,
        ],
        bookings: [
          &quot;create&quot;,
          &quot;read&quot;,
          &quot;update&quot;,
          &quot;delete&quot;,
          &quot;approve&quot;,
          &quot;reject&quot;,
          &quot;manage&quot;,
          &quot;export&quot;,
        ],
        organizations: [
          &quot;create&quot;,
          &quot;read&quot;,
          &quot;update&quot;,
          &quot;delete&quot;,
          &quot;manage&quot;,
          &quot;export&quot;,
        ],
        users: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;delete&quot;, &quot;manage&quot;, &quot;export&quot;],
        reports: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;delete&quot;, &quot;manage&quot;, &quot;export&quot;],
      };

    case &quot;admin&quot;:
      return {
        locations: [
          &quot;create&quot;,
          &quot;read&quot;,
          &quot;update&quot;,
          &quot;delete&quot;,
          &quot;approve&quot;,
          &quot;reject&quot;,
          &quot;manage&quot;,
          &quot;export&quot;,
        ],
        bookings: [
          &quot;create&quot;,
          &quot;read&quot;,
          &quot;update&quot;,
          &quot;delete&quot;,
          &quot;approve&quot;,
          &quot;reject&quot;,
          &quot;manage&quot;,
          &quot;export&quot;,
        ],
        organizations: [&quot;read&quot;],
        users: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;delete&quot;, &quot;manage&quot;],
        reports: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;export&quot;],
      };

    case &quot;manager&quot;:
      return {
        locations: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;approve&quot;, &quot;reject&quot;, &quot;export&quot;],
        bookings: [&quot;create&quot;, &quot;read&quot;, &quot;update&quot;, &quot;approve&quot;, &quot;reject&quot;, &quot;export&quot;],
        organizations: [&quot;read&quot;],
        users: [&quot;read&quot;],
        reports: [&quot;read&quot;, &quot;export&quot;],
      };

    case &quot;staff&quot;:
      return {
        locations: [&quot;read&quot;, &quot;create&quot;],
        bookings: [&quot;read&quot;, &quot;create&quot;, &quot;update&quot;],
        organizations: [&quot;read&quot;],
        users: [&quot;read&quot;],
        reports: [&quot;read&quot;],
      };

    case &quot;client&quot;:
      return {
        locations: [&quot;read&quot;],
        bookings: [&quot;read&quot;, &quot;create&quot;],
        organizations: [],
        users: [],
        reports: [],
      };

    case &quot;user&quot;:
    default:
      return {
        locations: [&quot;read&quot;],
        bookings: [&quot;read&quot;],
        organizations: [],
        users: [],
        reports: [],
      };
  }
}
