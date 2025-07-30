&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { UserRole, Permission, getPermissionsForRole } from &quot;@/components/../lib/rbac&quot;;
import { RoleAssigner } from &quot;./RoleAssigner&quot;;
import { PermissionsEditor } from &quot;./PermissionsEditor&quot;;

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

      // If we&apos;re customizing permissions, send them along with the role
      await onSave({
        role: selectedRole,
        customPermissions: isCustomizing ? customPermissions : undefined,
      });
    } catch (error) {
      console.error(&quot;Error saving user role:&quot;, error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700&quot;>
        <h3 className=&quot;text-lg font-medium mb-4 text-gray-900 dark:text-white&quot;>
          User Role
        </h3>

        <div className=&quot;mb-6&quot;>
          <RoleAssigner
            currentRole={selectedRole}
            onChange={handleRoleChange}
            disabled={disabled}
            showRoleInfo
          />
        </div>

        <div className=&quot;flex items-center justify-between mb-4&quot;>
          <h4 className=&quot;text-md font-medium text-gray-900 dark:text-white&quot;>
            Permissions
          </h4>

          <div className=&quot;flex items-center&quot;>
            <button
              type=&quot;button&quot;
              onClick={() => setIsCustomizing(!isCustomizing)}
              disabled={disabled}
              className={`
                px-3 py-1 text-sm rounded-md
                ${disabled ? &quot;opacity-50 cursor-not-allowed&quot; : &quot;cursor-pointer&quot;}
                ${
                  isCustomizing
                    ? &quot;bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400&quot;
                    : &quot;bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600&quot;
                }
              `}
            >
              {isCustomizing
                ? &quot;Using Custom Permissions&quot;
                : &quot;Use Role Default Permissions&quot;}
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
          <div className=&quot;text-sm text-gray-600 dark:text-gray-400 italic&quot;>
            User has the default permissions for their role.
          </div>
        )}

        <div className=&quot;mt-6 flex justify-end&quot;>
          <button
            type=&quot;button&quot;
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
                  ? &quot;opacity-50 cursor-not-allowed&quot;
                  : &quot;hover:bg-blue-700&quot;
              }
            `}
          >
            {isSaving ? &quot;Saving...&quot; : &quot;Save Changes&quot;}
          </button>
        </div>
      </div>
    </div>
  );
}
