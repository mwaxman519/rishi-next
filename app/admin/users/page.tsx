"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getAllUsers } from "@/actions/users";
import { UserProfile } from "@/services/users/models";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-fixed";
import UsersTable from "@/components/users/UsersTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PlusCircle, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const { toast } = useToast();
  const router = useRouter();

  // State for user data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all-users");

  // State for the user detail panel
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // User statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    admins: 0,
    brandAgents: 0,
    clientUsers: 0,
    internalUsers: 0,
  });

  // Load all users with enhanced data for admin view
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);

          // Calculate statistics for the admin dashboard
          const userStats = {
            totalUsers: response.data.length,
            activeUsers: response.data.filter((u) => u.active).length,
            inactiveUsers: response.data.filter((u) => !u.active).length,
            admins: response.data.filter(
              (u) => u.role === "super_admin" || u.role === "internal_admin",
            ).length,
            brandAgents: response.data.filter((u) => u.role === "brand_agent")
              .length,
            clientUsers: response.data.filter(
              (u) => u.role === "client_user" || u.role === "client_manager",
            ).length,
            internalUsers: response.data.filter(
              (u) =>
                u.role === "internal_field_manager" ||
                u.role === "field_coordinator",
            ).length,
          };

          setStats(userStats);
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

  // Get the filtered users based on the selected tab
  const getFilteredUsers = () => {
    if (selectedTab === "all-users") {
      return users;
    } else if (selectedTab === "admins") {
      return users.filter(
        (u) => u.role === "super_admin" || u.role === "internal_admin",
      );
    } else if (selectedTab === "brand-agents") {
      return users.filter((u) => u.role === "brand_agent");
    } else if (selectedTab === "client-users") {
      return users.filter(
        (u) => u.role === "client_user" || u.role === "client_manager",
      );
    } else if (selectedTab === "internal-staff") {
      return users.filter(
        (u) =>
          u.role === "internal_field_manager" || u.role === "field_coordinator",
      );
    } else if (selectedTab === "inactive-users") {
      return users.filter((u) => !u.active);
    }
    return users;
  };

  // Check for superadmin access
  const isSuperAdmin = user && user.role === "super_admin";

  // Show loading state while authentication is checking
  if (isAuthLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Enhanced admin permission check
  if (
    !user ||
    !(user.role === "super_admin" || user.role === "internal_admin")
  ) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have administrative permission to access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Administration</h1>
          <p className="text-muted-foreground">
            Manage all users across the platform with advanced controls
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push("/users")}>
            <Users className="h-4 w-4 mr-2" />
            Regular View
          </Button>
          <Button onClick={() => router.push("/users/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="flex mt-2">
              <Badge variant="outline" className="mr-2">
                {stats.activeUsers} Active
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                {stats.inactiveUsers} Inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.admins}</div>
            <Badge variant="outline" className="mt-2">
              System Access
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Brand Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.brandAgents}</div>
            <Badge variant="outline" className="mt-2">
              Field Staff
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Client Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.clientUsers}</div>
            <Badge variant="outline" className="mt-2">
              External Access
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Confirm User Deletion</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showDeleteConfirm) {
                    confirmDeleteUser(showDeleteConfirm);
                  }
                }}
              >
                Delete User
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* User tabs and content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Users</AlertTitle>
          <AlertDescription>
            <p className="mb-3">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all users across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {selectedUserId ? (
              <div className="p-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedUserId(null)}
                  className="mb-4"
                >
                  ← Back to Users
                </Button>
                <UserDetailPanel
                  userId={selectedUserId}
                  onBack={() => setSelectedUserId(null)}
                  showBackButton={false}
                />
              </div>
            ) : (
              <>
                <Tabs
                  defaultValue="all-users"
                  className="w-full"
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                >
                  <div className="px-6 border-b">
                    <TabsList className="mb-px">
                      <TabsTrigger value="all-users" className="relative">
                        All Users
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.totalUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="admins">
                        Administrators
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.admins}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="brand-agents">
                        Brand Agents
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.brandAgents}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="client-users">
                        Client Users
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.clientUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="internal-staff">
                        Internal Staff
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.internalUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="inactive-users">
                        Inactive Users
                        <Badge className="ml-2 h-5 px-1.5">
                          {stats.inactiveUsers}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* All tabs share the same content with different filters */}
                  <div className="p-0">
                    <UsersTable
                      users={getFilteredUsers()}
                      onViewUser={handleViewUser}
                      onDeleteUser={isSuperAdmin ? handleDeleteUser : undefined}
                    />
                  </div>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Actions */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Administration</CardTitle>
            <CardDescription>
              Super admin only actions for system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users/bulk-import")}
              >
                Bulk Import Users
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users/permissions")}
              >
                <UserCog className="h-4 w-4 mr-2" />
                User Permissions
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/audit-logs?resource=users")}
              >
                View User Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
