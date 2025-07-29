"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useEffect, useState } from "react";
import { USER_ROLES } from "../../shared/schema";
import SidebarLayout from "../components/SidebarLayout";
import { ROLES, routePermissions, getUserPermissions } from "../lib/rbac";

export default function RBACVisualizationPage() {
  const [activeTab, setActiveTab] = useState<"routes" | "permissions">(
    "routes",
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    USER_ROLES.SUPER_ADMIN,
  );

  const allRoles = Object.values(USER_ROLES);
  const allRoutes = Object.keys(routePermissions).sort();

  // Get all permissions synchronously
  const getAllPermissionsSync = () => {
    const allPermissions = new Set<string>();
    Object.values(ROLES).forEach((role) => {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach((permission) =>
          allPermissions.add(permission),
        );
      }
    });
    return Array.from(allPermissions);
  };

  const allPermissions = getAllPermissionsSync().sort();

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          RBAC Visualization
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label
              htmlFor="role-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Role
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              {allRoles.map((role: string) => (
                <option key={role} value={role}>
                  {role
                    .split("_")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "routes"
                  ? "border-b-2 border-primary text-primary dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("routes")}
            >
              Route Access
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "permissions"
                  ? "border-b-2 border-primary text-primary dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("permissions")}
            >
              Permissions
            </button>
          </div>

          {activeTab === "routes" ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Routes Access for{" "}
                {selectedRole
                  .split("_")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(" ")}
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Required Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {allRoutes.map((route: string) => {
                      const requiredPermissions = routePermissions[route] || [];
                      const userPermissions = getUserPermissions([
                        selectedRole,
                      ]);
                      const hasAccess =
                        requiredPermissions.length === 0 ||
                        requiredPermissions.some((perm: string) =>
                          userPermissions.includes(perm),
                        );

                      return (
                        <tr key={route}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {route}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {Array.isArray(requiredPermissions)
                              ? requiredPermissions.join(", ")
                              : "None"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasAccess ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Allowed
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                Denied
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Permissions for{" "}
                {selectedRole
                  .split("_")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(" ")}
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {allPermissions.map((permission: string) => {
                      const userPermissions = getUserPermissions([
                        selectedRole,
                      ]);
                      const hasAccess = userPermissions.includes(permission);

                      return (
                        <tr key={permission}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {permission}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasAccess ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Allowed
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                Denied
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Permission Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role / Permission
                  </th>
                  {allPermissions
                    .filter(
                      (p) =>
                        p.startsWith("read:") ||
                        p.startsWith("create:") ||
                        p.startsWith("update:") ||
                        p.startsWith("delete:") ||
                        p.startsWith("manage:"),
                    )
                    .map((permission) => (
                      <th
                        key={permission}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {permission}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allRoles.map((role: string) => (
                  <tr key={role}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {role
                        .split("_")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </td>
                    {allPermissions
                      .filter(
                        (p: string) =>
                          p.startsWith("read:") ||
                          p.startsWith("create:") ||
                          p.startsWith("update:") ||
                          p.startsWith("delete:") ||
                          p.startsWith("manage:"),
                      )
                      .map((permission: string) => {
                        const userPermissions = getUserPermissions([role]);
                        const hasAccess = userPermissions.includes(permission);
                        return (
                          <td
                            key={`${role}-${permission}`}
                            className="px-3 py-4 whitespace-nowrap text-center"
                          >
                            {hasAccess ? (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 dark:bg-green-900">
                                <span className="text-xs text-green-800 dark:text-green-200">
                                  ✓
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 dark:bg-red-900">
                                <span className="text-xs text-red-800 dark:text-red-200">
                                  ✗
                                </span>
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
      </div>
    </SidebarLayout>
  );
}
