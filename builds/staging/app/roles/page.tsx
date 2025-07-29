"use client";

import React, { useState } from "react";
import { RoleManager } from "../components/rbac/RoleManager";
import { PermissionsMatrix } from "../components/rbac/PermissionsMatrix";
import { USER_ROLES } from "../../shared/schema";
import { UserRole } from "../lib/rbac";

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<
    "role-manager" | "all-permissions" | "access-map"
  >("role-manager");

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Role Management</h1>
      <p className="text-muted-foreground">
        Configure and visualize roles and permissions in the system.
      </p>

      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 ${activeTab === "role-manager" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("role-manager")}
        >
          Role Manager
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "all-permissions" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("all-permissions")}
        >
          All Permissions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "access-map" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("access-map")}
        >
          Access Map
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "role-manager" && <RoleManager />}

        {activeTab === "all-permissions" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Full Permissions Matrix</h2>
            <p className="text-muted-foreground">
              View all permissions for all roles in the system.
            </p>

            <div className="flex space-x-4 items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary/80"
                  // Compact view state handling
                />
                <span>Compact view</span>
              </label>

              <label className="flex items-center space-x-2">
                <select
                  className="rounded border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                  // Role filter handling
                >
                  <option value="">All roles</option>
                  {Object.values(USER_ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <span>Filter by role</span>
              </label>
            </div>

            <PermissionsMatrix showAllRoles={true} />
          </div>
        )}

        {activeTab === "access-map" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Route Access Map</h2>
            <p className="text-muted-foreground">
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
      name: "User Management",
      routes: [
        "/users",
        "/users/create",
        "/users/edit",
        "/users/agents",
        "/users/managers",
        "/users/roles",
        "/users/activity",
      ],
    },
    {
      name: "Client Management",
      routes: [
        "/clients",
        "/clients/create",
        "/clients/edit",
        "/clients/billing",
      ],
    },
    {
      name: "Field Management",
      routes: [
        "/field",
        "/field/teams",
        "/field/regions",
        "/field/regions/assign",
      ],
    },
    {
      name: "Event Management",
      routes: ["/events", "/events/create", "/events/edit", "/events/approval"],
    },
    {
      name: "Kit Management",
      routes: ["/kits", "/kits/create", "/kits/edit", "/kits/assign"],
    },
    {
      name: "Marketing Management",
      routes: [
        "/marketing",
        "/marketing/create",
        "/marketing/edit",
        "/marketing/approve",
      ],
    },
    {
      name: "Agent Management",
      routes: [
        "/agents",
        "/agents/create",
        "/agents/edit",
        "/agents/assign",
        "/agents/performance",
      ],
    },
    {
      name: "Dispensary Management",
      routes: [
        "/dispensaries",
        "/dispensaries/create",
        "/dispensaries/edit",
        "/dispensaries/assign",
      ],
    },
    {
      name: "Scheduling",
      routes: [
        "/scheduling",
        "/scheduling/calendar",
        "/scheduling/appointments",
        "/scheduling/manage",
      ],
    },
    {
      name: "Reports",
      routes: ["/reports", "/reports/create", "/reports/edit"],
    },
    {
      name: "Administration",
      routes: [
        "/admin",
        "/admin/settings",
        "/admin/logs",
        "/admin/metrics",
        "/admin/configuration",
      ],
    },
  ];

  // This would be filled with actual logic to check permissions by route and role
  // For now we're just displaying the structure

  return (
    <div className="space-y-6">
      {routeGroups.map((group, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">{group.name}</h3>
          <div className="space-y-2">
            {group.routes.map((route, routeIndex) => (
              <div
                key={routeIndex}
                className="py-2 px-4 bg-gray-50 rounded flex justify-between"
              >
                <span className="font-mono text-sm">{route}</span>
                <div className="flex space-x-2">
                  {/* This is where role access indicators would be shown */}
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    {route.includes("create") ||
                    route.includes("edit") ||
                    route.includes("delete")
                      ? "Admin+ only"
                      : route.includes("admin")
                        ? "Super Admin only"
                        : "Varies by role"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <p className="text-yellow-800 text-sm">
          Note: This is a visual representation of route access. The actual
          permissions are enforced by the authorization middleware.
        </p>
      </div>
    </div>
  );
}
