"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useToast } from "@/hooks/use-toast";
import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { getAllUsers } from "@/actions/users";
import { UserProfile } from "@/services/users/models";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-fixed"; // Using fixed UI component without cn
import UsersTable from "@/components/users/UsersTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";

export default function UsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
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
          setError(response.error || "Failed to load users data");
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        setError("Error fetching users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Only attempt to load if we're authenticated
    if (!isAuthLoading && user) {
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
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove user from the list
      setUsers(users.filter((u) => u.id !== userId));

      // If the deleted user was selected, clear selection
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error deleting user:", err);

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(null);
    }
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

  // Check if user has permission to view this page
  if (!user) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded">
            <p className="text-red-700 dark:text-red-300">
              You need to be logged in to view this page.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <div className="flex space-x-2">
            <Link
              href="/users/agents"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
            >
              Manage Agents
            </Link>
            {checkPermission("edit:users") && (
              <Link
                href="/users/new"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
              >
                Add User
              </Link>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
              Confirm Deletion
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="mt-3 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm) {
                    confirmDeleteUser(showDeleteConfirm);
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                Delete User
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        {isLoading ? (
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
        ) : users.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no users in the system yet.
            </p>
            {checkPermission("create:users") && (
              <Link
                href="/users/new"
                className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
              >
                Add First User
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
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
                  checkPermission("delete:users") ? handleDeleteUser : undefined
                }
              />
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
