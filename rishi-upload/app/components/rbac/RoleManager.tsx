"use client";

import React, { useState } from "react";
import { UserRole } from "../../lib/rbac";
import { USER_ROLES } from "../../../shared/schema";
import { PermissionsMatrix } from "./PermissionsMatrix";

interface RoleManagerProps {
  onSelectRole?: (role: UserRole) => void;
  selectedRole?: UserRole;
}

/**
 * Component to manage and visualize roles in the system
 */
export function RoleManager({ onSelectRole, selectedRole }: RoleManagerProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "list">("list");

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
    return role.replace(/_/g, " ");
  };

  // Get a description for a role
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Role Management
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "matrix"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Matrix View
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allRoles.map((role) => (
            <div
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`
                p-4 border rounded-lg cursor-pointer transition
                ${selectedRole === role ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"}
              `}
            >
              <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                {formatRoleName(role)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getRoleDescription(role)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <PermissionsMatrix
            highlightRole={selectedRole}
            showAllRoles={!compactView}
          />
        </div>
      )}
    </div>
  );
}
