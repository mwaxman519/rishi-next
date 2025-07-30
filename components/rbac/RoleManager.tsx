&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { UserRole } from &quot;@/components/../lib/rbac&quot;;
import { USER_ROLES } from &quot;@/components/../../shared/schema&quot;;
import { PermissionsMatrix } from &quot;./PermissionsMatrix&quot;;

interface RoleManagerProps {
  onSelectRole?: (role: UserRole) => void;
  selectedRole?: UserRole;
}

/**
 * Component to manage and visualize roles in the system
 */
export function RoleManager({ onSelectRole, selectedRole }: RoleManagerProps) {
  const [viewMode, setViewMode] = useState<&quot;matrix&quot; | &quot;list&quot;>(&quot;list&quot;);

  // Get all roles from USER_ROLES
  const allRoles = Object.values(USER_ROLES);

  // Display preferences
  const compactView = false;

  // Handle selecting a role
  const handleRoleSelect = (role: UserRole) => {
    onSelectRole?.(role);
  };

  // Get a human-readable role name
  const formatRoleName = (role: UserRole): string => {
    return role.replace(/_/g, &quot; &quot;);
  };

  // Get a description for a role
  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return &quot;Full access to all system features and data.&quot;;
      case USER_ROLES.INTERNAL_ADMIN:
        return &quot;Access to all clients and system features except system configuration.&quot;;
      case USER_ROLES.INTERNAL_FIELD_MANAGER:
        return &quot;Manages field operations, brand agents, and kits across regions.&quot;;
      case USER_ROLES.FIELD_COORDINATOR:
        return &quot;Regional management of brand agents, events, and kits.&quot;;
      case USER_ROLES.BRAND_AGENT:
        return &quot;Front-line worker performing marketing services at events.&quot;;
      case USER_ROLES.INTERNAL_ACCOUNT_MANAGER:
        return &quot;Manages client relationships and approves events/marketing materials.&quot;;
      case USER_ROLES.CLIENT_MANAGER:
        return &quot;Manager within a client organization with administrative access.&quot;;
      case USER_ROLES.CLIENT_USER:
        return &quot;Standard user within a client organization.&quot;;
      default:
        return &quot;Standard user role.&quot;;
    }
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between mb-4&quot;>
        <h2 className=&quot;text-2xl font-bold text-gray-900 dark:text-white&quot;>
          Role Management
        </h2>

        <div className=&quot;flex items-center space-x-2&quot;>
          <button
            onClick={() => setViewMode(&quot;list&quot;)}
            className={`px-3 py-1 rounded-md ${
              viewMode === &quot;list&quot;
                ? &quot;bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400&quot;
                : &quot;bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300&quot;
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode(&quot;matrix&quot;)}
            className={`px-3 py-1 rounded-md ${
              viewMode === &quot;matrix&quot;
                ? &quot;bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400&quot;
                : &quot;bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300&quot;
            }`}
          >
            Matrix View
          </button>
        </div>
      </div>

      {viewMode === &quot;list&quot; ? (
        <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-4&quot;>
          {allRoles.map((role) => (
            <div
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`
                p-4 border rounded-lg cursor-pointer transition
                ${selectedRole === role ? &quot;border-blue-500 bg-blue-50 dark:bg-blue-900/10&quot; : &quot;border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60&quot;}
              `}
            >
              <h3 className=&quot;text-lg font-semibold capitalize text-gray-900 dark:text-white&quot;>
                {formatRoleName(role)}
              </h3>
              <p className=&quot;text-sm text-gray-600 dark:text-gray-400 mt-1&quot;>
                {getRoleDescription(role)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className=&quot;border rounded-lg overflow-hidden&quot;>
          <PermissionsMatrix
            highlightRole={selectedRole}
            showAllRoles={!compactView}
          />
        </div>
      )}
    </div>
  );
}
