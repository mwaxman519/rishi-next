&quot;use client&quot;;

import React, { useState, useMemo } from &quot;react&quot;;
import {
  UserRole,
  Permission,
  getAllPermissions,
  getPermissionsForRole,
  hasPermission,
} from &quot;@/components/../lib/rbac&quot;;
import { USER_ROLES } from &quot;@/components/../../shared/schema&quot;;

interface PermissionsMatrixProps {
  highlightRole?: UserRole;
  showAllRoles?: boolean;
  compact?: boolean;
}

/**
 * Component to visualize role permissions in a matrix format
 */
export function PermissionsMatrix({
  highlightRole,
  showAllRoles = true,
  compact = false,
}: PermissionsMatrixProps) {
  // Group permissions by resource
  const [activeTab, setActiveTab] = useState<string>(&quot;all&quot;);

  // Get all permissions and roles
  const allPermissions = useMemo(() => getAllPermissions(), []);
  const allRoles = useMemo(() => Object.values(USER_ROLES), []);

  // Get the roles to display in the matrix
  const displayRoles = useMemo(() => {
    if (showAllRoles) return allRoles;
    if (highlightRole) return [highlightRole];
    return [];
  }, [showAllRoles, highlightRole, allRoles]);

  // Group permissions by resource
  const permissionsByResource = useMemo(() => {
    const grouped: Record<string, Permission[]> = { all: [] };

    allPermissions.forEach((permission) => {
      const [action, resource] = permission.split(&quot;:&quot;);

      if (!grouped[resource]) {
        grouped[resource] = [];
      }

      grouped[resource]?.push(permission);
      grouped[&quot;all&quot;]?.push(permission);
    });

    return grouped;
  }, [allPermissions]);

  // Get available resources for tabs
  const resources = useMemo(() => {
    return Object.keys(permissionsByResource).filter((r) => r !== &quot;all&quot;);
  }, [permissionsByResource]);

  // Get permissions for the active tab
  const activePermissions = useMemo(() => {
    return permissionsByResource[activeTab] || [];
  }, [permissionsByResource, activeTab]);

  return (
    <div className=&quot;overflow-hidden&quot;>
      {!compact && (
        <div className=&quot;border-b border-gray-200 dark:border-gray-700&quot;>
          <div className=&quot;flex overflow-x-auto hide-scrollbar&quot;>
            <button
              key=&quot;all&quot;
              onClick={() => setActiveTab(&quot;all&quot;)}
              className={`
                px-4 py-2 whitespace-nowrap border-b-2 font-medium text-sm
                ${
                  activeTab === &quot;all&quot;
                    ? &quot;border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400&quot;
                    : &quot;border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300&quot;
                }
              `}
            >
              All Permissions
            </button>

            {resources.map((resource) => (
              <button
                key={resource}
                onClick={() => setActiveTab(resource)}
                className={`
                  px-4 py-2 whitespace-nowrap border-b-2 font-medium text-sm
                  ${
                    activeTab === resource
                      ? &quot;border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400&quot;
                      : &quot;border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300&quot;
                  }
                `}
              >
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className=&quot;overflow-x-auto&quot;>
        <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
          <thead className=&quot;bg-gray-50 dark:bg-gray-800&quot;>
            <tr>
              <th
                scope=&quot;col&quot;
                className=&quot;px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
              >
                Permission
              </th>

              {displayRoles.map((role) => (
                <th
                  key={role}
                  scope=&quot;col&quot;
                  className={`
                    px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                    ${highlightRole === role ? &quot;bg-blue-50 dark:bg-blue-900/20&quot; : "&quot;}
                  `}
                >
                  {compact
                    ? role
                        .split(&quot;_&quot;)
                        .map((word) => word[0].toUpperCase())
                        .join(&quot;&quot;)
                    : role.replace(/_/g, &quot; &quot;)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className=&quot;bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800&quot;>
            {activePermissions.map((permission) => (
              <tr key={permission}>
                <td className=&quot;px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300&quot;>
                  {/* Format the permission for display */}
                  {formatPermission(permission)}
                </td>

                {displayRoles.map((role) => {
                  const hasAccess = hasPermission(permission, role);

                  return (
                    <td
                      key={`${role}-${permission}`}
                      className={`
                        px-3 py-2 whitespace-nowrap text-sm text-center
                        ${highlightRole === role ? &quot;bg-blue-50 dark:bg-blue-900/20&quot; : &quot;&quot;}
                      `}
                    >
                      {hasAccess ? (
                        <span className=&quot;flex justify-center&quot;>
                          <svg
                            className=&quot;w-5 h-5 text-green-500&quot;
                            viewBox=&quot;0 0 20 20&quot;
                            fill=&quot;currentColor&quot;
                          >
                            <path
                              fillRule=&quot;evenodd&quot;
                              d=&quot;M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z&quot;
                              clipRule=&quot;evenodd&quot;
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className=&quot;flex justify-center&quot;>
                          <svg
                            className=&quot;w-5 h-5 text-gray-300 dark:text-gray-600&quot;
                            viewBox=&quot;0 0 20 20&quot;
                            fill=&quot;currentColor&quot;
                          >
                            <path
                              fillRule=&quot;evenodd&quot;
                              d=&quot;M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z&quot;
                              clipRule=&quot;evenodd&quot;
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to format permission strings for display
function formatPermission(permission: string): string {
  const [action, resource] = permission.split(&quot;:&quot;);

  // Format the action
  let formattedAction = action;
  if (action === &quot;create&quot;) formattedAction = &quot;Create&quot;;
  if (action === &quot;read&quot;) formattedAction = &quot;View&quot;;
  if (action === &quot;update&quot;) formattedAction = &quot;Edit&quot;;
  if (action === &quot;delete&quot;) formattedAction = &quot;Delete&quot;;
  if (action === &quot;manage&quot;) formattedAction = &quot;Manage&quot;;
  if (action === &quot;approve&quot;) formattedAction = &quot;Approve&quot;;
  if (action === &quot;assign&quot;) formattedAction = &quot;Assign";

  // Format the resource
  let formattedResource = resource;
  if (resource) {
    formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1);
  }

  return `${formattedAction} ${formattedResource}`;
}
