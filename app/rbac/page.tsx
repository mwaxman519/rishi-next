&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { USER_ROLES } from &quot;../../shared/schema&quot;;
import SidebarLayout from &quot;../components/SidebarLayout&quot;;
import { ROLES, routePermissions, getUserPermissions } from &quot;../lib/rbac&quot;;

export default function RBACVisualizationPage() {
  const [activeTab, setActiveTab] = useState<&quot;routes&quot; | &quot;permissions&quot;>(
    &quot;routes&quot;,
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
      <div className=&quot;p-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100&quot;>
          RBAC Visualization
        </h1>

        <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8&quot;>
          <div className=&quot;mb-6&quot;>
            <label
              htmlFor=&quot;role-select&quot;
              className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2&quot;
            >
              Select Role
            </label>
            <select
              id=&quot;role-select&quot;
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className=&quot;w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
            >
              {allRoles.map((role: string) => (
                <option key={role} value={role}>
                  {role
                    .split(&quot;_&quot;)
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(&quot; &quot;)}
                </option>
              ))}
            </select>
          </div>

          <div className=&quot;flex border-b border-gray-200 dark:border-gray-700 mb-6&quot;>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === &quot;routes&quot;
                  ? &quot;border-b-2 border-primary text-primary dark:text-primary-400&quot;
                  : &quot;text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300&quot;
              }`}
              onClick={() => setActiveTab(&quot;routes&quot;)}
            >
              Route Access
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === &quot;permissions&quot;
                  ? &quot;border-b-2 border-primary text-primary dark:text-primary-400&quot;
                  : &quot;text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300&quot;
              }`}
              onClick={() => setActiveTab(&quot;permissions&quot;)}
            >
              Permissions
            </button>
          </div>

          {activeTab === &quot;routes&quot; ? (
            <div>
              <h2 className=&quot;text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200&quot;>
                Routes Access for{&quot; &quot;}
                {selectedRole
                  .split(&quot;_&quot;)
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(&quot; &quot;)}
              </h2>

              <div className=&quot;overflow-x-auto&quot;>
                <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                  <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                    <tr>
                      <th className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                        Route
                      </th>
                      <th className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                        Required Permission
                      </th>
                      <th className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
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
                          <td className=&quot;px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                            {route}
                          </td>
                          <td className=&quot;px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300&quot;>
                            {Array.isArray(requiredPermissions)
                              ? requiredPermissions.join(&quot;, &quot;)
                              : &quot;None&quot;}
                          </td>
                          <td className=&quot;px-6 py-4 whitespace-nowrap&quot;>
                            {hasAccess ? (
                              <span className=&quot;px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200&quot;>
                                Allowed
                              </span>
                            ) : (
                              <span className=&quot;px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200&quot;>
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
              <h2 className=&quot;text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200&quot;>
                Permissions for{&quot; &quot;}
                {selectedRole
                  .split(&quot;_&quot;)
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(&quot; &quot;)}
              </h2>

              <div className=&quot;overflow-x-auto&quot;>
                <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                  <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                    <tr>
                      <th className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                        Permission
                      </th>
                      <th className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                    {allPermissions.map((permission: string) => {
                      const userPermissions = getUserPermissions([
                        selectedRole,
                      ]);
                      const hasAccess = userPermissions.includes(permission);

                      return (
                        <tr key={permission}>
                          <td className=&quot;px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                            {permission}
                          </td>
                          <td className=&quot;px-6 py-4 whitespace-nowrap&quot;>
                            {hasAccess ? (
                              <span className=&quot;px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200&quot;>
                                Allowed
                              </span>
                            ) : (
                              <span className=&quot;px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200&quot;>
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

        <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg p-6&quot;>
          <h2 className=&quot;text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200&quot;>
            Permission Matrix
          </h2>

          <div className=&quot;overflow-x-auto&quot;>
            <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
              <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                <tr>
                  <th className=&quot;px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;>
                    Role / Permission
                  </th>
                  {allPermissions
                    .filter(
                      (p) =>
                        p.startsWith(&quot;read:&quot;) ||
                        p.startsWith(&quot;create:&quot;) ||
                        p.startsWith(&quot;update:&quot;) ||
                        p.startsWith(&quot;delete:&quot;) ||
                        p.startsWith(&quot;manage:&quot;),
                    )
                    .map((permission) => (
                      <th
                        key={permission}
                        className=&quot;px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                      >
                        {permission}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                {allRoles.map((role: string) => (
                  <tr key={role}>
                    <td className=&quot;px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                      {role
                        .split(&quot;_&quot;)
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(&quot; &quot;)}
                    </td>
                    {allPermissions
                      .filter(
                        (p: string) =>
                          p.startsWith(&quot;read:&quot;) ||
                          p.startsWith(&quot;create:&quot;) ||
                          p.startsWith(&quot;update:&quot;) ||
                          p.startsWith(&quot;delete:&quot;) ||
                          p.startsWith(&quot;manage:&quot;),
                      )
                      .map((permission: string) => {
                        const userPermissions = getUserPermissions([role]);
                        const hasAccess = userPermissions.includes(permission);
                        return (
                          <td
                            key={`${role}-${permission}`}
                            className=&quot;px-3 py-4 whitespace-nowrap text-center&quot;
                          >
                            {hasAccess ? (
                              <span className=&quot;inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 dark:bg-green-900&quot;>
                                <span className=&quot;text-xs text-green-800 dark:text-green-200&quot;>
                                  ✓
                                </span>
                              </span>
                            ) : (
                              <span className=&quot;inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 dark:bg-red-900&quot;>
                                <span className=&quot;text-xs text-red-800 dark:text-red-200&quot;>
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
