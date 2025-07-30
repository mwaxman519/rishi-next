&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import SidebarLayout from &quot;@/components/SidebarLayout&quot;;
import Link from &quot;next/link&quot;;
import { getAllUsers } from &quot;@/actions/users&quot;;
import { UserProfile } from &quot;@/services/users/models&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;@/components/ui/tabs-fixed&quot;; // Using fixed UI component without cn
import UsersTable from &quot;@/components/users/UsersTable&quot;;
import UserDetailPanel from &quot;@/components/users/UserDetailPanel&quot;;

export default function UsersPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const { toast } = useToast();
  const router = useRouter();

  // State for user data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the user detail panel
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          if (!response.error) {
            setError(&quot;Failed to load users data - no error details provided&quot;);
          } else {
            setError(response.error);
          }
        }
      } catch (error) {
        console.error(&quot;Failed to load users:&quot;, error);
        setError(&quot;Error fetching users. Please try again.&quot;);
      } finally {
        setIsLoading(false);
      }
    };

    // Load users regardless of authentication state (let the server handle auth)
    if (!isAuthLoading) {
      loadUsers();
    }
  }, [user, isAuthLoading]);

  // Handle viewing a user
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Handle deleting a user
  const handleDeleteUser = (userId: string) => {
    setShowDeleteConfirm(userId);
  };

  // Confirm deletion handler
  const confirmDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: &quot;DELETE&quot;,
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to delete user&quot;);
      }

      // Remove user from the list
      setUsers(users.filter((u) => u.id !== userId));

      // If the deleted user was selected, clear selection
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }

      toast({
        title: &quot;Success&quot;,
        description: &quot;User deleted successfully&quot;,
        variant: &quot;default&quot;,
      });
    } catch (err) {
      console.error(&quot;Error deleting user:&quot;, err);

      toast({
        title: &quot;Error&quot;,
        description:
          err instanceof Error ? err.message : &quot;Failed to delete user&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setShowDeleteConfirm(null);
    }
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

  // Check if user has permission to view this page
  if (!user) {
    return (
      <SidebarLayout>
        <div className=&quot;p-6&quot;>
          <h1 className=&quot;text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100&quot;>
            User Management
          </h1>
          <div className=&quot;bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded&quot;>
            <p className=&quot;text-red-700 dark:text-red-300&quot;>
              You need to be logged in to view this page.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className=&quot;p-6&quot;>
        {/* Header section */}
        <div className=&quot;flex justify-between items-center mb-6&quot;>
          <h1 className=&quot;text-2xl font-bold text-gray-900 dark:text-gray-100&quot;>
            User Management
          </h1>
          <div className=&quot;flex space-x-2&quot;>
            <Link
              href=&quot;/users/agents&quot;
              className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition&quot;
            >
              Manage Agents
            </Link>
            {checkPermission(&quot;edit:users&quot;) && (
              <Link
                href=&quot;/users/new&quot;
                className=&quot;px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition&quot;
              >
                Add User
              </Link>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className=&quot;mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded&quot;>
            <h3 className=&quot;text-lg font-medium text-red-800 dark:text-red-300&quot;>
              Confirm Deletion
            </h3>
            <p className=&quot;mt-1 text-sm text-red-700 dark:text-red-400&quot;>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className=&quot;mt-3 flex justify-end space-x-3&quot;>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className=&quot;inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none&quot;
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm) {
                    confirmDeleteUser(showDeleteConfirm);
                  }
                }}
                className=&quot;inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none&quot;
              >
                Delete User
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        {isLoading ? (
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
        ) : users.length === 0 ? (
          <div className=&quot;bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded text-center&quot;>
            <h3 className=&quot;text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2&quot;>
              No Users Found
            </h3>
            <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
              There are no users in the system yet.
            </p>
            {checkPermission(&quot;create:users&quot;) && (
              <Link
                href=&quot;/users/new&quot;
                className=&quot;mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition&quot;
              >
                Add First User
              </Link>
            )}
          </div>
        ) : (
          <div className=&quot;grid grid-cols-1 gap-6&quot;>
            {/* If a user is selected, show the detail panel */}
            {selectedUserId ? (
              <UserDetailPanel
                userId={selectedUserId}
                onBack={() => setSelectedUserId(null)}
              />
            ) : (
              /* Otherwise, show the table of users */
              <UsersTable
                users={users}
                onViewUser={handleViewUser}
                onDeleteUser={
                  checkPermission(&quot;delete:users&quot;) ? handleDeleteUser : undefined
                }
              />
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
