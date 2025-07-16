"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { useAuthorization } from "../hooks/useAuthorization";
import { USER_ROLES } from "../../shared/rbac/roles";
import { useTheme } from "../hooks/useTheme";
import { useSidebarState } from "../hooks/useSidebarState";
import { ThemeToggle } from "../components/ui/theme-toggle";
import ErrorBoundary from "../components/ErrorBoundary";

// Define simplified AvailabilityDTO interface directly in this file
interface SimpleAvailabilityDTO {
  id: number;
  userId: number;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  status: "available" | "unavailable" | "tentative";
  isRecurring: boolean;
  recurrencePattern?: string;
  dayOfWeek?: number;
  recurrenceGroup?: string;
  recurrenceEndType?: "never" | "count" | "date";
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
  const [activeTab, setActiveTab] = useState<"list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "unavailable" | "tentative"
  >("all");

  // Abort controller for API requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to safely format a date for API requests
  const safeFormatDate = useCallback((date: Date, offset = 0) => {
    try {
      const newDate = new Date(date);
      if (offset) {
        newDate.setDate(newDate.getDate() + offset);
      }
      return newDate.toISOString().split("T")[0];
    } catch (e) {
      // If date parsing fails, use current date
      const fallbackDate = new Date();
      if (offset) {
        fallbackDate.setDate(fallbackDate.getDate() + offset);
      }
      return fallbackDate.toISOString().split("T")[0];
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    if (!user) {
      setError("Please sign in to view your availability");
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
            headers: { "Content-Type": "application/json" },
            signal: abortControllerRef.current.signal,
          },
        );

        // Special handling for 502 Bad Gateway errors
        if (response.status === 502) {
          console.warn("Received 502 Bad Gateway, treating as empty response");
          setMyBlocks([]);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error(
              "You are not authorized to view this availability data",
            );
          } else if (response.status === 403) {
            throw new Error(
              "You do not have permission to view this availability data",
            );
          } else if (response.status === 404) {
            throw new Error("No availability data found for this time period");
          } else if (response.status === 500) {
            throw new Error("Server error while retrieving availability data");
          } else {
            throw new Error(
              `Failed to fetch availability data (Status: ${response.status})`,
            );
          }
        }

        // Parse response data
        data = await response.json();
        console.log("API response data:", data);
      } catch (fetchError) {
        // If AbortError, just return silently
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error("Fetch error:", fetchError);
        // For network errors, just return empty data
        if (
          fetchError instanceof Error &&
          (fetchError.message.includes("NetworkError") ||
            fetchError.message.includes("Failed to fetch") ||
            fetchError.message.includes("Network request failed"))
        ) {
          console.warn(
            "Network error while fetching availability, returning empty data",
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
        setError("No availability data found");
      }

      // If user is field manager or admin, fetch team availability
      if (isAtLeastRole(USER_ROLES.INTERNAL_FIELD_MANAGER)) {
        try {
          const teamResponse = await fetch(
            `/api/availability/team?startDate=${startDate}&endDate=${endDate}`,
            {
              headers: { "Content-Type": "application/json" },
              signal: abortControllerRef.current.signal,
            },
          );

          if (!teamResponse.ok) {
            console.error(
              "Failed to fetch team availability:",
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
          if (teamError instanceof Error && teamError.name !== "AbortError") {
            console.error("Error fetching team availability:", teamError);
            setTeamBlocks([]);
          }
        }
      }
    } catch (error) {
      // Only set error state if it's not an abort error
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch availability data:", error);
        setError(error.message || "Failed to fetch availability data");
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
        console.log("Availability page: Initial fetch");
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
      window.confirm("Are you sure you want to delete this availability block?")
    ) {
      try {
        // Optimistically update UI
        setMyBlocks((currentBlocks) =>
          currentBlocks.filter((block) => block.id !== blockId),
        );

        // Delete the block via API
        const response = await fetch(`/api/availability/${blockId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete availability block");
        }

        // Refresh data if needed
        fetchAvailability();
      } catch (err) {
        console.error("Error deleting availability block:", err);
        alert("Error deleting availability block. Please try again.");
        fetchAvailability();
      }
    }
  };

  // Filter blocks based on search query and status
  const filteredBlocks = myBlocks.filter((block) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      block.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format(new Date(block.startDate), "MMM dd, yyyy")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || block.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // If not logged in, show a message
  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Availability Management</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please sign in to view and manage your availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">
        Availability Management (Simplified View)
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchAvailability()}
                className="mt-2 text-sm text-red-700 underline font-medium hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="w-full">
          <div className="mb-6 border-b">
            <div className="flex space-x-4">
              <button
                className={`pb-2 px-2 border-b-2 border-teal-600 font-semibold text-teal-600`}
              >
                Simplified List View
              </button>
            </div>
          </div>

          <p className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-blue-700">
            Due to technical issues, we're showing a simplified view of your
            availability. To add, edit, or manage your availability blocks,
            please use the Calendar tab.
          </p>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">
                  My Availability Blocks
                </h2>
                <div className="ml-4">
                  <ThemeToggle />
                </div>
              </div>

              <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search availability..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Status filter dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="tentative">Tentative</option>
                </select>
              </div>
            </div>

            {/* Blocks table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : filteredBlocks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        Title
                      </th>
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        Start Date
                      </th>
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        End Date
                      </th>
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        Status
                      </th>
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        Recurring
                      </th>
                      <th className="p-2 text-left border dark:border-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlocks.map((block) => (
                      <tr
                        key={block.id}
                        className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white"
                      >
                        <td className="p-2 border dark:border-gray-700">
                          {block.title || "Untitled"}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          {block.startDate instanceof Date
                            ? format(block.startDate, "MMM dd, yyyy h:mm a")
                            : format(
                                new Date(block.startDate),
                                "MMM dd, yyyy h:mm a",
                              )}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          {block.endDate instanceof Date
                            ? format(block.endDate, "MMM dd, yyyy h:mm a")
                            : format(
                                new Date(block.endDate),
                                "MMM dd, yyyy h:mm a",
                              )}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${
                              block.status === "available"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : block.status === "unavailable"
                                  ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                            }`}
                          >
                            {block.status.charAt(0).toUpperCase() +
                              block.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          {block.isRecurring ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Weekly
                            </span>
                          ) : (
                            "No"
                          )}
                        </td>
                        <td className="p-2 border dark:border-gray-700">
                          <div className="flex space-x-2">
                            <button
                              className="text-red-500 hover:text-red-700 font-medium dark:text-red-400 dark:hover:text-red-300"
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
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No availability blocks found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Add some using the Calendar view."}
                </p>
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
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
