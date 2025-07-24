"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthorization } from "@/hooks/useAuthorization";
import { USER_ROLES } from "@shared/rbac/roles";
import {
  MoreHorizontal,
  Edit,
  Save,
  X,
  Trash,
  ArrowLeft,
  Shield,
  BadgeCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu-fixed";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-fixed"; // Using fixed version that doesn't rely on cn

// Type for user data
type User = {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  profileImage: string | null;
  active: boolean;
  createdAt: string;
};

// Helper function to format role names
const formatRoleName = (role: string): string => {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

interface UserDetailPanelProps {
  userId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function UserDetailPanel({
  userId,
  onBack,
  showBackButton = true,
}: UserDetailPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { checkPermission } = useAuthorization();

  // States for the user data and UI controls
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    role: "",
    profileImage: "",
    active: true,
  });

  // Fetch user data
  useEffect(() => {
    async function fetchUserDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          } else {
            throw new Error("Failed to fetch user details");
          }
        }

        const userData = await response.json();
        setUser(userData);

        // Initialize form data
        setFormData({
          username: userData.username,
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role,
          profileImage: userData.profileImage || "",
          active: userData.active,
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to load user details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, toast]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling
      if (user) {
        setFormData({
          username: user.username,
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role,
          profileImage: user.profileImage || "",
          active: user.active,
        });
      }
    }
    setEditMode(!editMode);
  };

  // Save user changes
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const validationErrors = Object.entries(data.details)
            .map(([field, error]) => `${field}: ${JSON.stringify(error)}`)
            .join(", ");
          throw new Error(`Validation error: ${validationErrors}`);
        }
        throw new Error(data.error || "Failed to update user");
      }

      // Update local user data
      setUser({
        ...user!,
        fullName: formData.fullName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        role: formData.role,
        profileImage: formData.profileImage || null,
        active: formData.active,
      });

      // Exit edit mode
      setEditMode(false);

      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });

      // Navigate back to users list
      router.push("/users");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle going back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/users");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error
        </h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
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
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header with profile background and actions */}
      <div className="relative">
        {/* Background gradient banner */}
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>

        {/* User avatar and back button overlay */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Action menu */}
          {!editMode && (
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {checkPermission("edit:users") && (
                  <DropdownMenuItem
                    onClick={() => setEditMode(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User
                  </DropdownMenuItem>
                )}

                {checkPermission("edit:permissions") && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/rbac/users/${user.id}`)}
                    className="cursor-pointer"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </DropdownMenuItem>
                )}

                {checkPermission("delete:users") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
          <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If image fails to load, show initials
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=0D8ABC&color=fff`;
                }}
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user.fullName
                  ? `${user.fullName.split(" ")[0]?.[0] || ""}${user.fullName.split(" ")[1]?.[0] || ""}`
                  : (user.username?.[0] || "").toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Edit/Save buttons (when in edit mode) */}
        {editMode && (
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 flex space-x-2">
            <button
              onClick={toggleEditMode}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* User information content */}
      <div className="pt-14 px-6 pb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
              Confirm Deletion
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="mt-3 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                Delete User
              </button>
            </div>
          </div>
        )}

        {/* User name and basic info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {editMode ? (
              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.fullName || user.username}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {user.username}
                </p>
              </>
            )}
          </div>

          <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
            {editMode ? (
              <div className="flex items-center space-x-2">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="active"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Active Account
                </label>
              </div>
            ) : (
              <>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                  }`}
                >
                  {user.active ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Inactive
                    </>
                  )}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Username cannot be changed
                  </p>
                </div>

                {/* Role selection */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    {checkPermission("assign:any_role") && (
                      <>
                        <option value={USER_ROLES.SUPER_ADMIN}>
                          Super Admin
                        </option>
                        <option value={USER_ROLES.INTERNAL_ADMIN}>
                          Internal Admin
                        </option>
                      </>
                    )}
                    <option value={USER_ROLES.INTERNAL_FIELD_MANAGER}>
                      Internal Field Manager
                    </option>
                    <option value={USER_ROLES.FIELD_COORDINATOR}>
                      Field Coordinator
                    </option>
                    <option value={USER_ROLES.BRAND_AGENT}>Brand Agent</option>
                    {/* Removed invalid role - INTERNAL_ACCOUNT_MANAGER is not defined in USER_ROLES */}
                    <option value={USER_ROLES.CLIENT_MANAGER}>
                      Client Manager
                    </option>
                    <option value={USER_ROLES.CLIENT_USER}>Client User</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Profile Image */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="profileImage"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Profile Image URL
                  </label>
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="text"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Username
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.username}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.email || "Not provided"}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Phone
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Role
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-blue-500" />
                    {formatRoleName(user.role)}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Account Status
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center">
                    {user.active ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Inactive
                      </>
                    )}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Joined
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {!editMode && checkPermission("edit:users") && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </button>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Activity Tracking
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                User activity tracking will be available in a future update.
              </p>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Role-Based Permissions
                </h3>

                {checkPermission("edit:permissions") && (
                  <button
                    onClick={() => router.push(`/admin/rbac/users/${user.id}`)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    <Shield className="mr-1.5 h-4 w-4" />
                    Manage Permissions
                  </button>
                )}
              </div>

              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This user has the{" "}
                <span className="font-semibold">
                  {formatRoleName(user.role)}
                </span>{" "}
                role, which includes a set of predefined permissions.
              </p>

              <div className="mt-4">
                <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <BadgeCheck className="mr-2 h-4 w-4 text-green-500" />
                  Permissions are inherited based on the user's assigned role
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    To view or modify specific permissions for this user, use
                    the Manage Permissions button above.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
