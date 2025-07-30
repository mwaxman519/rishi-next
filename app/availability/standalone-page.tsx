&quot;use client&quot;;

import React, { useState, useEffect, useRef, useCallback } from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;
import { useAuthorization } from &quot;../hooks/useAuthorization&quot;;
import { USER_ROLES } from &quot;../../shared/rbac/roles&quot;;
import { useTheme } from &quot;../hooks/useTheme&quot;;
import { useSidebarState } from &quot;../hooks/useSidebarState&quot;;
import { ThemeToggle } from &quot;../components/ui/theme-toggle&quot;;
import ErrorBoundary from &quot;../components/ErrorBoundary&quot;;

// Define simplified AvailabilityDTO interface directly in this file
interface SimpleAvailabilityDTO {
  id: number;
  userId: number;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  status: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
  isRecurring: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceGroup?: string;
  recurrenceEndType?: &quot;never&quot; | &quot;count&quot; | &quot;date&quot;;
  recurrenceCount?: number;
  recurrenceEndDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function StandaloneAvailabilityPage() {
  // Auth and role-based access
  const { user, loading: authLoading } = useAuth();
  const { isAtLeastRole } = useAuthorization();
  const { theme } = useTheme();
  const { sidebarCollapsed } = useSidebarState();

  // Application state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myBlocks, setMyBlocks] = useState<SimpleAvailabilityDTO[]>([]);
  const [teamBlocks, setTeamBlocks] = useState<SimpleAvailabilityDTO[]>([]);
  const [activeTab, setActiveTab] = useState<&quot;list&quot;>(&quot;list&quot;);
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState<
    &quot;all&quot; | &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;
  >(&quot;all&quot;);

  // Abort controller for API requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to safely format a date for API requests
  const safeFormatDate = useCallback((date: Date, offset = 0) => {
    try {
      const newDate = new Date(date);
      if (offset) {
        newDate.setDate(newDate.getDate() + offset);
      }
      return newDate.toISOString().split(&quot;T&quot;)[0];
    } catch (e) {
      // If date parsing fails, use current date
      const fallbackDate = new Date();
      if (offset) {
        fallbackDate.setDate(fallbackDate.getDate() + offset);
      }
      return fallbackDate.toISOString().split(&quot;T&quot;)[0];
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    if (!user) {
      setError(&quot;Please sign in to view your availability&quot;);
      setIsLoading(false);
      return;
    }

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Always start by setting loading state and clearing errors
      setIsLoading(true);
      setError(null);

      // Get today and 90 days from now for date range
      const today = new Date();
      const startDate = safeFormatDate(today);
      const endDate = safeFormatDate(today, 90);

      // Fetch user's availability
      console.log(`Fetching availability for userId: ${user.id}`);

      let response;
      let data;

      try {
        response = await fetch(
          `/api/availability?userId=${user.id}&startDate=${startDate}&endDate=${endDate}`,
          {
            headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
            signal: abortControllerRef.current.signal,
          },
        );

        // Special handling for 502 Bad Gateway errors
        if (response.status === 502) {
          console.warn(&quot;Received 502 Bad Gateway, treating as empty response&quot;);
          setMyBlocks([]);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error(
              &quot;You are not authorized to view this availability data&quot;,
            );
          } else if (response.status === 403) {
            throw new Error(
              &quot;You do not have permission to view this availability data&quot;,
            );
          } else if (response.status === 404) {
            throw new Error(&quot;No availability data found for this time period&quot;);
          } else if (response.status === 500) {
            throw new Error(&quot;Server error while retrieving availability data&quot;);
          } else {
            throw new Error(
              `Failed to fetch availability data (Status: ${response.status})`,
            );
          }
        }

        // Parse response data
        data = await response.json();
        console.log(&quot;API response data:&quot;, data);
      } catch (fetchError) {
        // If AbortError, just return silently
        if (fetchError instanceof Error && fetchError.name === &quot;AbortError&quot;) {
          return;
        }

        console.error(&quot;Fetch error:&quot;, fetchError);
        // For network errors, just return empty data
        if (
          fetchError instanceof Error &&
          (fetchError.message.includes(&quot;NetworkError&quot;) ||
            fetchError.message.includes(&quot;Failed to fetch&quot;) ||
            fetchError.message.includes(&quot;Network request failed&quot;))
        ) {
          console.warn(
            &quot;Network error while fetching availability, returning empty data&quot;,
          );
          setMyBlocks([]);
          return;
        }

        // For other types of errors, re-throw
        throw fetchError;
      }

      // Handle different response formats
      if (Array.isArray(data)) {
        setMyBlocks(data);
      } else if (data.success && Array.isArray(data.data)) {
        setMyBlocks(data.data);
      } else if (data.data && Array.isArray(data.data)) {
        setMyBlocks(data.data);
      } else {
        setMyBlocks([]);
        setError(&quot;No availability data found&quot;);
      }

      // If user is field manager or admin, fetch team availability
      if (isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER)) {
        try {
          const teamResponse = await fetch(
            `/api/availability/team?startDate=${startDate}&endDate=${endDate}`,
            {
              headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
              signal: abortControllerRef.current.signal,
            },
          );

          if (!teamResponse.ok) {
            console.error(
              &quot;Failed to fetch team availability:&quot;,
              teamResponse.status,
            );
            setTeamBlocks([]);
          } else {
            const teamData = await teamResponse.json();

            // Handle different response formats
            if (Array.isArray(teamData)) {
              setTeamBlocks(teamData);
            } else if (teamData.success && Array.isArray(teamData.data)) {
              setTeamBlocks(teamData.data);
            } else if (teamData.data && Array.isArray(teamData.data)) {
              setTeamBlocks(teamData.data);
            } else {
              setTeamBlocks([]);
            }
          }
        } catch (teamError) {
          if (teamError instanceof Error && teamError.name !== &quot;AbortError&quot;) {
            console.error(&quot;Error fetching team availability:&quot;, teamError);
            setTeamBlocks([]);
          }
        }
      }
    } catch (error) {
      // Only set error state if it&apos;s not an abort error
      if (error instanceof Error && error.name !== &quot;AbortError&quot;) {
        console.error(&quot;Failed to fetch availability data:&quot;, error);
        setError(error.message || &quot;Failed to fetch availability data&quot;);
        setMyBlocks([]);
        setTeamBlocks([]);
      }
    } finally {
      // Update loading state
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [user, isAtLeastRole, safeFormatDate]);

  // Track initial mount
  const initialMountRef = useRef(true);

  // Fetch data when component mounts or user changes
  useEffect(() => {
    if (user) {
      if (initialMountRef.current) {
        console.log(&quot;Availability page: Initial fetch&quot;);
        initialMountRef.current = false;
        fetchAvailability();
      }
    } else {
      setIsLoading(false);
      setMyBlocks([]);
      setTeamBlocks([]);
    }

    // Cleanup: abort any in-flight requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, fetchAvailability]);

  // Handle deleting a block
  const handleDeleteBlock = async (blockId: number) => {
    if (
      window.confirm(&quot;Are you sure you want to delete this availability block?&quot;)
    ) {
      try {
        // Optimistically update UI
        setMyBlocks((currentBlocks) =>
          currentBlocks.filter((block) => block.id !== blockId),
        );

        // Delete the block via API
        const response = await fetch(`/api/availability/${blockId}`, {
          method: &quot;DELETE&quot;,
        });

        if (!response.ok) {
          throw new Error(&quot;Failed to delete availability block&quot;);
        }

        // Refresh data if needed
        fetchAvailability();
      } catch (err) {
        console.error(&quot;Error deleting availability block:&quot;, err);
        alert(&quot;Error deleting availability block. Please try again.&quot;);
        fetchAvailability();
      }
    }
  };

  // Filter blocks based on search query and status
  const filteredBlocks = myBlocks.filter((block) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === &quot;&quot; ||
      block.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format(new Date(block.startDate), &quot;MMM dd, yyyy&quot;)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === &quot;all&quot; || block.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // If not logged in, show a message
  if (!user) {
    return (
      <div className=&quot;p-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-6&quot;>Availability Management</h1>
        <div className=&quot;bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded&quot;>
          <div className=&quot;flex&quot;>
            <div className=&quot;flex-shrink-0&quot;>
              <svg
                className=&quot;h-5 w-5 text-yellow-400&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
                viewBox=&quot;0 0 20 20&quot;
                fill=&quot;currentColor&quot;
              >
                <path
                  fillRule=&quot;evenodd&quot;
                  d=&quot;M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z&quot;
                  clipRule=&quot;evenodd&quot;
                />
              </svg>
            </div>
            <div className=&quot;ml-3&quot;>
              <p className=&quot;text-sm text-yellow-700&quot;>
                Please sign in to view and manage your availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;p-6 w-full&quot;>
      <h1 className=&quot;text-2xl font-bold mb-6&quot;>
        Availability Management (Simplified View)
      </h1>

      {error && (
        <div className=&quot;bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded&quot;>
          <div className=&quot;flex&quot;>
            <div className=&quot;flex-shrink-0&quot;>
              <svg
                className=&quot;h-5 w-5 text-red-400&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
                viewBox=&quot;0 0 20 20&quot;
                fill=&quot;currentColor&quot;
              >
                <path
                  fillRule=&quot;evenodd&quot;
                  d=&quot;M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z&quot;
                  clipRule=&quot;evenodd&quot;
                />
              </svg>
            </div>
            <div className=&quot;ml-3&quot;>
              <p className=&quot;text-sm text-red-700&quot;>{error}</p>
              <button
                onClick={() => fetchAvailability()}
                className=&quot;mt-2 text-sm text-red-700 underline font-medium hover:text-red-600&quot;
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className=&quot;flex justify-center items-center h-64&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500&quot;></div>
        </div>
      ) : (
        <div className=&quot;w-full&quot;>
          <div className=&quot;mb-6 border-b&quot;>
            <div className=&quot;flex space-x-4&quot;>
              <button
                className={`pb-2 px-2 border-b-2 border-teal-600 font-semibold text-teal-600`}
              >
                Simplified List View
              </button>
            </div>
          </div>

          <p className=&quot;mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-blue-700&quot;>
            Due to technical issues, we&apos;re showing a simplified view of your
            availability. To add, edit, or manage your availability blocks,
            please use the Calendar tab.
          </p>

          <div>
            <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4&quot;>
              <div className=&quot;flex items-center&quot;>
                <h2 className=&quot;text-lg font-semibold&quot;>
                  My Availability Blocks
                </h2>
                <div className=&quot;ml-4&quot;>
                  <ThemeToggle />
                </div>
              </div>

              <div className=&quot;mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto&quot;>
                {/* Search input */}
                <div className=&quot;relative&quot;>
                  <input
                    type=&quot;text&quot;
                    placeholder=&quot;Search availability...&quot;
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=&quot;w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white&quot;
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery(&quot;&quot;)}
                      className=&quot;absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100&quot;
                    >
                      <svg
                        xmlns=&quot;http://www.w3.org/2000/svg&quot;
                        className=&quot;h-4 w-4&quot;
                        fill=&quot;none&quot;
                        viewBox=&quot;0 0 24 24&quot;
                        stroke=&quot;currentColor&quot;
                      >
                        <path
                          strokeLinecap=&quot;round&quot;
                          strokeLinejoin=&quot;round&quot;
                          strokeWidth={2}
                          d=&quot;M6 18L18 6M6 6l12 12&quot;
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Status filter dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className=&quot;px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white&quot;
                >
                  <option value=&quot;all&quot;>All Statuses</option>
                  <option value=&quot;available&quot;>Available</option>
                  <option value=&quot;unavailable&quot;>Unavailable</option>
                  <option value=&quot;tentative&quot;>Tentative</option>
                </select>
              </div>
            </div>

            {/* Blocks table */}
            {isLoading ? (
              <div className=&quot;flex justify-center items-center h-20&quot;>
                <div className=&quot;animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500&quot;></div>
              </div>
            ) : filteredBlocks.length > 0 ? (
              <div className=&quot;overflow-x-auto&quot;>
                <table className=&quot;w-full border-collapse dark:border-gray-700&quot;>
                  <thead>
                    <tr className=&quot;bg-gray-100 dark:bg-gray-800&quot;>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        Title
                      </th>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        Start Date
                      </th>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        End Date
                      </th>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        Status
                      </th>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        Recurring
                      </th>
                      <th className=&quot;p-2 text-left border dark:border-gray-700 dark:text-gray-200&quot;>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlocks.map((block) => (
                      <tr
                        key={block.id}
                        className=&quot;border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white&quot;
                      >
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          {block.title || &quot;Untitled&quot;}
                        </td>
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          {block.startDate instanceof Date
                            ? format(block.startDate, &quot;MMM dd, yyyy h:mm a&quot;)
                            : format(
                                new Date(block.startDate),
                                &quot;MMM dd, yyyy h:mm a&quot;,
                              )}
                        </td>
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          {block.endDate instanceof Date
                            ? format(block.endDate, &quot;MMM dd, yyyy h:mm a&quot;)
                            : format(
                                new Date(block.endDate),
                                &quot;MMM dd, yyyy h:mm a&quot;,
                              )}
                        </td>
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${
                              block.status === &quot;available&quot;
                                ? &quot;bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100&quot;
                                : block.status === &quot;unavailable&quot;
                                  ? &quot;bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100&quot;
                                  : &quot;bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100&quot;
                            }`}
                          >
                            {block.status.charAt(0).toUpperCase() +
                              block.status.slice(1)}
                          </span>
                        </td>
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          {block.isRecurring ? (
                            <span className=&quot;inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100&quot;>
                              Weekly
                            </span>
                          ) : (
                            &quot;No&quot;
                          )}
                        </td>
                        <td className=&quot;p-2 border dark:border-gray-700&quot;>
                          <div className=&quot;flex space-x-2&quot;>
                            <button
                              className=&quot;text-red-500 hover:text-red-700 font-medium dark:text-red-400 dark:hover:text-red-300&quot;
                              onClick={() => handleDeleteBlock(block.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className=&quot;text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700&quot;>
                <svg
                  className=&quot;mx-auto h-12 w-12 text-gray-400 dark:text-gray-500&quot;
                  fill=&quot;none&quot;
                  stroke=&quot;currentColor&quot;
                  viewBox=&quot;0 0 24 24&quot;
                  xmlns=&quot;http://www.w3.org/2000/svg&quot;
                >
                  <path
                    strokeLinecap=&quot;round&quot;
                    strokeLinejoin=&quot;round&quot;
                    strokeWidth={2}
                    d=&quot;M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z&quot;
                  />
                </svg>
                <h3 className=&quot;mt-2 text-sm font-medium text-gray-900 dark:text-white&quot;>
                  No availability blocks found
                </h3>
                <p className=&quot;mt-1 text-sm text-gray-500 dark:text-gray-400&quot;>
                  {searchQuery || statusFilter !== &quot;all&quot;
                    ? &quot;Try adjusting your search or filter criteria.&quot;
                    : &quot;Add some using the Calendar view.&quot;}
                </p>
                {(searchQuery || statusFilter !== &quot;all&quot;) && (
                  <button
                    onClick={() => {
                      setSearchQuery(&quot;&quot;);
                      setStatusFilter(&quot;all&quot;);
                    }}
                    className=&quot;mt-3 text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
