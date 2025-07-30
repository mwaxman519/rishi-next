&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import SidebarLayout from &quot;@/components/SidebarLayout&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import {
  ArrowLeft,
  Check,
  X,
  Save,
  Shield,
  User,
  Filter,
  RefreshCw,
  AlertCircle,
} from &quot;lucide-react&quot;;
import {
  ApplicationFeatures,
  getAllFeatures,
  Feature,
} from &quot;../../../../../shared/rbac/features&quot;;
import { getAllRoles } from &quot;../../../../../shared/rbac/roles&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;@/components/ui/tabs-fixed&quot;;

type UserPermission = {
  permission: string;
  granted: boolean;
};

type UserWithPermissions = {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  profileImage: string | null;
  active: boolean;
  permissions: UserPermission[];
  overriddenPermissions: string[];
};

export default function UserPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Use React.use() to unwrap the params Promise in Next.js 15
  const resolvedParams = React.use(params);
  const userId = resolvedParams.id;

  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [dirtyPermissions, setDirtyPermissions] = useState<
    Record<string, boolean>
  >({});

  const allFeatures = getAllFeatures();
  const allRoles = getAllRoles();

  // Get unique services from all features
  const services = (() => {
    const serviceSet = new Set<string>();
    allFeatures.forEach((feature) => serviceSet.add(feature.service));
    return Array.from(serviceSet).sort();
  })();

  // Fetch user data and permissions - using a different pattern to avoid infinite loop
  useEffect(() => {
    // Create a function to fetch the data
    const fetchData = async () => {
      // Skip effect if essential data is missing or already loaded
      if (!userId || isAuthLoading || !user) return;
      if (userData) return; // Don't refetch if we already have data

      setLoading(true);
      setError(null);

      try {
        console.log(&quot;Fetching user data and permissions once&quot;);

        // First, fetch the basic user data
        const userResponse = await fetch(`/api/users/${userId}`);

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error(&quot;User not found&quot;);
          } else {
            throw new Error(&quot;Failed to fetch user details&quot;);
          }
        }

        const userDataResult = await userResponse.json();

        // Then, fetch user permissions
        const permissionsResponse = await fetch(
          `/api/users/${userId}/permissions`,
        );

        if (!permissionsResponse.ok) {
          // For now, proceed with empty permissions if the endpoint doesn&apos;t exist
          console.warn(
            &quot;Permission endpoint returned error:&quot;,
            permissionsResponse.status,
          );

          // Create permissions based on role for development
          const roleDefinition = allRoles.find(
            (r) => r.id === userDataResult.role,
          );
          const allPermissions: UserPermission[] = [];

          // Extract all possible permissions from features
          allFeatures.forEach((feature) => {
            feature.operations.forEach((op) => {
              const hasPermission =
                roleDefinition?.permissions.includes(op.permission) || false;
              allPermissions.push({
                permission: op.permission,
                granted: hasPermission,
              });
            });

            if (feature.subFeatures) {
              feature.subFeatures.forEach((subFeature) => {
                subFeature.operations.forEach((op) => {
                  const hasPermission =
                    roleDefinition?.permissions.includes(op.permission) ||
                    false;
                  allPermissions.push({
                    permission: op.permission,
                    granted: hasPermission,
                  });
                });
              });
            }
          });

          // Set user data with permissions
          setUserData({
            ...userDataResult,
            permissions: allPermissions,
            overriddenPermissions: [],
          });
        } else {
          // If the endpoint exists, use the returned data
          const permissionsData = await permissionsResponse.json();

          setUserData({
            ...userDataResult,
            permissions: permissionsData.permissions,
            overriddenPermissions: permissionsData.overriddenPermissions || [],
          });
        }
      } catch (err) {
        console.error(&quot;Error fetching user permissions:&quot;, err);
        setError(
          err instanceof Error ? err.message : &quot;An unknown error occurred&quot;,
        );

        toast({
          title: &quot;Error&quot;,
          description:
            err instanceof Error
              ? err.message
              : &quot;Failed to load user permissions&quot;,
          variant: &quot;destructive&quot;,
        });
      } finally {
        setLoading(false);
      }
    };

    // Call the function immediately
    fetchData();

    // We're not returning a cleanup function since we&apos;re using a one-time fetch
    // The dependencies array ensures this only runs when truly needed
  }, [userId, user, isAuthLoading, allFeatures, allRoles, toast]);

  // Filter features by service and search query
  const filteredFeatures = (() => {
    let features = allFeatures;

    if (selectedService) {
      features = features.filter(
        (feature) => feature.service === selectedService,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      features = features.filter(
        (feature) =>
          feature.name.toLowerCase().includes(query) ||
          feature.description.toLowerCase().includes(query) ||
          feature.operations.some((op) =>
            op.permission.toLowerCase().includes(query),
          ),
      );
    }

    return features;
  })();

  // Check if a permission is granted for the user
  const isPermissionGranted = (permission: string) => {
    if (permission in dirtyPermissions) {
      return dirtyPermissions[permission];
    }

    if (!userData) return false;

    const permissionObj = userData.permissions.find(
      (p) => p.permission === permission,
    );
    return permissionObj ? permissionObj.granted : false;
  };

  // Toggle a permission for the user
  const togglePermission = (permission: string) => {
    const currentValue = isPermissionGranted(permission);

    setDirtyPermissions((prev) => ({
      ...prev,
      [permission]: !currentValue,
    }));
  };

  // Check if a permission is overridden
  const isPermissionOverridden = (permission: string) => {
    if (!userData) return false;
    return userData.overriddenPermissions.includes(permission);
  };

  // Handle saving the changes
  const handleSaveChanges = async () => {
    if (!userData) return;

    setSaving(true);
    setError(null);

    try {
      // Format the permissions data
      const permissionsToUpdate = Object.entries(dirtyPermissions).map(
        ([permission, granted]) => ({
          permission,
          granted,
        }),
      );

      // Send the update to the API
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: &quot;PUT&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          permissions: permissionsToUpdate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || &quot;Failed to update permissions&quot;);
      }

      // Update the local state with the changes
      setUserData((prev) => {
        if (!prev) return null;

        const updatedPermissions = [...prev.permissions];

        // Update permissions
        Object.entries(dirtyPermissions).forEach(([permission, granted]) => {
          const permIndex = updatedPermissions.findIndex(
            (p) => p.permission === permission,
          );

          if (permIndex !== -1) {
            updatedPermissions[permIndex] = {
              permission,
              granted,
            };
          } else {
            updatedPermissions.push({
              permission,
              granted,
            });
          }
        });

        return {
          ...prev,
          permissions: updatedPermissions,
          overriddenPermissions: [
            ...prev.overriddenPermissions,
            ...Object.keys(dirtyPermissions).filter(
              (perm) => !prev.overriddenPermissions.includes(perm),
            ),
          ],
        };
      });

      // Clear dirty state
      setDirtyPermissions({});

      toast({
        title: &quot;Success&quot;,
        description: &quot;User permissions updated successfully&quot;,
        variant: &quot;default&quot;,
      });
    } catch (err) {
      console.error(&quot;Error updating permissions:&quot;, err);
      setError(
        err instanceof Error ? err.message : &quot;An unknown error occurred&quot;,
      );

      toast({
        title: &quot;Error&quot;,
        description:
          err instanceof Error ? err.message : &quot;Failed to update permissions&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle going back
  const handleBack = () => {
    // If there are unsaved changes, ask for confirmation
    if (Object.keys(dirtyPermissions).length > 0) {
      if (
        window.confirm(
          &quot;You have unsaved changes. Are you sure you want to go back?&quot;,
        )
      ) {
        router.push(&quot;/admin/rbac&quot;);
      }
    } else {
      router.push(&quot;/admin/rbac&quot;);
    }
  };

  // Group features by service
  const featuresByService = (() => {
    const grouped: Record<string, Feature[]> = {};

    filteredFeatures.forEach((feature) => {
      if (!grouped[feature.service]) {
        grouped[feature.service] = [];
      }
      grouped[feature.service]?.push(feature);
    });

    return grouped;
  })();

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

  // Reset permissions to role defaults
  const resetToRoleDefaults = () => {
    if (!userData) return;

    const roleDefinition = allRoles.find((r) => r.id === userData.role);
    if (!roleDefinition) return;

    const updatedDirtyPermissions: Record<string, boolean> = {};

    userData.permissions.forEach((permission) => {
      const shouldBeGranted = roleDefinition.permissions.includes(
        permission.permission,
      );
      if (permission.granted !== shouldBeGranted) {
        updatedDirtyPermissions[permission.permission] = shouldBeGranted;
      }
    });

    setDirtyPermissions(updatedDirtyPermissions);
  };

  // Show loading state while authentication is checking
  if (isAuthLoading) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6 flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
        </div>
      </SidebarLayout>
    );
  }

  // Check if user has permission to access this page
  if (!user || !checkPermission(&quot;edit:permissions&quot;)) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6&quot;>
          <h1 className=&quot;text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100&quot;>
            User Permissions
          </h1>
          <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded&quot;>
            <p className=&quot;text-red-700 dark:text-red-300&quot;>
              You don&apos;t have permission to manage user permissions.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className=&quot;p-6&quot;>
        {/* Header with back button and user info */}
        <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4&quot;>
          <div className=&quot;flex items-center&quot;>
            <button
              onClick={handleBack}
              className=&quot;mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors&quot;
            >
              <ArrowLeft className=&quot;h-5 w-5 text-gray-600 dark:text-gray-400&quot; />
            </button>
            <h1 className=&quot;text-2xl font-bold text-gray-900 dark:text-gray-100&quot;>
              User Permissions
            </h1>
          </div>

          {userData && (
            <div className=&quot;flex items-center&quot;>
              <div className=&quot;h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3&quot;>
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.username}
                    className=&quot;h-full w-full object-cover&quot;
                  />
                ) : (
                  <User className=&quot;h-6 w-6 text-gray-600 dark:text-gray-400&quot; />
                )}
              </div>
              <div>
                <div className=&quot;font-medium text-gray-900 dark:text-gray-100&quot;>
                  {userData.fullName || userData.username}
                </div>
                <div className=&quot;text-sm text-gray-500 dark:text-gray-400 flex items-center&quot;>
                  <Shield className=&quot;h-3 w-3 mr-1&quot; />
                  {userData.role
                    .replace(&quot;_&quot;, &quot; &quot;)
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className=&quot;flex justify-center items-center h-64&quot;>
            <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
          </div>
        ) : error ? (
          <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded&quot;>
            <h3 className=&quot;text-lg font-semibold text-red-800 dark:text-red-300 mb-2&quot;>
              Error
            </h3>
            <p className=&quot;text-red-700 dark:text-red-400&quot;>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className=&quot;mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition&quot;
            >
              Try Again
            </button>
          </div>
        ) : !userData ? (
          <div className=&quot;bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-6 rounded&quot;>
            <h3 className=&quot;text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2&quot;>
              User Not Found
            </h3>
            <p className=&quot;text-yellow-700 dark:text-yellow-400&quot;>
              The user you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <button
              onClick={handleBack}
              className=&quot;mt-4 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700&quot;
            >
              <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
              Back to RBAC Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Unsaved changes notice */}
            {Object.keys(dirtyPermissions).length > 0 && (
              <div className=&quot;mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded flex justify-between items-center&quot;>
                <div className=&quot;flex items-center&quot;>
                  <AlertCircle className=&quot;h-5 w-5 text-blue-500 mr-2&quot; />
                  <p className=&quot;text-blue-700 dark:text-blue-300&quot;>
                    You have unsaved permission changes.
                  </p>
                </div>
                <div className=&quot;flex space-x-2&quot;>
                  <button
                    onClick={() => setDirtyPermissions({})}
                    className=&quot;px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className=&quot;px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50&quot;
                  >
                    {saving ? &quot;Saving...&quot; : &quot;Save Changes&quot;}
                  </button>
                </div>
              </div>
            )}

            {/* Filters and Actions */}
            <div className=&quot;flex flex-col md:flex-row gap-4 mb-6&quot;>
              {/* Service filter */}
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
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service.charAt(0).toUpperCase() +
                        service.slice(1).replace(/-/g, &quot; &quot;)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className=&quot;relative flex-grow&quot;>
                <input
                  type=&quot;text&quot;
                  placeholder=&quot;Search permissions...&quot;
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=&quot;pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                />
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={resetToRoleDefaults}
                className=&quot;inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none&quot;
              >
                <RefreshCw className=&quot;mr-2 h-4 w-4&quot; />
                Reset to Role Defaults
              </button>

              {/* Save button */}
              <button
                onClick={handleSaveChanges}
                disabled={saving || Object.keys(dirtyPermissions).length === 0}
                className=&quot;inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50&quot;
              >
                {saving ? (
                  <div className=&quot;mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin&quot;></div>
                ) : (
                  <Save className=&quot;mr-2 h-4 w-4&quot; />
                )}
                Save Changes
              </button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue=&quot;by-service&quot; className=&quot;mb-6&quot;>
              <TabsList>
                <TabsTrigger value=&quot;by-service&quot;>By Service</TabsTrigger>
                <TabsTrigger value=&quot;by-permission&quot;>By Permission</TabsTrigger>
                <TabsTrigger value=&quot;overridden&quot;>Overridden</TabsTrigger>
              </TabsList>

              {/* By Service Tab */}
              <TabsContent value=&quot;by-service&quot;>
                <div className=&quot;space-y-6&quot;>
                  {Object.entries(featuresByService).map(
                    ([service, features]) => (
                      <div
                        key={service}
                        className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden&quot;
                      >
                        <div className=&quot;px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700&quot;>
                          <h3 className=&quot;text-lg font-medium text-gray-900 dark:text-gray-100&quot;>
                            {service.charAt(0).toUpperCase() +
                              service.slice(1).replace(/-/g, &quot; &quot;)}
                          </h3>
                        </div>

                        <div className=&quot;overflow-hidden&quot;>
                          <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                            <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                              <tr>
                                <th
                                  scope=&quot;col&quot;
                                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                                >
                                  Feature / Permission
                                </th>
                                <th
                                  scope=&quot;col&quot;
                                  className=&quot;px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                                >
                                  Access
                                </th>
                                <th
                                  scope=&quot;col&quot;
                                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                              {features.flatMap((feature) => [
                                // Feature header
                                <tr
                                  key={`feature-${feature.id}`}
                                  className=&quot;bg-gray-50 dark:bg-gray-900/30&quot;
                                >
                                  <td colSpan={3} className=&quot;px-6 py-3&quot;>
                                    <div className=&quot;font-medium text-gray-900 dark:text-gray-100&quot;>
                                      {feature.name}
                                    </div>
                                    <div className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                                      {feature.description}
                                    </div>
                                  </td>
                                </tr>,

                                // Feature operations
                                ...feature.operations.map((operation) => (
                                  <tr
                                    key={`operation-${feature.id}-${operation.id}`}
                                    className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                                  >
                                    <td className=&quot;px-6 py-4&quot;>
                                      <div className=&quot;text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                                        {operation.name}
                                      </div>
                                      <div className=&quot;text-xs text-gray-500 dark:text-gray-400 mt-1&quot;>
                                        {formatPermission(operation.permission)}{&quot; &quot;}
                                        <br />
                                        {operation.description}
                                      </div>
                                    </td>
                                    <td className=&quot;px-6 py-4 text-center&quot;>
                                      <button
                                        onClick={() =>
                                          togglePermission(operation.permission)
                                        }
                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                          isPermissionGranted(
                                            operation.permission,
                                          )
                                            ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
                                            : &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
                                        }`}
                                      >
                                        {isPermissionGranted(
                                          operation.permission,
                                        ) ? (
                                          <Check className=&quot;h-5 w-5&quot; />
                                        ) : (
                                          <X className=&quot;h-5 w-5&quot; />
                                        )}
                                      </button>
                                    </td>
                                    <td className=&quot;px-6 py-4&quot;>
                                      {isPermissionOverridden(
                                        operation.permission,
                                      ) ||
                                      operation.permission in
                                        dirtyPermissions ? (
                                        <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300&quot;>
                                          Overridden
                                        </span>
                                      ) : (
                                        <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300&quot;>
                                          Role Default
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                )),

                                // Subfeatures
                                ...(feature.subFeatures || []).flatMap(
                                  (subfeature) => [
                                    // Subfeature header
                                    <tr
                                      key={`subfeature-${feature.id}-${subfeature.id}`}
                                      className=&quot;bg-gray-100 dark:bg-gray-800/50&quot;
                                    >
                                      <td
                                        colSpan={3}
                                        className=&quot;px-6 py-3 pl-12&quot;
                                      >
                                        <div className=&quot;font-medium text-gray-800 dark:text-gray-200&quot;>
                                          {subfeature.name}
                                        </div>
                                        <div className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                                          {subfeature.description}
                                        </div>
                                      </td>
                                    </tr>,

                                    // Subfeature operations
                                    ...subfeature.operations.map(
                                      (operation) => (
                                        <tr
                                          key={`operation-${feature.id}-${subfeature.id}-${operation.id}`}
                                          className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                                        >
                                          <td className=&quot;px-6 py-4 pl-12&quot;>
                                            <div className=&quot;text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                                              {operation.name}
                                            </div>
                                            <div className=&quot;text-xs text-gray-500 dark:text-gray-400 mt-1&quot;>
                                              {formatPermission(
                                                operation.permission,
                                              )}{&quot; &quot;}
                                              <br />
                                              {operation.description}
                                            </div>
                                          </td>
                                          <td className=&quot;px-6 py-4 text-center&quot;>
                                            <button
                                              onClick={() =>
                                                togglePermission(
                                                  operation.permission,
                                                )
                                              }
                                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                                isPermissionGranted(
                                                  operation.permission,
                                                )
                                                  ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
                                                  : &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
                                              }`}
                                            >
                                              {isPermissionGranted(
                                                operation.permission,
                                              ) ? (
                                                <Check className=&quot;h-5 w-5&quot; />
                                              ) : (
                                                <X className=&quot;h-5 w-5&quot; />
                                              )}
                                            </button>
                                          </td>
                                          <td className=&quot;px-6 py-4&quot;>
                                            {isPermissionOverridden(
                                              operation.permission,
                                            ) ||
                                            operation.permission in
                                              dirtyPermissions ? (
                                              <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300&quot;>
                                                Overridden
                                              </span>
                                            ) : (
                                              <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300&quot;>
                                                Role Default
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ),
                                    ),
                                  ],
                                ),
                              ])}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ),
                  )}

                  {Object.keys(featuresByService).length === 0 && (
                    <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center&quot;>
                      <div className=&quot;text-gray-500 dark:text-gray-400&quot;>
                        No features found matching your criteria.
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* By Permission Tab */}
              <TabsContent value=&quot;by-permission&quot;>
                <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden&quot;>
                  <div className=&quot;overflow-hidden&quot;>
                    <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                      <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                        <tr>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                          >
                            Permission
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                          >
                            Feature
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                          >
                            Access
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                        {userData.permissions
                          .filter((p) => {
                            if (!searchQuery) return true;
                            return p.permission
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          })
                          .sort((a, b) =>
                            a.permission.localeCompare(b.permission),
                          )
                          .map((permission) => {
                            // Find the feature and operation for this permission
                            let featureName = &quot;&quot;;
                            let operationName = &quot;&quot;;
                            let service = &quot;&quot;;

                            for (const feature of allFeatures) {
                              // Check main feature operations
                              const operation = feature.operations.find(
                                (op) => op.permission === permission.permission,
                              );
                              if (operation) {
                                featureName = feature.name;
                                operationName = operation.name;
                                service = feature.service;
                                break;
                              }

                              // Check subfeature operations
                              if (feature.subFeatures) {
                                for (const subfeature of feature.subFeatures) {
                                  const subOperation =
                                    subfeature.operations.find(
                                      (op) =>
                                        op.permission === permission.permission,
                                    );
                                  if (subOperation) {
                                    featureName = `${feature.name} / ${subfeature.name}`;
                                    operationName = subOperation.name;
                                    service = feature.service;
                                    break;
                                  }
                                }
                                if (featureName) break;
                              }
                            }

                            return (
                              <tr
                                key={permission.permission}
                                className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                              >
                                <td className=&quot;px-6 py-4&quot;>
                                  <div className=&quot;text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                                    {formatPermission(permission.permission)}
                                  </div>
                                  <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                                    {operationName}
                                  </div>
                                </td>
                                <td className=&quot;px-6 py-4&quot;>
                                  <div className=&quot;text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                                    {featureName || &quot;Unknown Feature&quot;}
                                  </div>
                                  <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                                    {service && (
                                      <span className=&quot;inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200&quot;>
                                        {service.charAt(0).toUpperCase() +
                                          service.slice(1).replace(/-/g, &quot; &quot;)}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className=&quot;px-6 py-4 text-center&quot;>
                                  <button
                                    onClick={() =>
                                      togglePermission(permission.permission)
                                    }
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                      isPermissionGranted(permission.permission)
                                        ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
                                        : &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
                                    }`}
                                  >
                                    {isPermissionGranted(
                                      permission.permission,
                                    ) ? (
                                      <Check className=&quot;h-5 w-5&quot; />
                                    ) : (
                                      <X className=&quot;h-5 w-5&quot; />
                                    )}
                                  </button>
                                </td>
                                <td className=&quot;px-6 py-4&quot;>
                                  {isPermissionOverridden(
                                    permission.permission,
                                  ) ||
                                  permission.permission in dirtyPermissions ? (
                                    <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300&quot;>
                                      Overridden
                                    </span>
                                  ) : (
                                    <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300&quot;>
                                      Role Default
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        {userData.permissions.filter((p) => {
                          if (!searchQuery) return true;
                          return p.permission
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        }).length === 0 && (
                          <tr>
                            <td colSpan={4} className=&quot;px-6 py-8 text-center&quot;>
                              <div className=&quot;text-gray-500 dark:text-gray-400&quot;>
                                No permissions found matching your criteria.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Overridden Tab */}
              <TabsContent value=&quot;overridden&quot;>
                <div className=&quot;bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden&quot;>
                  <div className=&quot;overflow-hidden&quot;>
                    <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
                      <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
                        <tr>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                          >
                            Permission
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                          >
                            Role Default
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                          >
                            Current Access
                          </th>
                          <th
                            scope=&quot;col&quot;
                            className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24&quot;
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
                        {/* Filter for only overridden permissions or permissions in dirtyPermissions */}
                        {userData.permissions
                          .filter(
                            (p) =>
                              isPermissionOverridden(p.permission) ||
                              p.permission in dirtyPermissions,
                          )
                          .filter((p) => {
                            if (!searchQuery) return true;
                            return p.permission
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          })
                          .sort((a, b) =>
                            a.permission.localeCompare(b.permission),
                          )
                          .map((permission) => {
                            // Get the role default for this permission
                            const roleDefinition = allRoles.find(
                              (r) => r.id === userData.role,
                            );
                            const roleDefaultGranted =
                              roleDefinition?.permissions.includes(
                                permission.permission,
                              ) || false;

                            return (
                              <tr
                                key={permission.permission}
                                className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700&quot;
                              >
                                <td className=&quot;px-6 py-4&quot;>
                                  <div className=&quot;text-sm font-medium text-gray-900 dark:text-gray-100&quot;>
                                    {formatPermission(permission.permission)}
                                  </div>
                                </td>
                                <td className=&quot;px-6 py-4&quot;>
                                  <div
                                    className={`text-sm font-medium ${
                                      roleDefaultGranted
                                        ? &quot;text-green-600 dark:text-green-400&quot;
                                        : &quot;text-red-600 dark:text-red-400&quot;
                                    }`}
                                  >
                                    {roleDefaultGranted ? &quot;Granted&quot; : &quot;Denied&quot;}
                                  </div>
                                </td>
                                <td className=&quot;px-6 py-4 text-center&quot;>
                                  <button
                                    onClick={() =>
                                      togglePermission(permission.permission)
                                    }
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                      isPermissionGranted(permission.permission)
                                        ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
                                        : &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
                                    }`}
                                  >
                                    {isPermissionGranted(
                                      permission.permission,
                                    ) ? (
                                      <Check className=&quot;h-5 w-5&quot; />
                                    ) : (
                                      <X className=&quot;h-5 w-5&quot; />
                                    )}
                                  </button>
                                </td>
                                <td className=&quot;px-6 py-4&quot;>
                                  <button
                                    onClick={() => {
                                      // Reset this permission to role default
                                      setDirtyPermissions((prev) => ({
                                        ...prev,
                                        [permission.permission]:
                                          roleDefaultGranted,
                                      }));
                                    }}
                                    className=&quot;text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300&quot;
                                  >
                                    Reset to Default
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                        {userData.permissions
                          .filter(
                            (p) =>
                              isPermissionOverridden(p.permission) ||
                              p.permission in dirtyPermissions,
                          )
                          .filter((p) => {
                            if (!searchQuery) return true;
                            return p.permission
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          }).length === 0 && (
                          <tr>
                            <td colSpan={4} className=&quot;px-6 py-8 text-center&quot;>
                              <div className=&quot;text-gray-500 dark:text-gray-400&quot;>
                                No overridden permissions found.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

// Helper components
function RoleFeatureAccess({
  role,
  feature,
  expanded,
}: {
  role: any;
  feature: Feature;
  expanded: boolean;
}) {
  // Count how many operations this role has access to
  const totalOperations =
    feature.operations.length +
    (feature.subFeatures?.reduce(
      (sum, sub) => sum + sub.operations.length,
      0,
    ) || 0);

  const accessCount =
    feature.operations.filter((op) => role.permissions.includes(op.permission))
      .length +
    (feature.subFeatures?.reduce(
      (sum, sub) =>
        sum +
        sub.operations.filter((op) => role.permissions.includes(op.permission))
          .length,
      0,
    ) || 0);

  const accessPercentage =
    totalOperations > 0 ? Math.round((accessCount / totalOperations) * 100) : 0;

  return (
    <div className=&quot;flex flex-col items-center&quot;>
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
          accessCount === 0
            ? &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
            : accessCount === totalOperations
              ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
              : &quot;bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400&quot;
        }`}
      >
        {accessCount === 0 ? (
          <X className=&quot;h-5 w-5&quot; />
        ) : accessCount === totalOperations ? (
          <Check className=&quot;h-5 w-5&quot; />
        ) : (
          <span className=&quot;text-xs font-medium&quot;>{accessPercentage}%</span>
        )}
      </div>
      {expanded && (
        <div className=&quot;mt-1 text-xs text-gray-500 dark:text-gray-400&quot;>
          {accessCount}/{totalOperations}
        </div>
      )}
    </div>
  );
}

function PermissionCheck({
  permission,
  roleId,
}: {
  permission: string;
  roleId: string;
}) {
  const allRoles = getAllRoles();
  const role = allRoles.find((r) => r.id === roleId);
  const hasPermission = role?.permissions.includes(permission) || false;

  return (
    <div
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
        hasPermission
          ? &quot;bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400&quot;
          : &quot;bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400&quot;
      }`}
    >
      {hasPermission ? (
        <Check className=&quot;h-4 w-4&quot; />
      ) : (
        <X className=&quot;h-4 w-4" />
      )}
    </div>
  );
}
