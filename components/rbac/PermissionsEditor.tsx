&quot;use client&quot;;

import React, { useState, useEffect, useMemo } from &quot;react&quot;;
import {
  UserRole,
  Permission,
  getAllPermissions,
  getPermissionsForRole,
} from &quot;@/components/../lib/rbac&quot;;

interface PermissionsEditorProps {
  role: UserRole;
  onChange: (permissions: Permission[]) => void;
  readOnly?: boolean;
  initialPermissions?: Permission[];
}

/**
 * Component for editing permissions for a role
 */
export function PermissionsEditor({
  role,
  onChange,
  readOnly = false,
  initialPermissions,
}: PermissionsEditorProps) {
  // Get default permissions for the role
  const defaultPermissions = useMemo(() => getPermissionsForRole(role), [role]);

  // Initialize with either provided initialPermissions or defaultPermissions
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    initialPermissions || [...defaultPermissions],
  );

  // Get all available permissions
  const allPermissions = useMemo(() => getAllPermissions(), []);

  // Group permissions by resource
  const permissionsByResource = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};

    allPermissions.forEach((permission) => {
      const [action, resource] = permission.split(&quot;:&quot;);

      if (!grouped[resource]) {
        grouped[resource] = [];
      }

      grouped[resource]?.push(permission);
    });

    return grouped;
  }, [allPermissions]);

  // Update permissions when role changes
  useEffect(() => {
    if (!initialPermissions) {
      const newDefaultPermissions = getPermissionsForRole(role);
      setSelectedPermissions([...newDefaultPermissions]);
    }
  }, [role, initialPermissions]);

  // Update parent component when selected permissions change
  useEffect(() => {
    onChange(selectedPermissions);
  }, [selectedPermissions, onChange]);

  // Toggle a permission
  const togglePermission = (permission: Permission) => {
    if (readOnly) return;

    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  // Determine if a permission is selected
  const isPermissionSelected = (permission: Permission) => {
    return selectedPermissions.includes(permission);
  };

  // Format permission for display
  const formatPermission = (permission: string): string => {
    const [action, resource] = permission.split(&quot;:&quot;);

    let formattedAction = action;
    if (action === &quot;create&quot;) formattedAction = &quot;Create&quot;;
    if (action === &quot;read&quot;) formattedAction = &quot;View&quot;;
    if (action === &quot;update&quot;) formattedAction = &quot;Edit&quot;;
    if (action === &quot;delete&quot;) formattedAction = &quot;Delete&quot;;
    if (action === &quot;manage&quot;) formattedAction = &quot;Manage&quot;;
    if (action === &quot;approve&quot;) formattedAction = &quot;Approve&quot;;
    if (action === &quot;assign&quot;) formattedAction = &quot;Assign&quot;;

    let formattedResource = resource;
    if (resource) {
      formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1);
    }

    return `${formattedAction} ${formattedResource}`;
  };

  // Reset to default permissions
  const resetToDefaults = () => {
    if (readOnly) return;

    const newDefaultPermissions = getPermissionsForRole(role);
    setSelectedPermissions([...newDefaultPermissions]);
  };

  return (
    <div className=&quot;space-y-4&quot;>
      {!readOnly && (
        <div className=&quot;flex justify-end mb-2&quot;>
          <button
            type=&quot;button&quot;
            onClick={resetToDefaults}
            className=&quot;px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-800/30&quot;
          >
            Reset to Default
          </button>
        </div>
      )}

      <div className=&quot;space-y-4&quot;>
        {Object.entries(permissionsByResource).map(
          ([resource, permissions]) => (
            <div
              key={resource}
              className=&quot;border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden&quot;
            >
              <div className=&quot;bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium capitalize&quot;>
                {resource}
              </div>
              <div className=&quot;p-4 grid grid-cols-1 md:grid-cols-2 gap-2&quot;>
                {permissions.map((permission) => {
                  const isDefault = defaultPermissions.includes(permission);
                  const isSelected = isPermissionSelected(permission);

                  return (
                    <div
                      key={permission}
                      onClick={() => togglePermission(permission)}
                      className={`
                      p-2 rounded-md flex items-center justify-between
                      ${
                        readOnly
                          ? &quot;cursor-default&quot;
                          : &quot;cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800&quot;
                      }
                      ${
                        isSelected
                          ? &quot;bg-blue-50 dark:bg-blue-900/20&quot;
                          : &quot;bg-white dark:bg-gray-900&quot;
                      }
                    `}
                    >
                      <div className=&quot;flex items-center&quot;>
                        <div
                          className={`
                          w-5 h-5 rounded border flex items-center justify-center mr-3
                          ${
                            isSelected
                              ? &quot;bg-blue-500 border-blue-500&quot;
                              : &quot;border-gray-300 dark:border-gray-600&quot;
                          }
                        `}
                        >
                          {isSelected && (
                            <svg
                              className=&quot;w-4 h-4 text-white&quot;
                              viewBox=&quot;0 0 20 20&quot;
                              fill=&quot;currentColor&quot;
                            >
                              <path
                                fillRule=&quot;evenodd&quot;
                                d=&quot;M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z&quot;
                                clipRule=&quot;evenodd&quot;
                              />
                            </svg>
                          )}
                        </div>
                        <span className=&quot;text-sm&quot;>
                          {formatPermission(permission)}
                        </span>
                      </div>

                      {isDefault && (
                        <span className=&quot;text-xs text-gray-500 dark:text-gray-400 italic&quot;>
                          Default
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
