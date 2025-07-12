"use client";

import React, { useState, useMemo } from "react";
import SidebarLayout from "@/app/components/SidebarLayout";
import ErrorBoundary from "../../components/ErrorBoundary";
import { USER_ROLES } from "../../../shared/schema";
import {
  ApplicationFeatures,
  getAllFeatures,
  Feature,
  FeatureOperation,
  PERMISSION_SCOPES,
} from "../../../shared/rbac/features";
import {
  getAllRoles,
  checkRoleHasPermission,
  RoleDefinition,
  ROLE_HIERARCHY,
} from "../../../shared/rbac/roles";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  X,
  Database,
  Settings,
  Building2,
  Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationProvider";
import { Badge } from "@/components/ui/badge";

// Tab options for the RBAC dashboard
type TabOption = "feature-matrix" | "role-matrix" | "service-view";

// Component for displaying role-feature access status
function RoleFeatureAccess({
  role,
  feature,
  expanded,
}: {
  role: RoleDefinition;
  feature: Feature;
  expanded: boolean;
}) {
  const { currentOrganization } = useOrganization();

  // If feature operations is undefined, initialize it as empty array
  const operations = feature?.operations || [];

  // Check if role has any permission for this feature
  const hasAnyPermission = operations.some((op) =>
    checkRoleHasPermission(role.id, op.permission),
  );

  // Count how many permissions the role has for this feature
  const permissionCount = operations.filter((op) =>
    checkRoleHasPermission(role.id, op.permission),
  ).length;

  // Check if any of the permissions have organization scope
  const hasOrgScopedPermissions = operations.some((op) => {
    const parts = op.permission.split(":");
    return parts.length > 2 && parts[2] === PERMISSION_SCOPES.ORGANIZATION;
  });

  // Check if any of the permissions have region scope
  const hasRegionScopedPermissions = operations.some((op) => {
    const parts = op.permission.split(":");
    return parts.length > 2 && parts[2] === PERMISSION_SCOPES.REGION;
  });

  if (hasAnyPermission) {
    return (
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-4 w-4 text-green-700 dark:text-green-300" />
        </span>

        {expanded && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {permissionCount}/{operations.length}
          </span>
        )}

        {/* Show organization context indicators if applicable */}
        <div className="flex gap-1 mt-1">
          {hasOrgScopedPermissions && (
            <div title="Has organization-scoped permissions">
              <Building2 className="h-3 w-3 text-blue-500" />
            </div>
          )}

          {hasRegionScopedPermissions && (
            <div title="Has region-scoped permissions">
              <Globe className="h-3 w-3 text-purple-500" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
      <X className="h-4 w-4 text-red-700 dark:text-red-300" />
    </span>
  );
}

// Component for checking individual permissions
function PermissionCheck({
  permission,
  roleId,
}: {
  permission: string;
  roleId: string;
}) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  // Parse the permission to check if it has a scope
  const permissionParts = permission.split(":");
  const hasScope = permissionParts.length > 2;
  const scope = hasScope ? permissionParts[2] : undefined;

  // Check if the role has the permission
  const hasPermission = checkRoleHasPermission(roleId, permission);

  // Determine if this permission is organization-scoped
  const isOrgScoped = scope === PERMISSION_SCOPES.ORGANIZATION;
  const isRegionScoped = scope === PERMISSION_SCOPES.REGION;
  const isOwnedScoped = scope === PERMISSION_SCOPES.OWNED;
  const isAssignedScoped = scope === PERMISSION_SCOPES.ASSIGNED;

  if (hasPermission) {
    return (
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-4 w-4 text-green-700 dark:text-green-300" />
        </span>

        {/* Display scope badge if applicable */}
        {hasScope && (
          <Badge
            variant="outline"
            className={`mt-1 text-xs px-1 ${
              isOrgScoped
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : isRegionScoped
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : isOwnedScoped
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : isAssignedScoped
                      ? "border-teal-500 text-teal-600 dark:text-teal-400"
                      : "border-gray-500 text-gray-600 dark:text-gray-400"
            }`}
          >
            {scope}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
      <X className="h-4 w-4 text-red-700 dark:text-red-300" />
    </span>
  );
}

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("feature-matrix");
  const [expandedFeatures, setExpandedFeatures] = useState<
    Record<string, boolean>
  >({});
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allFeatures = useMemo(() => {
    try {
      const features = getAllFeatures();
      return Array.isArray(features) ? features : [];
    } catch (error) {
      console.error("Error loading features:", error);
      return [];
    }
  }, []);

  const allRoles = useMemo(() => {
    try {
      const roles = getAllRoles();
      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      console.error("Error loading roles:", error);
      return [];
    }
  }, []);

  // Filter features by service or search query
  const filteredFeatures = useMemo(() => {
    if (!Array.isArray(allFeatures)) return [];

    let features = allFeatures;

    if (selectedService) {
      features = features.filter(
        (feature) => feature?.service === selectedService,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      features = features.filter(
        (feature) =>
          feature?.name?.toLowerCase().includes(query) ||
          feature?.description?.toLowerCase().includes(query) ||
          (Array.isArray(feature?.operations) &&
            feature.operations.some((op) =>
              op?.permission?.toLowerCase().includes(query),
            )),
      );
    }

    return features;
  }, [allFeatures, selectedService, searchQuery]);

  // Get unique services from all features
  const services = useMemo(() => {
    const serviceSet = new Set<string>();
    if (Array.isArray(allFeatures)) {
      allFeatures.forEach((feature) => serviceSet.add(feature.service));
    }
    return Array.from(serviceSet).sort();
  }, [allFeatures]);

  // Toggle feature expansion
  const toggleFeatureExpansion = (featureId: string) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [featureId]: !prev[featureId],
    }));
  };

  // Format permission string for display
  const formatPermission = (permission: string) => {
    const [action, resource] = permission.split(":");
    return (
      <span>
        <span className="font-medium">{action}</span>:
        <span className="text-primary">{resource}</span>
      </span>
    );
  };

  // Get user and organization context
  const { user } = useAuth();
  const {
    currentOrganization,
    userOrganizations,
    isLoading: orgLoading,
  } = useOrganization();

  return (
    <ErrorBoundary>
      <SidebarLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Role-Based Access Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Visualize and manage permissions across roles, features, and
            services
          </p>

          {/* Organization Context Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Organization Context
                </h3>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {orgLoading
                      ? "Loading..."
                      : currentOrganization?.name || "Global System Context"}
                  </span>
                  {currentOrganization?.id && (
                    <Badge variant="outline" className="text-xs">
                      ID: {currentOrganization.id}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Organization Scope</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Region Scope</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Owned Scope</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span>Assigned Scope</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedService || ""}
                onChange={(e) => setSelectedService(e.target.value || null)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Services</option>
                {services.map((service, index) => (
                  <option key={`service-${index}-${service}`} value={service}>
                    {service.charAt(0).toUpperCase() +
                      service.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search features, permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex space-x-8">
              <button
                key="tab-feature-matrix"
                onClick={() => setActiveTab("feature-matrix")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "feature-matrix"
                    ? "border-primary text-primary dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Feature Matrix
              </button>
              <button
                key="tab-role-matrix"
                onClick={() => setActiveTab("role-matrix")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "role-matrix"
                    ? "border-primary text-primary dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Role Matrix
              </button>
              <button
                key="tab-service-view"
                onClick={() => setActiveTab("service-view")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "service-view"
                    ? "border-primary text-primary dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Service View
              </button>
            </div>
          </div>

          {/* Feature Matrix View */}
          {activeTab === "feature-matrix" && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[300px]"
                      >
                        Feature / Role
                      </th>
                      {allRoles.map((role, roleIndex) => (
                        <th
                          key={`role-header-${roleIndex}-${role.id}`}
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFeatures.map((feature) => (
                      <React.Fragment key={`feature-group-${feature.id}`}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-start">
                              <button
                                onClick={() =>
                                  toggleFeatureExpansion(feature.id)
                                }
                                className="mr-2 mt-1 focus:outline-none"
                              >
                                {expandedFeatures[feature.id] ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                              </button>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {feature.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {feature.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          {allRoles.map((role, roleIndex) => (
                            <td
                              key={`${feature.id}-${role.id}-${roleIndex}`}
                              className="px-6 py-4 text-center"
                            >
                              <RoleFeatureAccess
                                role={role}
                                feature={feature}
                                expanded={false}
                              />
                            </td>
                          ))}
                        </tr>

                        {/* Expanded feature operations */}
                        {expandedFeatures[feature.id] &&
                          feature.operations?.map((operation) => (
                            <tr
                              key={`${feature.id}-${operation.id}`}
                              className="bg-gray-50 dark:bg-gray-700"
                            >
                              <td className="px-6 py-2 pl-12">
                                <div className="flex items-center">
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {operation.name} -{" "}
                                      {formatPermission(operation.permission)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {operation.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {allRoles.map((role, roleIndex) => (
                                <td
                                  key={`${feature.id}-${operation.id}-${role.id}-${roleIndex}`}
                                  className="px-6 py-2 text-center"
                                >
                                  <PermissionCheck
                                    permission={operation.permission}
                                    roleId={role.id}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}

                        {/* Subfeatures */}
                        {expandedFeatures[feature.id] &&
                          feature.subFeatures?.map((subfeature) => (
                            <React.Fragment
                              key={`subfeature-group-${feature.id}-${subfeature.id}`}
                            >
                              <tr
                                key={`subfeature-${feature.id}-${subfeature.id}`}
                                className="bg-gray-50 dark:bg-gray-700"
                              >
                                <td className="px-6 py-3 pl-12">
                                  <div className="flex items-start">
                                    <button
                                      onClick={() =>
                                        toggleFeatureExpansion(subfeature.id)
                                      }
                                      className="mr-2 mt-1 focus:outline-none"
                                    >
                                      {expandedFeatures[subfeature.id] ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                      )}
                                    </button>
                                    <div>
                                      <div className="font-medium text-gray-700 dark:text-gray-300">
                                        {subfeature.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {subfeature.description}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {allRoles.map((role, roleIndex) => (
                                  <td
                                    key={`${feature.id}-${subfeature.id}-${role.id}-${roleIndex}`}
                                    className="px-6 py-3 text-center"
                                  >
                                    <RoleFeatureAccess
                                      role={role}
                                      feature={subfeature}
                                      expanded={false}
                                    />
                                  </td>
                                ))}
                              </tr>

                              {/* Expanded subfeature operations */}
                              {expandedFeatures[subfeature.id] &&
                                subfeature.operations?.map((operation) => (
                                  <tr
                                    key={`${feature.id}-${subfeature.id}-${operation.id}`}
                                    className="bg-gray-100 dark:bg-gray-800"
                                  >
                                    <td className="px-6 py-2 pl-20">
                                      <div className="flex items-center">
                                        <div className="ml-2">
                                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {operation.name} -{" "}
                                            {formatPermission(
                                              operation.permission,
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {operation.description}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    {allRoles.map((role, roleIndex) => (
                                      <td
                                        key={`${feature.id}-${subfeature.id}-${operation.id}-${role.id}-${roleIndex}`}
                                        className="px-6 py-2 text-center"
                                      >
                                        <PermissionCheck
                                          permission={operation.permission}
                                          roleId={role.id}
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                            </React.Fragment>
                          ))}
                      </React.Fragment>
                    ))}

                    {filteredFeatures.length === 0 && (
                      <tr key="no-features-found">
                        <td
                          colSpan={allRoles.length + 1}
                          className="px-6 py-8 text-center"
                        >
                          <div className="text-gray-500 dark:text-gray-400">
                            No features found matching your criteria.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Role Matrix View */}
          {activeTab === "role-matrix" && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[250px]"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Permissions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Inherits From
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {allRoles.map((role, roleIndex) => (
                      <tr
                        key={`role-row-${roleIndex}-${role.id}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {role.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {role.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions?.map((permission, permIndex) => (
                              <span
                                key={`${role.id}-perm-${permIndex}-${permission}`}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              >
                                {permission}
                              </span>
                            ))}
                            {(!role.permissions ||
                              role.permissions.length === 0) && (
                              <span
                                key={`${role.id}-no-permissions`}
                                className="text-gray-500 dark:text-gray-400 text-sm"
                              >
                                No direct permissions
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {/* Display role inheritance using ROLE_HIERARCHY lookup */}
                            {(ROLE_HIERARCHY[role.id]?.length ?? 0) > 0 ? 
                              ROLE_HIERARCHY[role.id]?.map(
                              (parentRole: string, inheritIndex) => (
                                <span
                                  key={`${role.id}-inherits-${inheritIndex}-${parentRole}`}
                                  className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                >
                                  {parentRole}
                                </span>
                              ),
                            ) : null}
                            {(ROLE_HIERARCHY[role.id]?.length ?? 0) === 0 && (
                              <span
                                key={`${role.id}-no-inheritance`}
                                className="text-gray-500 dark:text-gray-400 text-sm"
                              >
                                No inheritance
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Service View */}
          {activeTab === "service-view" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service, serviceIndex) => (
                <div
                  key={`service-card-${serviceIndex}-${service}`}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 mr-4">
                        {service === "core" ? (
                          <Settings className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                        ) : (
                          <Database className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {service.charAt(0).toUpperCase() +
                            service.slice(1).replace(/-/g, " ")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {
                            allFeatures.filter((f) => f.service === service)
                              .length
                          }{" "}
                          features
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {allFeatures
                        .filter((f) => f.service === service)
                        .map((feature, featureIndex) => (
                          <div
                            key={`${service}-feature-${featureIndex}-${feature.id}`}
                            className="border-t border-gray-100 dark:border-gray-700 pt-4"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {feature.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {feature.description}
                            </p>

                            <div className="space-y-1">
                              {feature.operations?.map((op, opIndex) => (
                                <div
                                  key={`${feature.id}-${op.id}-${opIndex}`}
                                  className="text-xs flex items-center"
                                >
                                  <span className="w-20 text-gray-700 dark:text-gray-300">
                                    {op.name}:
                                  </span>
                                  <span className="text-primary">
                                    {op.permission}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarLayout>
    </ErrorBoundary>
  );
}
