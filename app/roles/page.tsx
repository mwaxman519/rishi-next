&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { RoleManager } from &quot;../components/rbac/RoleManager&quot;;
import { PermissionsMatrix } from &quot;../components/rbac/PermissionsMatrix&quot;;
import { USER_ROLES } from &quot;../../shared/schema&quot;;
import { UserRole } from &quot;../lib/rbac&quot;;

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<
    &quot;role-manager&quot; | &quot;all-permissions&quot; | &quot;access-map&quot;
  >(&quot;role-manager&quot;);

  return (
    <div className=&quot;container mx-auto py-8 space-y-6&quot;>
      <h1 className=&quot;text-3xl font-bold&quot;>Role Management</h1>
      <p className=&quot;text-muted-foreground&quot;>
        Configure and visualize roles and permissions in the system.
      </p>

      <div className=&quot;flex space-x-1 border-b&quot;>
        <button
          className={`px-4 py-2 ${activeTab === &quot;role-manager&quot; ? &quot;text-primary border-b-2 border-primary&quot; : &quot;text-muted-foreground&quot;}`}
          onClick={() => setActiveTab(&quot;role-manager&quot;)}
        >
          Role Manager
        </button>
        <button
          className={`px-4 py-2 ${activeTab === &quot;all-permissions&quot; ? &quot;text-primary border-b-2 border-primary&quot; : &quot;text-muted-foreground&quot;}`}
          onClick={() => setActiveTab(&quot;all-permissions&quot;)}
        >
          All Permissions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === &quot;access-map&quot; ? &quot;text-primary border-b-2 border-primary&quot; : &quot;text-muted-foreground&quot;}`}
          onClick={() => setActiveTab(&quot;access-map&quot;)}
        >
          Access Map
        </button>
      </div>

      <div className=&quot;pt-4&quot;>
        {activeTab === &quot;role-manager&quot; && <RoleManager />}

        {activeTab === &quot;all-permissions&quot; && (
          <div className=&quot;space-y-4&quot;>
            <h2 className=&quot;text-xl font-semibold&quot;>Full Permissions Matrix</h2>
            <p className=&quot;text-muted-foreground&quot;>
              View all permissions for all roles in the system.
            </p>

            <div className=&quot;flex space-x-4 items-center&quot;>
              <label className=&quot;flex items-center space-x-2&quot;>
                <input
                  type=&quot;checkbox&quot;
                  className=&quot;rounded border-gray-300 text-primary focus:ring-primary/80&quot;
                  // Compact view state handling
                />
                <span>Compact view</span>
              </label>

              <label className=&quot;flex items-center space-x-2&quot;>
                <select
                  className=&quot;rounded border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50&quot;
                  // Role filter handling
                >
                  <option value="&quot;>All roles</option>
                  {Object.values(USER_ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, &quot; &quot;)}
                    </option>
                  ))}
                </select>
                <span>Filter by role</span>
              </label>
            </div>

            <PermissionsMatrix showAllRoles={true} />
          </div>
        )}

        {activeTab === &quot;access-map&quot; && (
          <div className=&quot;space-y-4&quot;>
            <h2 className=&quot;text-xl font-semibold&quot;>Route Access Map</h2>
            <p className=&quot;text-muted-foreground&quot;>
              Visualize which roles have access to specific routes in the
              application.
            </p>

            <RouteAccessMap />
          </div>
        )}
      </div>
    </div>
  );
}

function RouteAccessMap() {
  // Define common route groups for visualization
  const routeGroups = [
    {
      name: &quot;User Management&quot;,
      routes: [
        &quot;/users&quot;,
        &quot;/users/create&quot;,
        &quot;/users/edit&quot;,
        &quot;/users/agents&quot;,
        &quot;/users/managers&quot;,
        &quot;/users/roles&quot;,
        &quot;/users/activity&quot;,
      ],
    },
    {
      name: &quot;Client Management&quot;,
      routes: [
        &quot;/clients&quot;,
        &quot;/clients/create&quot;,
        &quot;/clients/edit&quot;,
        &quot;/clients/billing&quot;,
      ],
    },
    {
      name: &quot;Field Management&quot;,
      routes: [
        &quot;/field&quot;,
        &quot;/field/teams&quot;,
        &quot;/field/regions&quot;,
        &quot;/field/regions/assign&quot;,
      ],
    },
    {
      name: &quot;Event Management&quot;,
      routes: [&quot;/events&quot;, &quot;/events/create&quot;, &quot;/events/edit&quot;, &quot;/events/approval&quot;],
    },
    {
      name: &quot;Kit Management&quot;,
      routes: [&quot;/kits&quot;, &quot;/kits/create&quot;, &quot;/kits/edit&quot;, &quot;/kits/assign&quot;],
    },
    {
      name: &quot;Marketing Management&quot;,
      routes: [
        &quot;/marketing&quot;,
        &quot;/marketing/create&quot;,
        &quot;/marketing/edit&quot;,
        &quot;/marketing/approve&quot;,
      ],
    },
    {
      name: &quot;Agent Management&quot;,
      routes: [
        &quot;/agents&quot;,
        &quot;/agents/create&quot;,
        &quot;/agents/edit&quot;,
        &quot;/agents/assign&quot;,
        &quot;/agents/performance&quot;,
      ],
    },
    {
      name: &quot;Dispensary Management&quot;,
      routes: [
        &quot;/dispensaries&quot;,
        &quot;/dispensaries/create&quot;,
        &quot;/dispensaries/edit&quot;,
        &quot;/dispensaries/assign&quot;,
      ],
    },
    {
      name: &quot;Scheduling&quot;,
      routes: [
        &quot;/scheduling&quot;,
        &quot;/scheduling/calendar&quot;,
        &quot;/scheduling/appointments&quot;,
        &quot;/scheduling/manage&quot;,
      ],
    },
    {
      name: &quot;Reports&quot;,
      routes: [&quot;/reports&quot;, &quot;/reports/create&quot;, &quot;/reports/edit&quot;],
    },
    {
      name: &quot;Administration&quot;,
      routes: [
        &quot;/admin&quot;,
        &quot;/admin/settings&quot;,
        &quot;/admin/logs&quot;,
        &quot;/admin/metrics&quot;,
        &quot;/admin/configuration&quot;,
      ],
    },
  ];

  // This would be filled with actual logic to check permissions by route and role
  // For now we&apos;re just displaying the structure

  return (
    <div className=&quot;space-y-6&quot;>
      {routeGroups.map((group, index) => (
        <div key={index} className=&quot;border rounded-lg p-4&quot;>
          <h3 className=&quot;text-lg font-medium mb-2&quot;>{group.name}</h3>
          <div className=&quot;space-y-2&quot;>
            {group.routes.map((route, routeIndex) => (
              <div
                key={routeIndex}
                className=&quot;py-2 px-4 bg-gray-50 rounded flex justify-between&quot;
              >
                <span className=&quot;font-mono text-sm&quot;>{route}</span>
                <div className=&quot;flex space-x-2&quot;>
                  {/* This is where role access indicators would be shown */}
                  <span className=&quot;text-xs px-2 py-1 bg-green-100 text-green-800 rounded&quot;>
                    {route.includes(&quot;create&quot;) ||
                    route.includes(&quot;edit&quot;) ||
                    route.includes(&quot;delete&quot;)
                      ? &quot;Admin+ only&quot;
                      : route.includes(&quot;admin&quot;)
                        ? &quot;Super Admin only&quot;
                        : &quot;Varies by role&quot;}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className=&quot;bg-yellow-50 border border-yellow-200 p-4 rounded-md&quot;>
        <p className=&quot;text-yellow-800 text-sm">
          Note: This is a visual representation of route access. The actual
          permissions are enforced by the authorization middleware.
        </p>
      </div>
    </div>
  );
}
