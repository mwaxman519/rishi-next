"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useAuthorization } from "@/hooks/useAuthorization";
import { apiFetch } from "@/lib/api";

// Mock data for client users

export default function ClientUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { checkPermission } = useAuthorization();

  // Filter users based on search query
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch('/api/users');
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
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "locked":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Locked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to get role badge color
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Admin
          </Badge>
        );
      case "manager":
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200"
          >
            Manager
          </Badge>
        );
      case "inventory manager":
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200"
          >
            Inventory Manager
          </Badge>
        );
      case "reporting":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Reporting
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Client Users
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage client user accounts and access control
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className="flex items-center gap-1"
            disabled={!checkPermission("create:client-users")}
          >
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div>{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={!checkPermission("edit:client-users")}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={!checkPermission("manage:permissions")}
                          >
                            <Shield className="h-4 w-4 mr-2" /> Manage
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={!checkPermission("reset:passwords")}
                          >
                            <Key className="h-4 w-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="h-4 w-4 mr-2" /> Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "Active" ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-yellow-600"
                              disabled={!checkPermission("manage:client-users")}
                            >
                              <UserX className="h-4 w-4 mr-2" /> Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600"
                              disabled={!checkPermission("manage:client-users")}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            disabled={!checkPermission("delete:client-users")}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete User
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
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
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
