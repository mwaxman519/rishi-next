&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import Link from &quot;next/link&quot;;
import { getAllUsers } from &quot;@/actions/users&quot;;
import { UserProfile } from &quot;@/services/users/models&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;@/components/ui/tabs-fixed&quot;;
import UsersTable from &quot;@/components/users/UsersTable&quot;;
import UserDetailPanel from &quot;@/components/users/UserDetailPanel&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import { AlertCircle, PlusCircle, UserCog, Users } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;

export default function AdminUsersPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const { toast } = useToast();
  const router = useRouter();

  // State for user data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>(&quot;all-users&quot;);

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
              (u) => u.role === &quot;super_admin&quot; || u.role === &quot;internal_admin&quot;,
            ).length,
            brandAgents: response.data.filter((u) => u.role === &quot;brand_agent&quot;)
              .length,
            clientUsers: response.data.filter(
              (u) => u.role === &quot;client_user&quot; || u.role === &quot;client_manager&quot;,
            ).length,
            internalUsers: response.data.filter(
              (u) =>
                u.role === &quot;internal_field_manager&quot; ||
                u.role === &quot;field_coordinator&quot;,
            ).length,
          };

          setStats(userStats);
        } else {
          setError(response.error || &quot;Failed to load users data&quot;);
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

  // Get the filtered users based on the selected tab
  const getFilteredUsers = () => {
    if (selectedTab === &quot;all-users&quot;) {
      return users;
    } else if (selectedTab === &quot;admins&quot;) {
      return users.filter(
        (u) => u.role === &quot;super_admin&quot; || u.role === &quot;internal_admin&quot;,
      );
    } else if (selectedTab === &quot;brand-agents&quot;) {
      return users.filter((u) => u.role === &quot;brand_agent&quot;);
    } else if (selectedTab === &quot;client-users&quot;) {
      return users.filter(
        (u) => u.role === &quot;client_user&quot; || u.role === &quot;client_manager&quot;,
      );
    } else if (selectedTab === &quot;internal-staff&quot;) {
      return users.filter(
        (u) =>
          u.role === &quot;internal_field_manager&quot; || u.role === &quot;field_coordinator&quot;,
      );
    } else if (selectedTab === &quot;inactive-users&quot;) {
      return users.filter((u) => !u.active);
    }
    return users;
  };

  // Check for superadmin access
  const isSuperAdmin = user && user.role === &quot;super_admin&quot;;

  // Show loading state while authentication is checking
  if (isAuthLoading) {
    return (
      <div className=&quot;p-6 flex justify-center items-center h-64&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
      </div>
    );
  }

  // Enhanced admin permission check
  if (
    !user ||
    !(user.role === &quot;super_admin&quot; || user.role === &quot;internal_admin&quot;)
  ) {
    return (
      <div className=&quot;p-6&quot;>
        <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have administrative permission to access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push(&quot;/&quot;)} variant=&quot;outline&quot;>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className=&quot;p-4 space-y-6&quot;>
      {/* Header with actions */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>User Administration</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage all users across the platform with advanced controls
          </p>
        </div>
        <div className=&quot;flex space-x-3&quot;>
          <Button variant=&quot;outline&quot; onClick={() => router.push(&quot;/users&quot;)}>
            <Users className=&quot;h-4 w-4 mr-2&quot; />
            Regular View
          </Button>
          <Button onClick={() => router.push(&quot;/users/new&quot;)}>
            <PlusCircle className=&quot;h-4 w-4 mr-2&quot; />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-lg&quot;>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-3xl font-bold&quot;>{stats.totalUsers}</div>
            <div className=&quot;flex mt-2&quot;>
              <Badge variant=&quot;outline&quot; className=&quot;mr-2&quot;>
                {stats.activeUsers} Active
              </Badge>
              <Badge variant=&quot;outline&quot; className=&quot;bg-gray-100&quot;>
                {stats.inactiveUsers} Inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-lg&quot;>Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-3xl font-bold&quot;>{stats.admins}</div>
            <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
              System Access
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-lg&quot;>Brand Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-3xl font-bold&quot;>{stats.brandAgents}</div>
            <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
              Field Staff
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-lg&quot;>Client Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-3xl font-bold&quot;>{stats.clientUsers}</div>
            <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
              External Access
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
          <AlertTitle>Confirm User Deletion</AlertTitle>
          <AlertDescription>
            <p className=&quot;mb-3&quot;>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className=&quot;flex justify-end space-x-3&quot;>
              <Button
                variant=&quot;outline&quot;
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant=&quot;destructive&quot;
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
        <div className=&quot;flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
        </div>
      ) : error ? (
        <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Error Loading Users</AlertTitle>
          <AlertDescription>
            <p className=&quot;mb-3&quot;>{error}</p>
            <Button variant=&quot;outline&quot; onClick={() => window.location.reload()}>
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
          <CardContent className=&quot;p-0&quot;>
            {selectedUserId ? (
              <div className=&quot;p-6&quot;>
                <Button
                  variant=&quot;ghost&quot;
                  onClick={() => setSelectedUserId(null)}
                  className=&quot;mb-4&quot;
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
                  defaultValue=&quot;all-users&quot;
                  className=&quot;w-full&quot;
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                >
                  <div className=&quot;px-6 border-b&quot;>
                    <TabsList className=&quot;mb-px&quot;>
                      <TabsTrigger value=&quot;all-users&quot; className=&quot;relative&quot;>
                        All Users
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.totalUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value=&quot;admins&quot;>
                        Administrators
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.admins}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value=&quot;brand-agents&quot;>
                        Brand Agents
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.brandAgents}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value=&quot;client-users&quot;>
                        Client Users
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.clientUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value=&quot;internal-staff&quot;>
                        Internal Staff
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.internalUsers}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value=&quot;inactive-users&quot;>
                        Inactive Users
                        <Badge className=&quot;ml-2 h-5 px-1.5&quot;>
                          {stats.inactiveUsers}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* All tabs share the same content with different filters */}
                  <div className=&quot;p-0&quot;>
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
            <div className=&quot;flex flex-wrap gap-3&quot;>
              <Button
                variant=&quot;outline&quot;
                onClick={() => router.push(&quot;/admin/users/bulk-import&quot;)}
              >
                Bulk Import Users
              </Button>
              <Button
                variant=&quot;outline&quot;
                onClick={() => router.push(&quot;/admin/users/permissions&quot;)}
              >
                <UserCog className=&quot;h-4 w-4 mr-2&quot; />
                User Permissions
              </Button>
              <Button
                variant=&quot;outline&quot;
                onClick={() => router.push(&quot;/admin/audit-logs?resource=users&quot;)}
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
