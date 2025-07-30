&quot;use client&quot;;

import React, { useState, useMemo } from &quot;react&quot;;
import SidebarLayout from &quot;@/components/SidebarLayout&quot;;
import ErrorBoundary from &quot;../../components/ErrorBoundary&quot;;
import { USER_ROLES } from &quot;../../../shared/schema&quot;;
import {
  ApplicationFeatures,
  getAllFeatures,
  Feature,
  FeatureOperation,
  PERMISSION_SCOPES,
} from &quot;../../../shared/rbac/features&quot;;
import {
  getAllRoles,
  checkRoleHasPermission,
  RoleDefinition,
  ROLE_HIERARCHY,
} from &quot;../../../shared/rbac/roles&quot;;
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
} from &quot;lucide-react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useOrganization } from &quot;@/contexts/OrganizationProvider&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;

// Tab options for the RBAC dashboard
type TabOption = &quot;feature-matrix&quot; | &quot;role-matrix&quot; | &quot;service-view&quot;;

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
    const parts = op.permission.split(&quot;:&quot;);
    return parts.length > 2 && parts[2] === PERMISSION_SCOPES.ORGANIZATION;
  });

  // Check if any of the permissions have region scope
  const hasRegionScopedPermissions = operations.some((op) => {
    const parts = op.permission.split(&quot;:&quot;);
    return parts.length > 2 && parts[2] === PERMISSION_SCOPES.REGION;
  });

  if (hasAnyPermission) {
    return (
      <div className=&quot;flex flex-col items-center&quot;>
        <span className=&quot;inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900&quot;>
          <Check className=&quot;h-4 w-4 text-green-700 dark:text-green-300&quot; />
        </span>

        {expanded && (
          <span className=&quot;text-xs text-gray-500 dark:text-gray-400 mt-1&quot;>
            {permissionCount}/{operations.length}
          </span>
        )}

        {/* Show organization context indicators if applicable */}
        <div className=&quot;flex gap-1 mt-1&quot;>
          {hasOrgScopedPermissions && (
            <div title=&quot;Has organization-scoped permissions&quot;>
              <Building2 className=&quot;h-3 w-3 text-blue-500&quot; />
            </div>
          )}

          {hasRegionScopedPermissions && (
            <div title=&quot;Has region-scoped permissions&quot;>
              <Globe className=&quot;h-3 w-3 text-purple-500&quot; />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <span className=&quot;inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900&quot;>
      <X className=&quot;h-4 w-4 text-red-700 dark:text-red-300&quot; />
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
  const permissionParts = permission.split(&quot;:&quot;);
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
      <div className=&quot;flex flex-col items-center&quot;>
        <span className=&quot;inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900&quot;>
          <Check className=&quot;h-4 w-4 text-green-700 dark:text-green-300&quot; />
        </span>

        {/* Display scope badge if applicable */}
        {hasScope && (
          <Badge
            variant=&quot;outline&quot;
            className={`mt-1 text-xs px-1 ${
              isOrgScoped
                ? &quot;border-blue-500 text-blue-600 dark:text-blue-400&quot;
                : isRegionScoped
                  ? &quot;border-purple-500 text-purple-600 dark:text-purple-400&quot;
                  : isOwnedScoped
                    ? &quot;border-amber-500 text-amber-600 dark:text-amber-400&quot;
                    : isAssignedScoped
                      ? &quot;border-teal-500 text-teal-600 dark:text-teal-400&quot;
                      : &quot;border-gray-500 text-gray-600 dark:text-gray-400&quot;
            }`}
          >
            {scope}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <span className=&quot;inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900&quot;>
      <X className=&quot;h-4 w-4 text-red-700 dark:text-red-300&quot; />
    </span>
  );
}

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState<TabOption>(&quot;feature-matrix&quot;);
  const [expandedFeatures, setExpandedFeatures] = useState<
    Record<string, boolean>
  >({});
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("&quot;);

  const allFeatures = useMemo(() => {
    try {
      const features = getAllFeatures();
      return Array.isArray(features) ? features : [];
    } catch (error) {
      console.error(&quot;Error loading features:&quot;, error);
      return [];
    }
  }, []);

  const allRoles = useMemo(() => {
    try {
      const roles = getAllRoles();
      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      console.error(&quot;Error loading roles:&quot;, error);
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
    const [action, resource] = permission.split(&quot;:&quot;);
    return (
      <span>
        <span className=&quot;font-medium&quot;>{action}</span>:
        <span className=&quot;text-primary&quot;>{resource}</span>
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
        <div className=&quot;p-6&quot;>
          <h1 className=&quot;text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100&quot;>
            Role-Based Access Control
          </h1>
          <p className=&quot;text-gray-600 dark:text-gray-400 mb-2&quot;>
            Visualize and manage permissions across roles, features, and
            services
          </p>

          {/* Organization Context Info */}
          <div className=&quot;bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-6 border border-gray-200 dark:border-gray-700&quot;>
            <div className=&quot;flex flex-col md:flex-row md:items-center justify-between gap-4&quot;>
              <div>
                <h3 className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;>
                  Current Organization Context
                </h3>
                <div className=&quot;flex items-center gap-2&quot;>
                  <Building2 className=&quot;h-4 w-4 text-primary&quot; />
                  <span className=&quot;font-semibold&quot;>
                    {orgLoading
                      ? &quot;Loading...&quot;
                      : currentOrganization?.name || &quot;Global System Context&quot;}
                  </span>
                  {currentOrganization?.id && (
                    <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                      ID: {currentOrganization.id}
                    </Badge>
                  )}
                </div>
              </div>

              <div className=&quot;flex flex-wrap gap-3&quot;>
                <div className=&quot;flex items-center gap-1 text-xs&quot;>
                  <div className=&quot;w-3 h-3 rounded-full bg-blue-500&quot; />
                  <span>Organization Scope</span>
                </div>
                <div className=&quot;flex items-center gap-1 text-xs&quot;>
                  <div className=&quot;w-3 h-3 rounded-full bg-purple-500&quot; />
                  <span>Region Scope</span>
                </div>
                <div className=&quot;flex items-center gap-1 text-xs&quot;>
                  <div className=&quot;w-3 h-3 rounded-full bg-amber-500&quot; />
                  <span>Owned Scope</span>
                </div>
                <div className=&quot;flex items-center gap-1 text-xs&quot;>
                  <div className=&quot;w-3 h-3 rounded-full bg-teal-500&quot; />
                  <span>Assigned Scope</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className=&quot;flex flex-col md:flex-row gap-4 mb-6&quot;>
            <div className=&quot;relative&quot;>
              <div className=&quot;absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none&quot;>
                <Filter className=&quot;h-4 w-4 text-gray-400&quot; />
              </div>
              <select
                value={selectedService || &quot;&quot;}
                onChange={(e) => setSelectedService(e.target.value || null)}
                className=&quot;pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
              >
                <option value=&quot;&quot;>All Services</option>
                {services.map((service, index) => (
                  <option key={`service-${index}-${service}`} value={service}>
                    {service.charAt(0).toUpperCase() +
                      service.slice(1).replace(/-/g, &quot; &quot;)}
                  </option>
                ))}
              </select>
            </div>

            <div className=&quot;relative flex-grow&quot;>
              <input
                type=&quot;text&quot;
                placeholder=&quot;Search features, permissions...&quot;
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=&quot;pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className=&quot;border-b border-gray-200 dark:border-gray-700 mb-6&quot;>
            <div className=&quot;flex space-x-8&quot;>
              <button
                key=&quot;tab-feature-matrix&quot;
                onClick={() => setActiveTab(&quot;feature-matrix&quot;)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === &quot;feature-matrix&quot;
                    ? &quot;border-primary text-primary dark:text-primary-400&quot;
                    : &quot;border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300&quot;
                }`}
              >
                Feature Matrix
              </button>
              <button
                key=&quot;tab-role-matrix&quot;
                onClick={() => setActiveTab(&quot;role-matrix&quot;)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === &quot;role-matrix&quot;
                    ? &quot;border-primary text-primary dark:text-primary-400&quot;
                    : &quot;border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300&quot;
                }`}
              >
                Role Matrix
              </button>
              <button
                key=&quot;tab-service-view&quot;
                onClick={() => setActiveTab(&quot;service-view&quot;)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === &quot;service-view&quot;
                    ? &quot;border-primary text-primary dark:text-primary-400&quot;
                    : &quot;border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300&quot;
                }`}
              >
                Service View
              </button>
            </div>
          </div>

          {/* Feature Matrix View */}
          {activeTab === &quot;feature-matrix&quot; && (
            <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden&quot;>
              <div className=&quot;overflow-x-auto&quot;>
                <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                  <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                    <tr>
                      <th
                        scope=&quot;col&quot;
                        className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[300px]&quot;
                      >
                        Feature / Role
                      </th>
                      {allRoles.map((role, roleIndex) => (
                        <th
                          key={`role-header-${roleIndex}-${role.id}`}
                          scope=&quot;col&quot;
                          className=&quot;px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                    {filteredFeatures.map((feature) => (
                      <React.Fragment key={`feature-group-${feature.id}`}>
                        <tr className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;>
                          <td className=&quot;px-6 py-4&quot;>
                            <div className=&quot;flex items-start&quot;>
                              <button
                                onClick={() =>
                                  toggleFeatureExpansion(feature.id)
                                }
                                className=&quot;mr-2 mt-1 focus:outline-none&quot;
                              >
                                {expandedFeatures[feature.id] ? (
                                  <ChevronDown className=&quot;h-4 w-4 text-gray-500&quot; />
                                ) : (
                                  <ChevronRight className=&quot;h-4 w-4 text-gray-500&quot; />
                                )}
                              </button>
                              <div>
                                <div className=&quot;font-medium text-gray-900 dark:text-gray-100&quot;>
                                  {feature.name}
                                </div>
                                <div className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                                  {feature.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          {allRoles.map((role, roleIndex) => (
                            <td
                              key={`${feature.id}-${role.id}-${roleIndex}`}
                              className=&quot;px-6 py-4 text-center&quot;
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
                              className=&quot;bg-gray-50 dark:bg-gray-700&quot;
                            >
                              <td className=&quot;px-6 py-2 pl-12&quot;>
                                <div className=&quot;flex items-center&quot;>
                                  <div className=&quot;ml-2&quot;>
                                    <div className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300&quot;>
                                      {operation.name} -{&quot; &quot;}
                                      {formatPermission(operation.permission)}
                                    </div>
                                    <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                                      {operation.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {allRoles.map((role, roleIndex) => (
                                <td
                                  key={`${feature.id}-${operation.id}-${role.id}-${roleIndex}`}
                                  className=&quot;px-6 py-2 text-center&quot;
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
                                className=&quot;bg-gray-50 dark:bg-gray-700&quot;
                              >
                                <td className=&quot;px-6 py-3 pl-12&quot;>
                                  <div className=&quot;flex items-start&quot;>
                                    <button
                                      onClick={() =>
                                        toggleFeatureExpansion(subfeature.id)
                                      }
                                      className=&quot;mr-2 mt-1 focus:outline-none&quot;
                                    >
                                      {expandedFeatures[subfeature.id] ? (
                                        <ChevronDown className=&quot;h-4 w-4 text-gray-500&quot; />
                                      ) : (
                                        <ChevronRight className=&quot;h-4 w-4 text-gray-500&quot; />
                                      )}
                                    </button>
                                    <div>
                                      <div className=&quot;font-medium text-gray-700 dark:text-gray-300&quot;>
                                        {subfeature.name}
                                      </div>
                                      <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                                        {subfeature.description}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {allRoles.map((role, roleIndex) => (
                                  <td
                                    key={`${feature.id}-${subfeature.id}-${role.id}-${roleIndex}`}
                                    className=&quot;px-6 py-3 text-center&quot;
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
                                    className=&quot;bg-gray-100 dark:bg-gray-800&quot;
                                  >
                                    <td className=&quot;px-6 py-2 pl-20&quot;>
                                      <div className=&quot;flex items-center&quot;>
                                        <div className=&quot;ml-2&quot;>
                                          <div className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300&quot;>
                                            {operation.name} -{&quot; &quot;}
                                            {formatPermission(
                                              operation.permission,
                                            )}
                                          </div>
                                          <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                                            {operation.description}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    {allRoles.map((role, roleIndex) => (
                                      <td
                                        key={`${feature.id}-${subfeature.id}-${operation.id}-${role.id}-${roleIndex}`}
                                        className=&quot;px-6 py-2 text-center&quot;
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
                      <tr key=&quot;no-features-found&quot;>
                        <td
                          colSpan={allRoles.length + 1}
                          className=&quot;px-6 py-8 text-center&quot;
                        >
                          <div className=&quot;text-gray-500 dark:text-gray-400&quot;>
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
          {activeTab === &quot;role-matrix&quot; && (
            <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden&quot;>
              <div className=&quot;overflow-x-auto&quot;>
                <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                  <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                    <tr>
                      <th
                        scope=&quot;col&quot;
                        className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[250px]&quot;
                      >
                        Role
                      </th>
                      <th
                        scope=&quot;col&quot;
                        className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                      >
                        Description
                      </th>
                      <th
                        scope=&quot;col&quot;
                        className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                      >
                        Permissions
                      </th>
                      <th
                        scope=&quot;col&quot;
                        className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                      >
                        Inherits From
                      </th>
                    </tr>
                  </thead>
                  <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                    {allRoles.map((role, roleIndex) => (
                      <tr
                        key={`role-row-${roleIndex}-${role.id}`}
                        className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                      >
                        <td className=&quot;px-6 py-4&quot;>
                          <div className=&quot;font-medium text-gray-900 dark:text-gray-100&quot;>
                            {role.name}
                          </div>
                          <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                            {role.id}
                          </div>
                        </td>
                        <td className=&quot;px-6 py-4 text-sm text-gray-700 dark:text-gray-300&quot;>
                          {role.description}
                        </td>
                        <td className=&quot;px-6 py-4&quot;>
                          <div className=&quot;flex flex-wrap gap-1&quot;>
                            {role.permissions?.map((permission, permIndex) => (
                              <span
                                key={`${role.id}-perm-${permIndex}-${permission}`}
                                className=&quot;px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200&quot;
                              >
                                {permission}
                              </span>
                            ))}
                            {(!role.permissions ||
                              role.permissions.length === 0) && (
                              <span
                                key={`${role.id}-no-permissions`}
                                className=&quot;text-gray-500 dark:text-gray-400 text-sm&quot;
                              >
                                No direct permissions
                              </span>
                            )}
                          </div>
                        </td>
                        <td className=&quot;px-6 py-4&quot;>
                          <div className=&quot;flex flex-wrap gap-1&quot;>
                            {/* Display role inheritance using ROLE_HIERARCHY lookup */}
                            {(ROLE_HIERARCHY[role.id]?.length ?? 0) > 0 ? 
                              ROLE_HIERARCHY[role.id]?.map(
                              (parentRole: string, inheritIndex) => (
                                <span
                                  key={`${role.id}-inherits-${inheritIndex}-${parentRole}`}
                                  className=&quot;px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200&quot;
                                >
                                  {parentRole}
                                </span>
                              ),
                            ) : null}
                            {(ROLE_HIERARCHY[role.id]?.length ?? 0) === 0 && (
                              <span
                                key={`${role.id}-no-inheritance`}
                                className=&quot;text-gray-500 dark:text-gray-400 text-sm&quot;
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
          {activeTab === &quot;service-view&quot; && (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
              {services.map((service, serviceIndex) => (
                <div
                  key={`service-card-${serviceIndex}-${service}`}
                  className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700&quot;
                >
                  <div className=&quot;p-6&quot;>
                    <div className=&quot;flex items-center mb-4&quot;>
                      <div className=&quot;p-2 rounded-md bg-blue-100 dark:bg-blue-900 mr-4&quot;>
                        {service === &quot;core&quot; ? (
                          <Settings className=&quot;h-6 w-6 text-blue-700 dark:text-blue-300&quot; />
                        ) : (
                          <Database className=&quot;h-6 w-6 text-blue-700 dark:text-blue-300&quot; />
                        )}
                      </div>
                      <div>
                        <h3 className=&quot;text-lg font-semibold text-gray-900 dark:text-gray-100&quot;>
                          {service.charAt(0).toUpperCase() +
                            service.slice(1).replace(/-/g, &quot; &quot;)}
                        </h3>
                        <p className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                          {
                            allFeatures.filter((f) => f.service === service)
                              .length
                          }{&quot; &quot;}
                          features
                        </p>
                      </div>
                    </div>

                    <div className=&quot;space-y-4&quot;>
                      {allFeatures
                        .filter((f) => f.service === service)
                        .map((feature, featureIndex) => (
                          <div
                            key={`${service}-feature-${featureIndex}-${feature.id}`}
                            className=&quot;border-t border-gray-100 dark:border-gray-700 pt-4&quot;
                          >
                            <h4 className=&quot;font-medium text-gray-900 dark:text-gray-100 mb-1&quot;>
                              {feature.name}
                            </h4>
                            <p className=&quot;text-sm text-gray-500 dark:text-gray-400 mb-2&quot;>
                              {feature.description}
                            </p>

                            <div className=&quot;space-y-1&quot;>
                              {feature.operations?.map((op, opIndex) => (
                                <div
                                  key={`${feature.id}-${op.id}-${opIndex}`}
                                  className=&quot;text-xs flex items-center&quot;
                                >
                                  <span className=&quot;w-20 text-gray-700 dark:text-gray-300&quot;>
                                    {op.name}:
                                  </span>
                                  <span className=&quot;text-primary">
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
