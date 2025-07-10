"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import {
  ApplicationFeatures,
  getAllFeatures,
  Feature,
} from "../../../../../shared/rbac/features";
import { getAllRoles } from "../../../../../shared/rbac/roles";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-fixed";

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
  const { user, isLoading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        console.log("Fetching user data and permissions once");

        // First, fetch the basic user data
        const userResponse = await fetch(`/api/users/${userId}`);

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error("User not found");
          } else {
            throw new Error("Failed to fetch user details");
          }
        }

        const userDataResult = await userResponse.json();

        // Then, fetch user permissions
        const permissionsResponse = await fetch(
          `/api/users/${userId}/permissions`,
        );

        if (!permissionsResponse.ok) {
          // For now, proceed with empty permissions if the endpoint doesn't exist
          console.warn(
            "Permission endpoint returned error:",
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
        console.error("Error fetching user permissions:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );

        toast({
          title: "Error",
          description:
            err instanceof Error
              ? err.message
              : "Failed to load user permissions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Call the function immediately
    fetchData();

    // We're not returning a cleanup function since we're using a one-time fetch
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: permissionsToUpdate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update permissions");
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
        title: "Success",
        description: "User permissions updated successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update permissions",
        variant: "destructive",
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
          "You have unsaved changes. Are you sure you want to go back?",
        )
      ) {
        router.push("/admin/rbac");
      }
    } else {
      router.push("/admin/rbac");
    }
  };

  // Group features by service
  const featuresByService = (() => {
    const grouped: Record<string, Feature[]> = {};

    filteredFeatures.forEach((feature) => {
      if (!grouped[feature.service]) {
        grouped[feature.service] = [];
      }
      grouped[feature.service].push(feature);
    });

    return grouped;
  })();

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
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </SidebarLayout>
    );
  }

  // Check if user has permission to access this page
  if (!user || !checkPermission("edit:permissions")) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            User Permissions
          </h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded">
            <p className="text-red-700 dark:text-red-300">
              You don't have permission to manage user permissions.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Header with back button and user info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              User Permissions
            </h1>
          </div>

          {userData && (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {userData.fullName || userData.username}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  {userData.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : !userData ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-6 rounded">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              User Not Found
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400">
              The user you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={handleBack}
              className="mt-4 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to RBAC Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Unsaved changes notice */}
            {Object.keys(dirtyPermissions).length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded flex justify-between items-center">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-blue-700 dark:text-blue-300">
                    You have unsaved permission changes.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDirtyPermissions({})}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Service filter */}
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
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service.charAt(0).toUpperCase() +
                        service.slice(1).replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={resetToRoleDefaults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Role Defaults
              </button>

              {/* Save button */}
              <button
                onClick={handleSaveChanges}
                disabled={saving || Object.keys(dirtyPermissions).length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50"
              >
                {saving ? (
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="by-service" className="mb-6">
              <TabsList>
                <TabsTrigger value="by-service">By Service</TabsTrigger>
                <TabsTrigger value="by-permission">By Permission</TabsTrigger>
                <TabsTrigger value="overridden">Overridden</TabsTrigger>
              </TabsList>

              {/* By Service Tab */}
              <TabsContent value="by-service">
                <div className="space-y-6">
                  {Object.entries(featuresByService).map(
                    ([service, features]) => (
                      <div
                        key={service}
                        className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {service.charAt(0).toUpperCase() +
                              service.slice(1).replace(/-/g, " ")}
                          </h3>
                        </div>

                        <div className="overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                  Feature / Permission
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                                >
                                  Access
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {features.flatMap((feature) => [
                                // Feature header
                                <tr
                                  key={`feature-${feature.id}`}
                                  className="bg-gray-50 dark:bg-gray-900/30"
                                >
                                  <td colSpan={3} className="px-6 py-3">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {feature.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {feature.description}
                                    </div>
                                  </td>
                                </tr>,

                                // Feature operations
                                ...feature.operations.map((operation) => (
                                  <tr
                                    key={`operation-${feature.id}-${operation.id}`}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {operation.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatPermission(operation.permission)}{" "}
                                        <br />
                                        {operation.description}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <button
                                        onClick={() =>
                                          togglePermission(operation.permission)
                                        }
                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                          isPermissionGranted(
                                            operation.permission,
                                          )
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                        }`}
                                      >
                                        {isPermissionGranted(
                                          operation.permission,
                                        ) ? (
                                          <Check className="h-5 w-5" />
                                        ) : (
                                          <X className="h-5 w-5" />
                                        )}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4">
                                      {isPermissionOverridden(
                                        operation.permission,
                                      ) ||
                                      operation.permission in
                                        dirtyPermissions ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                          Overridden
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
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
                                      className="bg-gray-100 dark:bg-gray-800/50"
                                    >
                                      <td
                                        colSpan={3}
                                        className="px-6 py-3 pl-12"
                                      >
                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                          {subfeature.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {subfeature.description}
                                        </div>
                                      </td>
                                    </tr>,

                                    // Subfeature operations
                                    ...subfeature.operations.map(
                                      (operation) => (
                                        <tr
                                          key={`operation-${feature.id}-${subfeature.id}-${operation.id}`}
                                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                          <td className="px-6 py-4 pl-12">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {operation.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {formatPermission(
                                                operation.permission,
                                              )}{" "}
                                              <br />
                                              {operation.description}
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
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
                                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                              }`}
                                            >
                                              {isPermissionGranted(
                                                operation.permission,
                                              ) ? (
                                                <Check className="h-5 w-5" />
                                              ) : (
                                                <X className="h-5 w-5" />
                                              )}
                                            </button>
                                          </td>
                                          <td className="px-6 py-4">
                                            {isPermissionOverridden(
                                              operation.permission,
                                            ) ||
                                            operation.permission in
                                              dirtyPermissions ? (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                Overridden
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
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
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        No features found matching your criteria.
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* By Permission Tab */}
              <TabsContent value="by-permission">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Permission
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Feature
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                          >
                            Access
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                            let featureName = "";
                            let operationName = "";
                            let service = "";

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
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatPermission(permission.permission)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {operationName}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {featureName || "Unknown Feature"}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {service && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                                        {service.charAt(0).toUpperCase() +
                                          service.slice(1).replace(/-/g, " ")}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() =>
                                      togglePermission(permission.permission)
                                    }
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                      isPermissionGranted(permission.permission)
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {isPermissionGranted(
                                      permission.permission,
                                    ) ? (
                                      <Check className="h-5 w-5" />
                                    ) : (
                                      <X className="h-5 w-5" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  {isPermissionOverridden(
                                    permission.permission,
                                  ) ||
                                  permission.permission in dirtyPermissions ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                      Overridden
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
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
                            <td colSpan={4} className="px-6 py-8 text-center">
                              <div className="text-gray-500 dark:text-gray-400">
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
              <TabsContent value="overridden">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Permission
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Role Default
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                          >
                            Current Access
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatPermission(permission.permission)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`text-sm font-medium ${
                                      roleDefaultGranted
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {roleDefaultGranted ? "Granted" : "Denied"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() =>
                                      togglePermission(permission.permission)
                                    }
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                                      isPermissionGranted(permission.permission)
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {isPermissionGranted(
                                      permission.permission,
                                    ) ? (
                                      <Check className="h-5 w-5" />
                                    ) : (
                                      <X className="h-5 w-5" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      // Reset this permission to role default
                                      setDirtyPermissions((prev) => ({
                                        ...prev,
                                        [permission.permission]:
                                          roleDefaultGranted,
                                      }));
                                    }}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
                            <td colSpan={4} className="px-6 py-8 text-center">
                              <div className="text-gray-500 dark:text-gray-400">
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
    <div className="flex flex-col items-center">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
          accessCount === 0
            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            : accessCount === totalOperations
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        }`}
      >
        {accessCount === 0 ? (
          <X className="h-5 w-5" />
        ) : accessCount === totalOperations ? (
          <Check className="h-5 w-5" />
        ) : (
          <span className="text-xs font-medium">{accessPercentage}%</span>
        )}
      </div>
      {expanded && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}
    >
      {hasPermission ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
    </div>
  );
}
