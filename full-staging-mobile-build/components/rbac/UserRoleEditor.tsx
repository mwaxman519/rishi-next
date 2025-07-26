"use client";

import React, { useState, useEffect } from "react";
import { UserRole, Permission, getPermissionsForRole } from "@/components/../lib/rbac";
import { RoleAssigner } from "./RoleAssigner";
import { PermissionsEditor } from "./PermissionsEditor";

interface UserProfile {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

interface UserRoleEditorProps {
  user: UserProfile;
  onSave: (userData: {
    role: UserRole;
    customPermissions?: Permission[];
  }) => Promise<void>;
  disabled?: boolean;
}

export function UserRoleEditor({
  user,
  onSave,
  disabled = false,
}: UserRoleEditorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // When the user changes, update the selected role
  useEffect(() => {
    setSelectedRole(user.role);
    // Reset custom permissions when the user changes
    setCustomPermissions([]);
    setIsCustomizing(false);
  }, [user]);

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // Reset custom permissions when the role changes
    setCustomPermissions([]);
    setIsCustomizing(false);
  };

  // Handle save
  const handleSave = async () => {
    if (disabled || isSaving) return;

    try {
      setIsSaving(true);

      // If we're customizing permissions, send them along with the role
      await onSave({
        role: selectedRole,
        customPermissions: isCustomizing ? customPermissions : undefined,
      });
    } catch (error) {
      console.error("Error saving user role:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          User Role
        </h3>

        <div className="mb-6">
          <RoleAssigner
            currentRole={selectedRole}
            onChange={handleRoleChange}
            disabled={disabled}
            showRoleInfo
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Permissions
          </h4>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              disabled={disabled}
              className={`
                px-3 py-1 text-sm rounded-md
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isCustomizing
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                }
              `}
            >
              {isCustomizing
                ? "Using Custom Permissions"
                : "Use Role Default Permissions"}
            </button>
          </div>
        </div>

        {isCustomizing ? (
          <PermissionsEditor
            role={selectedRole}
            onChange={setCustomPermissions}
            readOnly={disabled}
          />
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400 italic">
            User has the default permissions for their role.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              disabled ||
              isSaving ||
              (selectedRole === user.role && !isCustomizing)
            }
            className={`
              px-4 py-2 bg-blue-600 text-white rounded-md
              ${
                disabled ||
                isSaving ||
                (selectedRole === user.role && !isCustomizing)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }
            `}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
