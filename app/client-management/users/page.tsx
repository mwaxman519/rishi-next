&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  User,
  UserCog,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Key,
  Mail,
  Shield,
  UserX,
  RefreshCw,
  Trash2,
} from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;../../components/ui/dropdown-menu&quot;;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;../../components/ui/table&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;

// Mock data for client users

export default function ClientUsersPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const { checkPermission } = useAuthorization();

  // Filter users based on search query
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case &quot;active&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-green-50 text-green-700 border-green-200&quot;
          >
            Active
          </Badge>
        );
      case &quot;inactive&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-gray-50 text-gray-700 border-gray-200&quot;
          >
            Inactive
          </Badge>
        );
      case &quot;pending&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;
          >
            Pending
          </Badge>
        );
      case &quot;locked&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-red-50 text-red-700 border-red-200&quot;
          >
            Locked
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{status}</Badge>;
    }
  };

  // Function to get role badge color
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case &quot;admin&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-purple-50 text-purple-700 border-purple-200&quot;
          >
            Admin
          </Badge>
        );
      case &quot;manager&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-teal-50 text-teal-700 border-teal-200&quot;
          >
            Manager
          </Badge>
        );
      case &quot;inventory manager&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-teal-50 text-teal-700 border-teal-200&quot;
          >
            Inventory Manager
          </Badge>
        );
      case &quot;reporting&quot;:
        return (
          <Badge
            variant=&quot;outline&quot;
            className=&quot;bg-purple-50 text-purple-700 border-purple-200&quot;
          >
            Reporting
          </Badge>
        );
      default:
        return <Badge variant=&quot;outline&quot;>{role}</Badge>;
    }
  };

  return (
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
            Client Users
          </h1>
          <p className=&quot;mt-1 text-gray-600 dark:text-gray-400&quot;>
            Manage client user accounts and access control
          </p>
        </div>

        <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
            <Input
              type=&quot;search&quot;
              placeholder=&quot;Search users...&quot;
              className=&quot;pl-8 w-full sm:w-[250px]&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className=&quot;flex items-center gap-1&quot;
            disabled={!checkPermission(&quot;create:client-users&quot;)}
          >
            <Plus className=&quot;h-4 w-4&quot; /> Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className=&quot;p-0&quot;>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=&quot;w-[250px]&quot;>User</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className=&quot;text-right&quot;>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className=&quot;font-medium&quot;>
                      <div className=&quot;flex items-center&quot;>
                        <div className=&quot;flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3&quot;>
                          <User className=&quot;h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
                        </div>
                        <div>
                          <div>{user.name}</div>
                          <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.client}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>{user.dateCreated}</TableCell>
                    <TableCell className=&quot;text-right&quot;>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                            <MoreVertical className=&quot;h-4 w-4&quot; />
                            <span className=&quot;sr-only&quot;>Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=&quot;end&quot;>
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;edit:client-users&quot;)}
                          >
                            <Edit className=&quot;h-4 w-4 mr-2&quot; /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;manage:permissions&quot;)}
                          >
                            <Shield className=&quot;h-4 w-4 mr-2&quot; /> Manage
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className=&quot;cursor-pointer&quot;
                            disabled={!checkPermission(&quot;reset:passwords&quot;)}
                          >
                            <Key className=&quot;h-4 w-4 mr-2&quot; /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className=&quot;cursor-pointer&quot;>
                            <Mail className=&quot;h-4 w-4 mr-2&quot; /> Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === &quot;Active&quot; ? (
                            <DropdownMenuItem
                              className=&quot;cursor-pointer text-yellow-600&quot;
                              disabled={!checkPermission(&quot;manage:client-users&quot;)}
                            >
                              <UserX className=&quot;h-4 w-4 mr-2&quot; /> Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className=&quot;cursor-pointer text-green-600&quot;
                              disabled={!checkPermission(&quot;manage:client-users&quot;)}
                            >
                              <RefreshCw className=&quot;h-4 w-4 mr-2&quot; /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className=&quot;cursor-pointer text-red-600&quot;
                            disabled={!checkPermission(&quot;delete:client-users&quot;)}
                          >
                            <Trash2 className=&quot;h-4 w-4 mr-2&quot; /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className=&quot;text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No client users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
