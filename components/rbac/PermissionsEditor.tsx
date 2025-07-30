"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserRole,
  Permission,
  getAllPermissions,
  getPermissionsForRole,
} from "@/components/../lib/rbac";

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
      const [action, resource] = permission.split(":");

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
    const [action, resource] = permission.split(":");

    let formattedAction = action;
    if (action === "create") formattedAction = "Create";
    if (action === "read") formattedAction = "View";
    if (action === "update") formattedAction = "Edit";
    if (action === "delete") formattedAction = "Delete";
    if (action === "manage") formattedAction = "Manage";
    if (action === "approve") formattedAction = "Approve";
    if (action === "assign") formattedAction = "Assign";

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
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-800/30"
          >
            Reset to Default
          </button>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(permissionsByResource).map(
          ([resource, permissions]) => (
            <div
              key={resource}
              className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium capitalize">
                {resource}
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
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
                          ? "cursor-default"
                          : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                      ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-white dark:bg-gray-900"
                      }
                    `}
                    >
                      <div className="flex items-center">
                        <div
                          className={`
                          w-5 h-5 rounded border flex items-center justify-center mr-3
                          ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }
                        `}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
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
                        <span className="text-sm">
                          {formatPermission(permission)}
                        </span>
                      </div>

                      {isDefault && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
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
