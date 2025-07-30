&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu-fixed&quot;;

import { UserProfile } from &quot;@/services/users/models&quot;;

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
  const [searchTerm, setSearchTerm] = useState("&quot;);
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
    if (user.fullName && typeof user.fullName === &quot;string&quot;) {
      const trimmed = user.fullName.trim();
      if (trimmed.length > 0) {
        return trimmed.charAt(0).toUpperCase();
      }
    }

    // Check username second
    if (user.username && typeof user.username === &quot;string&quot;) {
      const trimmed = user.username.trim();
      if (trimmed.length > 0) {
        return trimmed.charAt(0).toUpperCase();
      }
    }

    // Default fallback
    return &quot;?&quot;;
  }

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));

  return (
    <div className=&quot;bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden&quot;>
      {/* Search and filters header */}
      <div className=&quot;px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50&quot;>
        <div className=&quot;flex flex-col md:flex-row md:items-center md:justify-between gap-3&quot;>
          {/* Search box */}
          <div className=&quot;relative flex-1 max-w-md&quot;>
            <div className=&quot;absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none&quot;>
              <Search className=&quot;h-4 w-4 text-gray-400&quot; />
            </div>
            <input
              type=&quot;text&quot;
              placeholder=&quot;Search users...&quot;
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=&quot;pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white&quot;
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm(&quot;&quot;)}
                className=&quot;absolute inset-y-0 right-0 pr-3 flex items-center&quot;
              >
                <X className=&quot;h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300&quot; />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className=&quot;flex items-center space-x-3&quot;>
            {/* Role filter */}
            <div className=&quot;relative&quot;>
              <select
                value={filterRole || &quot;&quot;}
                onChange={(e) => setFilterRole(e.target.value || null)}
                className=&quot;appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white&quot;
              >
                <option value=&quot;&quot;>All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role
                      .replace(&quot;_&quot;, &quot; &quot;)
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <div className=&quot;pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400&quot;>
                <Filter className=&quot;h-4 w-4&quot; />
              </div>
            </div>

            {/* Active/Inactive filter */}
            <div className=&quot;flex items-center space-x-2&quot;>
              <input
                id=&quot;showInactive&quot;
                type=&quot;checkbox&quot;
                checked={showInactiveUsers}
                onChange={(e) => setShowInactiveUsers(e.target.checked)}
                className=&quot;h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded&quot;
              />
              <label
                htmlFor=&quot;showInactive&quot;
                className=&quot;text-sm text-gray-700 dark:text-gray-300&quot;
              >
                Show Inactive
              </label>
            </div>

            {/* New User Button (conditionally rendered) */}
            {checkPermission(&quot;create:users&quot;) && (
              <button
                onClick={() => router.push(&quot;/users/new&quot;)}
                className=&quot;inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none&quot;
              >
                <UserPlus className=&quot;mr-1.5 h-4 w-4&quot; />
                New User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <div className=&quot;p-6 text-center&quot;>
          <p className=&quot;text-gray-500 dark:text-gray-400&quot;>
            {searchTerm || filterRole || !showInactiveUsers
              ? &quot;No users match your search or filters.&quot;
              : &quot;No users found in the system.&quot;}
          </p>
          {(searchTerm || filterRole || !showInactiveUsers) && (
            <button
              onClick={() => {
                setSearchTerm(&quot;&quot;);
                setFilterRole(null);
                setShowInactiveUsers(true);
              }}
              className=&quot;mt-2 text-sm text-primary hover:text-primary/80&quot;
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className=&quot;overflow-x-auto&quot;>
          <table className=&quot;min-w-full divide-y divide-gray-200 dark:divide-gray-700&quot;>
            <thead className=&quot;bg-gray-50 dark:bg-gray-900&quot;>
              <tr>
                <th
                  scope=&quot;col&quot;
                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                >
                  User
                </th>
                <th
                  scope=&quot;col&quot;
                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                >
                  Role
                </th>
                <th
                  scope=&quot;col&quot;
                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                >
                  Status
                </th>
                <th
                  scope=&quot;col&quot;
                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                >
                  Joined
                </th>
                <th
                  scope=&quot;col&quot;
                  className=&quot;px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider&quot;
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className=&quot;bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700&quot;>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className=&quot;hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors&quot;
                  onClick={() => onViewUser(user.id)}
                >
                  <td className=&quot;px-6 py-4 whitespace-nowrap&quot;>
                    <div className=&quot;flex items-center&quot;>
                      <div className=&quot;flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300&quot;>
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName || user.username || &quot;User&quot;}
                            className=&quot;h-10 w-10 rounded-full object-cover&quot;
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=0D8ABC&color=fff`;
                            }}
                          />
                        ) : (
                          <span>{getUserInitial(user)}</span>
                        )}
                      </div>
                      <div className=&quot;ml-4&quot;>
                        <div className=&quot;text-sm font-medium text-gray-900 dark:text-white&quot;>
                          {user.fullName || user.username}
                        </div>
                        <div className=&quot;text-sm text-gray-500 dark:text-gray-400&quot;>
                          {user.email || user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className=&quot;px-6 py-4 whitespace-nowrap&quot;>
                    <span className=&quot;px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100&quot;>
                      {user.role
                        .replace(&quot;_&quot;, &quot; &quot;)
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className=&quot;px-6 py-4 whitespace-nowrap&quot;>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.active
                          ? &quot;bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100&quot;
                          : &quot;bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100&quot;
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
                  </td>
                  <td className=&quot;px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400&quot;>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className=&quot;px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400&quot;>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className=&quot;flex items-center space-x-2&quot;
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className=&quot;inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none&quot;>
                          <MoreHorizontal className=&quot;h-4 w-4&quot; />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=&quot;end&quot; className=&quot;w-48&quot;>
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewUser(user.id)}
                            className=&quot;cursor-pointer&quot;
                          >
                            <Eye className=&quot;mr-2 h-4 w-4&quot; />
                            View Details
                          </DropdownMenuItem>
                          {checkPermission(&quot;edit:users&quot;) && (
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/users/${user.id}/edit`)
                              }
                              className=&quot;cursor-pointer&quot;
                            >
                              <Edit className=&quot;mr-2 h-4 w-4&quot; />
                              Edit User
                            </DropdownMenuItem>
                          )}
                          {checkPermission(&quot;delete:users&quot;) && onDeleteUser && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteUser(user.id)}
                                className=&quot;cursor-pointer text-red-600 dark:text-red-400&quot;
                              >
                                <Trash className=&quot;mr-2 h-4 w-4" />
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
