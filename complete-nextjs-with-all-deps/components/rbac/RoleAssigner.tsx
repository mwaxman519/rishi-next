"use client";

import React, { useState } from "react";
import { UserRole } from "@/components/../lib/rbac";
import { USER_ROLES } from "@/components/../../shared/schema";

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
        return "Full access to all system features and data.";
      case USER_ROLES.INTERNAL_ADMIN:
        return "Access to all clients and system features except system configuration.";
      case USER_ROLES.INTERNAL_FIELD_MANAGER:
        return "Manages field operations, brand agents, and kits across regions.";
      case USER_ROLES.FIELD_COORDINATOR:
        return "Regional management of brand agents, events, and kits.";
      case USER_ROLES.BRAND_AGENT:
        return "Front-line worker performing marketing services at events.";
      case USER_ROLES.INTERNAL_ACCOUNT_MANAGER:
        return "Manages client relationships and approves events/marketing materials.";
      case USER_ROLES.CLIENT_MANAGER:
        return "Manager within a client organization with administrative access.";
      case USER_ROLES.CLIENT_USER:
        return "Standard user within a client organization.";
      default:
        return "Standard user role.";
    }
  };

  // Helper function to format role name
  const formatRoleName = (role: UserRole): string => {
    return role.replace(/_/g, " ");
  };

  // Get color for role badge
  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case USER_ROLES.INTERNAL_ADMIN:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case USER_ROLES.INTERNAL_FIELD_MANAGER:
      case USER_ROLES.INTERNAL_ACCOUNT_MANAGER:
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      case USER_ROLES.FIELD_COORDINATOR:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case USER_ROLES.CLIENT_MANAGER:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case USER_ROLES.CLIENT_USER:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case USER_ROLES.BRAND_AGENT:
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="relative">
      <div
        className={`
          relative border rounded-md p-2 flex justify-between items-center
          ${disabled ? "bg-gray-100 dark:bg-gray-800 opacity-75 cursor-not-allowed" : "bg-white dark:bg-gray-900 cursor-pointer"}
          ${isOpen ? "ring-2 ring-blue-500 dark:ring-blue-400" : "border-gray-300 dark:border-gray-700"}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${currentRole ? getRoleBadgeColor(currentRole) : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
            `}
          >
            {currentRole ? formatRoleName(currentRole) : "No role selected"}
          </span>

          {showRoleInfo && currentRole && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getRoleDescription(currentRole)}
            </span>
          )}
        </div>

        {!disabled && (
          <svg
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto">
          {allRoles.map((role) => (
            <div
              key={role}
              className={`
                p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer
                ${currentRole === role ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              `}
              onClick={() => handleRoleChange(role)}
            >
              <div className="flex items-center justify-between">
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
                    className="w-5 h-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {showRoleInfo && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
