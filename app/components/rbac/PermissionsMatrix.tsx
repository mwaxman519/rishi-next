"use client";

import React, { useState, useMemo } from "react";
import {
  UserRole,
  Permission,
  getAllPermissions,
  getPermissionsForRole,
  hasPermission,
} from "../../lib/rbac";
import { USER_ROLES } from "../../../shared/schema";

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
  const [activeTab, setActiveTab] = useState<string>("all");

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
      const [action, resource] = permission.split(":");

      if (!grouped[resource]) {
        grouped[resource] = [];
      }

      grouped[resource]?.push(permission);
      grouped["all"]?.push(permission);
    });

    return grouped;
  }, [allPermissions]);

  // Get available resources for tabs
  const resources = useMemo(() => {
    return Object.keys(permissionsByResource).filter((r) => r !== "all");
  }, [permissionsByResource]);

  // Get permissions for the active tab
  const activePermissions = useMemo(() => {
    return permissionsByResource[activeTab] || [];
  }, [permissionsByResource, activeTab]);

  return (
    <div className="overflow-hidden">
      {!compact && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto hide-scrollbar">
            <button
              key="all"
              onClick={() => setActiveTab("all")}
              className={`
                px-4 py-2 whitespace-nowrap border-b-2 font-medium text-sm
                ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
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
                      ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }
                `}
              >
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Permission
              </th>

              {displayRoles.map((role) => (
                <th
                  key={role}
                  scope="col"
                  className={`
                    px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                    ${highlightRole === role ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                  `}
                >
                  {compact
                    ? role
                        .split("_")
                        .map((word) => word[0].toUpperCase())
                        .join("")
                    : role.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {activePermissions.map((permission) => (
              <tr key={permission}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
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
                        ${highlightRole === role ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                      `}
                    >
                      {hasAccess ? (
                        <span className="flex justify-center">
                          <svg
                            className="w-5 h-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="flex justify-center">
                          <svg
                            className="w-5 h-5 text-gray-300 dark:text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
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
  const [action, resource] = permission.split(":");

  // Format the action
  let formattedAction = action;
  if (action === "create") formattedAction = "Create";
  if (action === "read") formattedAction = "View";
  if (action === "update") formattedAction = "Edit";
  if (action === "delete") formattedAction = "Delete";
  if (action === "manage") formattedAction = "Manage";
  if (action === "approve") formattedAction = "Approve";
  if (action === "assign") formattedAction = "Assign";

  // Format the resource
  let formattedResource = resource;
  if (resource) {
    formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1);
  }

  return `${formattedAction} ${formattedResource}`;
}
