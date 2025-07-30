&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { USER_ROLES } from &quot;@shared/rbac/roles&quot;;
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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu-fixed&quot;;

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;@/components/ui/tabs-fixed&quot;; // Using fixed version that doesn&apos;t rely on cn

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
    .replace(/_/g, &quot; &quot;)
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
    username: "&quot;,
    fullName: &quot;&quot;,
    email: &quot;&quot;,
    phone: &quot;&quot;,
    role: &quot;&quot;,
    profileImage: &quot;&quot;,
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
            throw new Error(&quot;User not found&quot;);
          } else {
            throw new Error(&quot;Failed to fetch user details&quot;);
          }
        }

        const userData = await response.json();
        setUser(userData);

        // Initialize form data
        setFormData({
          username: userData.username,
          fullName: userData.fullName || &quot;&quot;,
          email: userData.email || &quot;&quot;,
          phone: userData.phone || &quot;&quot;,
          role: userData.role,
          profileImage: userData.profileImage || &quot;&quot;,
          active: userData.active,
        });
      } catch (err) {
        console.error(&quot;Error fetching user details:&quot;, err);
        setError(
          err instanceof Error ? err.message : &quot;An unknown error occurred&quot;,
        );

        toast({
          title: &quot;Error&quot;,
          description:
            err instanceof Error ? err.message : &quot;Failed to load user details&quot;,
          variant: &quot;destructive&quot;,
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
        type === &quot;checkbox&quot; ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling
      if (user) {
        setFormData({
          username: user.username,
          fullName: user.fullName || &quot;&quot;,
          email: user.email || &quot;&quot;,
          phone: user.phone || &quot;&quot;,
          role: user.role,
          profileImage: user.profileImage || &quot;&quot;,
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
        method: &quot;PUT&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const validationErrors = Object.entries(data.details)
            .map(([field, error]) => `${field}: ${JSON.stringify(error)}`)
            .join(&quot;, &quot;);
          throw new Error(`Validation error: ${validationErrors}`);
        }
        throw new Error(data.error || &quot;Failed to update user&quot;);
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
        title: &quot;Success&quot;,
        description: &quot;User updated successfully&quot;,
        variant: &quot;default&quot;,
      });
    } catch (err) {
      console.error(&quot;Error updating user:&quot;, err);
      setError(
        err instanceof Error ? err.message : &quot;An unknown error occurred&quot;,
      );

      toast({
        title: &quot;Error&quot;,
        description:
          err instanceof Error ? err.message : &quot;Failed to update user&quot;,
        variant: &quot;destructive&quot;,
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
        method: &quot;DELETE&quot;,
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to delete user&quot;);
      }

      toast({
        title: &quot;Success&quot;,
        description: &quot;User deleted successfully&quot;,
        variant: &quot;default&quot;,
      });

      // Navigate back to users list
      router.push(&quot;/users&quot;);
    } catch (err) {
      console.error(&quot;Error deleting user:&quot;, err);
      setError(
        err instanceof Error ? err.message : &quot;An unknown error occurred&quot;,
      );

      toast({
        title: &quot;Error&quot;,
        description:
          err instanceof Error ? err.message : &quot;Failed to delete user&quot;,
        variant: &quot;destructive&quot;,
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
      router.push(&quot;/users&quot;);
    }
  };

  if (loading) {
    return (
      <div className=&quot;flex justify-center items-center h-64&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded&quot;>
        <h3 className=&quot;text-lg font-semibold text-red-800 dark:text-red-300 mb-2&quot;>
          Error
        </h3>
        <p className=&quot;text-red-700 dark:text-red-400&quot;>{error}</p>
        <button
          onClick={handleBack}
          className=&quot;mt-4 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700&quot;
        >
          <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
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
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden&quot;>
      {/* Header with profile background and actions */}
      <div className=&quot;relative&quot;>
        {/* Background gradient banner */}
        <div className=&quot;h-32 bg-gradient-to-r from-primary/80 to-primary&quot;></div>

        {/* User avatar and back button overlay */}
        <div className=&quot;absolute top-0 left-0 w-full p-4 flex justify-between items-start&quot;>
          {showBackButton && (
            <button
              onClick={handleBack}
              className=&quot;bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors&quot;
            >
              <ArrowLeft className=&quot;h-5 w-5 text-gray-600 dark:text-gray-300&quot; />
            </button>
          )}

          {/* Action menu */}
          {!editMode && (
            <DropdownMenu>
              <DropdownMenuTrigger className=&quot;bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors&quot;>
                <MoreHorizontal className=&quot;h-5 w-5 text-gray-600 dark:text-gray-300&quot; />
              </DropdownMenuTrigger>
              <DropdownMenuContent align=&quot;end&quot; className=&quot;w-56&quot;>
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {checkPermission(&quot;edit:users&quot;) && (
                  <DropdownMenuItem
                    onClick={() => setEditMode(true)}
                    className=&quot;cursor-pointer&quot;
                  >
                    <Edit className=&quot;mr-2 h-4 w-4&quot; />
                    Edit User
                  </DropdownMenuItem>
                )}

                {checkPermission(&quot;edit:permissions&quot;) && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/rbac/users/${user.id}`)}
                    className=&quot;cursor-pointer&quot;
                  >
                    <Shield className=&quot;mr-2 h-4 w-4&quot; />
                    Manage Permissions
                  </DropdownMenuItem>
                )}

                {checkPermission(&quot;delete:users&quot;) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      className=&quot;cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400&quot;
                    >
                      <Trash className=&quot;mr-2 h-4 w-4&quot; />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Avatar */}
        <div className=&quot;absolute bottom-0 left-6 transform translate-y-1/2&quot;>
          <div className=&quot;h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center&quot;>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className=&quot;h-full w-full object-cover&quot;
                onError={(e) => {
                  // If image fails to load, show initials
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=0D8ABC&color=fff`;
                }}
              />
            ) : (
              <span className=&quot;text-white text-2xl font-bold&quot;>
                {user.fullName
                  ? `${user.fullName.split(&quot; &quot;)[0]?.[0] || &quot;&quot;}${user.fullName.split(&quot; &quot;)[1]?.[0] || &quot;&quot;}`
                  : (user.username?.[0] || &quot;&quot;).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Edit/Save buttons (when in edit mode) */}
        {editMode && (
          <div className=&quot;absolute bottom-0 right-6 transform translate-y-1/2 flex space-x-2&quot;>
            <button
              onClick={toggleEditMode}
              disabled={isSubmitting}
              className=&quot;inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none&quot;
            >
              <X className=&quot;mr-2 h-4 w-4&quot; />
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className=&quot;inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50&quot;
            >
              {isSubmitting ? (
                <div className=&quot;mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin&quot;></div>
              ) : (
                <Save className=&quot;mr-2 h-4 w-4&quot; />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* User information content */}
      <div className=&quot;pt-14 px-6 pb-6&quot;>
        {error && (
          <div className=&quot;mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm&quot;>
            {error}
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className=&quot;mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded&quot;>
            <h3 className=&quot;text-lg font-medium text-red-800 dark:text-red-300&quot;>
              Confirm Deletion
            </h3>
            <p className=&quot;mt-1 text-sm text-red-700 dark:text-red-400&quot;>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className=&quot;mt-3 flex justify-end space-x-3&quot;>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className=&quot;inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none&quot;
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className=&quot;inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50&quot;
              >
                {isSubmitting ? (
                  <div className=&quot;mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin&quot;></div>
                ) : (
                  <Trash className=&quot;mr-2 h-4 w-4&quot; />
                )}
                Delete User
              </button>
            </div>
          </div>
        )}

        {/* User name and basic info */}
        <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between&quot;>
          <div>
            {editMode ? (
              <div className=&quot;mb-4&quot;>
                <label
                  htmlFor=&quot;fullName&quot;
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                >
                  Full Name
                </label>
                <input
                  id=&quot;fullName&quot;
                  name=&quot;fullName&quot;
                  type=&quot;text&quot;
                  value={formData.fullName}
                  onChange={handleChange}
                  className=&quot;w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                  placeholder=&quot;Enter full name&quot;
                />
              </div>
            ) : (
              <>
                <h2 className=&quot;text-2xl font-bold text-gray-900 dark:text-white&quot;>
                  {user.fullName || user.username}
                </h2>
                <p className=&quot;text-gray-500 dark:text-gray-400&quot;>
                  {user.username}
                </p>
              </>
            )}
          </div>

          <div className=&quot;mt-2 md:mt-0 flex flex-wrap gap-2&quot;>
            {editMode ? (
              <div className=&quot;flex items-center space-x-2&quot;>
                <input
                  id=&quot;active&quot;
                  name=&quot;active&quot;
                  type=&quot;checkbox&quot;
                  checked={formData.active}
                  onChange={handleChange}
                  className=&quot;h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded&quot;
                />
                <label
                  htmlFor=&quot;active&quot;
                  className=&quot;text-sm text-gray-700 dark:text-gray-300&quot;
                >
                  Active Account
                </label>
              </div>
            ) : (
              <>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.active
                      ? &quot;bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400&quot;
                      : &quot;bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400&quot;
                  }`}
                >
                  {user.active ? (
                    <>
                      <CheckCircle className=&quot;mr-1 h-3 w-3&quot; />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className=&quot;mr-1 h-3 w-3&quot; />
                      Inactive
                    </>
                  )}
                </span>
                <span className=&quot;inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400&quot;>
                  <Shield className=&quot;mr-1 h-3 w-3&quot; />
                  {user.role
                    .replace(&quot;_&quot;, &quot; &quot;)
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue=&quot;details&quot; className=&quot;mt-6&quot;>
          <TabsList className=&quot;mb-4&quot;>
            <TabsTrigger value=&quot;details&quot;>Details</TabsTrigger>
            <TabsTrigger value=&quot;activity&quot;>Activity</TabsTrigger>
            <TabsTrigger value=&quot;permissions&quot;>Permissions</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value=&quot;details&quot; className=&quot;space-y-4&quot;>
            {editMode ? (
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                {/* Username */}
                <div>
                  <label
                    htmlFor=&quot;username&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Username
                  </label>
                  <input
                    id=&quot;username&quot;
                    name=&quot;username&quot;
                    type=&quot;text&quot;
                    value={formData.username}
                    disabled
                    className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed&quot;
                  />
                  <p className=&quot;mt-1 text-xs text-gray-500 dark:text-gray-400&quot;>
                    Username cannot be changed
                  </p>
                </div>

                {/* Role selection */}
                <div>
                  <label
                    htmlFor=&quot;role&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Role
                  </label>
                  <select
                    id=&quot;role&quot;
                    name=&quot;role&quot;
                    value={formData.role}
                    onChange={handleChange}
                    className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                  >
                    {checkPermission(&quot;assign:any_role&quot;) && (
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
                    htmlFor=&quot;email&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Email Address
                  </label>
                  <input
                    id=&quot;email&quot;
                    name=&quot;email&quot;
                    type=&quot;email&quot;
                    value={formData.email}
                    onChange={handleChange}
                    className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                    placeholder=&quot;user@example.com&quot;
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor=&quot;phone&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Phone Number
                  </label>
                  <input
                    id=&quot;phone&quot;
                    name=&quot;phone&quot;
                    type=&quot;tel&quot;
                    value={formData.phone}
                    onChange={handleChange}
                    className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                    placeholder=&quot;(555) 123-4567&quot;
                  />
                </div>

                {/* Profile Image */}
                <div className=&quot;md:col-span-2&quot;>
                  <label
                    htmlFor=&quot;profileImage&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Profile Image URL
                  </label>
                  <input
                    id=&quot;profileImage&quot;
                    name=&quot;profileImage&quot;
                    type=&quot;text&quot;
                    value={formData.profileImage}
                    onChange={handleChange}
                    className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white&quot;
                    placeholder=&quot;https://example.com/image.jpg&quot;
                  />
                </div>
              </div>
            ) : (
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Username
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium&quot;>
                    {user.username}
                  </p>
                </div>

                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Email
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium&quot;>
                    {user.email || &quot;Not provided&quot;}
                  </p>
                </div>

                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Phone
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium&quot;>
                    {user.phone || &quot;Not provided&quot;}
                  </p>
                </div>

                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Role
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium flex items-center&quot;>
                    <Shield className=&quot;mr-2 h-4 w-4 text-blue-500&quot; />
                    {formatRoleName(user.role)}
                  </p>
                </div>

                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Account Status
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium flex items-center&quot;>
                    {user.active ? (
                      <>
                        <CheckCircle className=&quot;mr-2 h-4 w-4 text-green-500&quot; />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className=&quot;mr-2 h-4 w-4 text-red-500&quot; />
                        Inactive
                      </>
                    )}
                  </p>
                </div>

                <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded-lg&quot;>
                  <h3 className=&quot;text-sm font-medium text-gray-500 dark:text-gray-400 mb-1&quot;>
                    Joined
                  </h3>
                  <p className=&quot;text-gray-900 dark:text-white font-medium flex items-center&quot;>
                    <Clock className=&quot;mr-2 h-4 w-4 text-gray-500&quot; />
                    {new Date(user.createdAt).toLocaleDateString(&quot;en-US&quot;, {
                      year: &quot;numeric&quot;,
                      month: &quot;long&quot;,
                      day: &quot;numeric&quot;,
                    })}
                  </p>
                </div>
              </div>
            )}

            {!editMode && checkPermission(&quot;edit:users&quot;) && (
              <div className=&quot;flex justify-end mt-4&quot;>
                <button
                  onClick={() => setEditMode(true)}
                  className=&quot;inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none&quot;
                >
                  <Edit className=&quot;mr-2 h-4 w-4&quot; />
                  Edit User
                </button>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value=&quot;activity&quot;>
            <div className=&quot;bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center&quot;>
              <h3 className=&quot;text-lg font-medium text-gray-700 dark:text-gray-300&quot;>
                Activity Tracking
              </h3>
              <p className=&quot;mt-2 text-gray-500 dark:text-gray-400&quot;>
                User activity tracking will be available in a future update.
              </p>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value=&quot;permissions&quot;>
            <div className=&quot;bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6&quot;>
              <div className=&quot;flex items-center justify-between mb-4&quot;>
                <h3 className=&quot;text-lg font-medium text-gray-700 dark:text-gray-300&quot;>
                  Role-Based Permissions
                </h3>

                {checkPermission(&quot;edit:permissions&quot;) && (
                  <button
                    onClick={() => router.push(`/admin/rbac/users/${user.id}`)}
                    className=&quot;inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors&quot;
                  >
                    <Shield className=&quot;mr-1.5 h-4 w-4&quot; />
                    Manage Permissions
                  </button>
                )}
              </div>

              <p className=&quot;text-gray-500 dark:text-gray-400 mb-4&quot;>
                This user has the{&quot; &quot;}
                <span className=&quot;font-semibold&quot;>
                  {formatRoleName(user.role)}
                </span>{&quot; &quot;}
                role, which includes a set of predefined permissions.
              </p>

              <div className=&quot;mt-4&quot;>
                <div className=&quot;flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400&quot;>
                  <BadgeCheck className=&quot;mr-2 h-4 w-4 text-green-500&quot; />
                  Permissions are inherited based on the user's assigned role
                </div>

                <div className=&quot;bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700&quot;>
                  <p className=&quot;text-sm text-gray-500 dark:text-gray-400">
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
