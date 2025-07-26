"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "@/hooks/useAuthorization";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Search,
  UserPlus,
  Filter,
  X,
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

import { UserProfile } from "@/services/users/models";

interface UsersTableProps {
  users: UserProfile[];
  onViewUser: (userId: string) => void;
  onDeleteUser?: ((userId: string) => void) | undefined;
}

export default function UsersTable({
  users,
  onViewUser,
  onDeleteUser,
}: UsersTableProps) {
  const router = useRouter();
  const { checkPermission } = useAuthorization();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [showInactiveUsers, setShowInactiveUsers] = useState(true);

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    // Apply search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);

    // Apply role filter
    const matchesRole = !filterRole || user.role === filterRole;

    // Apply active/inactive filter
    const matchesActiveStatus = showInactiveUsers || user.active;

    return matchesSearch && matchesRole && matchesActiveStatus;
  });

  // Helper function to safely get user initials
  function getUserInitial(user: UserProfile): string {
    // Check fullName first
    if (user.fullName && typeof user.fullName === "string") {
      const trimmed = user.fullName.trim();
      if (trimmed.length > 0) {
        return trimmed.charAt(0).toUpperCase();
      }
    }

    // Check username second
    if (user.username && typeof user.username === "string") {
      const trimmed = user.username.trim();
      if (trimmed.length > 0) {
        return trimmed.charAt(0).toUpperCase();
      }
    }

    // Default fallback
    return "?";
  }

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Search and filters header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            {/* Role filter */}
            <div className="relative">
              <select
                value={filterRole || ""}
                onChange={(e) => setFilterRole(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <Filter className="h-4 w-4" />
              </div>
            </div>

            {/* Active/Inactive filter */}
            <div className="flex items-center space-x-2">
              <input
                id="showInactive"
                type="checkbox"
                checked={showInactiveUsers}
                onChange={(e) => setShowInactiveUsers(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="showInactive"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Show Inactive
              </label>
            </div>

            {/* New User Button (conditionally rendered) */}
            {checkPermission("create:users") && (
              <button
                onClick={() => router.push("/users/new")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                New User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterRole || !showInactiveUsers
              ? "No users match your search or filters."
              : "No users found in the system."}
          </p>
          {(searchTerm || filterRole || !showInactiveUsers) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterRole(null);
                setShowInactiveUsers(true);
              }}
              className="mt-2 text-sm text-primary hover:text-primary/80"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onViewUser(user.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName || user.username || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=0D8ABC&color=fff`;
                            }}
                          />
                        ) : (
                          <span>{getUserInitial(user)}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email || user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                      {user.role
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.active
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-2"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewUser(user.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {checkPermission("edit:users") && (
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/users/${user.id}/edit`)
                              }
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                          )}
                          {checkPermission("delete:users") && onDeleteUser && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteUser(user.id)}
                                className="cursor-pointer text-red-600 dark:text-red-400"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
