&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { UserRole } from &quot;@/components/../lib/rbac&quot;;
import { USER_ROLES } from &quot;@/components/../../shared/schema&quot;;

interface RoleAssignerProps {
  currentRole?: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  showRoleInfo?: boolean;
}

export function RoleAssigner({
  currentRole,
  onChange,
  disabled = false,
  showRoleInfo = false,
}: RoleAssignerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get all roles from USER_ROLES
  const allRoles = Object.values(USER_ROLES);

  const handleRoleChange = (role: UserRole) => {
    onChange(role);
    setIsOpen(false);
  };

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

  // Helper function to format role name
  const formatRoleName = (role: UserRole): string => {
    return role.replace(/_/g, &quot; &quot;);
  };

  // Get color for role badge
  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return &quot;bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400&quot;;
      case USER_ROLES.INTERNAL_ADMIN:
        return &quot;bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400&quot;;
      case USER_ROLES.INTERNAL_FIELD_MANAGER:
      case USER_ROLES.INTERNAL_ACCOUNT_MANAGER:
        return &quot;bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400&quot;;
      case USER_ROLES.FIELD_COORDINATOR:
        return &quot;bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400&quot;;
      case USER_ROLES.CLIENT_MANAGER:
        return &quot;bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400&quot;;
      case USER_ROLES.CLIENT_USER:
        return &quot;bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400&quot;;
      case USER_ROLES.BRAND_AGENT:
        return &quot;bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300&quot;;
    }
  };

  return (
    <div className=&quot;relative&quot;>
      <div
        className={`
          relative border rounded-md p-2 flex justify-between items-center
          ${disabled ? &quot;bg-gray-100 dark:bg-gray-800 opacity-75 cursor-not-allowed&quot; : &quot;bg-white dark:bg-gray-900 cursor-pointer&quot;}
          ${isOpen ? &quot;ring-2 ring-blue-500 dark:ring-blue-400&quot; : &quot;border-gray-300 dark:border-gray-700&quot;}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className=&quot;flex items-center space-x-2&quot;>
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${currentRole ? getRoleBadgeColor(currentRole) : &quot;bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300&quot;}
            `}
          >
            {currentRole ? formatRoleName(currentRole) : &quot;No role selected&quot;}
          </span>

          {showRoleInfo && currentRole && (
            <span className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>
              {getRoleDescription(currentRole)}
            </span>
          )}
        </div>

        {!disabled && (
          <svg
            className=&quot;w-5 h-5 text-gray-400&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        )}
      </div>

      {isOpen && !disabled && (
        <div className=&quot;absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto&quot;>
          {allRoles.map((role) => (
            <div
              key={role}
              className={`
                p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer
                ${currentRole === role ? &quot;bg-blue-50 dark:bg-blue-900/20&quot; : "&quot;}
              `}
              onClick={() => handleRoleChange(role)}
            >
              <div className=&quot;flex items-center justify-between&quot;>
                <span
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${getRoleBadgeColor(role)}
                  `}
                >
                  {formatRoleName(role)}
                </span>

                {currentRole === role && (
                  <svg
                    className=&quot;w-5 h-5 text-blue-500&quot;
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

              {showRoleInfo && (
                <p className=&quot;mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {getRoleDescription(role)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
