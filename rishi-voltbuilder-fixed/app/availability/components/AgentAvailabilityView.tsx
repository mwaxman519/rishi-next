"use client";

import { useState, useEffect, Suspense } from "react";
import { AvailabilityDTO } from "../../models/availability";
import { format } from "date-fns";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { useTheme } from "../../hooks/useTheme";
import { useSidebarState } from "../../hooks/useSidebarState";
import { Sun, Moon } from "lucide-react";
import { memo } from "react";

import ErrorBoundary from "../../components/ErrorBoundary";

// Import only what we need for the list view directly
import AvailabilityForm from "../../components/agent-calendar/AvailabilityForm";
import EditAvailabilityForm from "../../components/agent-calendar/EditAvailabilityForm";

// Import the calendar provider
import { CalendarProvider } from "../../components/agent-calendar/CalendarProvider";

interface AgentAvailabilityViewProps {
  userId: number;
  availabilityBlocks: AvailabilityDTO[];
}

// Use memo to prevent unnecessary re-renders
const AgentAvailabilityView = memo(function AgentAvailabilityView({
  userId,
  availabilityBlocks: initialBlocks,
}: AgentAvailabilityViewProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<AvailabilityDTO[]>(initialBlocks);
  const [editingBlock, setEditingBlock] = useState<AvailabilityDTO | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "unavailable" | "tentative"
  >("all");
  const { theme, toggleTheme } = useTheme();
  const { sidebarCollapsed } = useSidebarState();

  // Refresh blocks when initial data changes or after operations
  useEffect(() => {
    // Only update if there's a meaningful difference to avoid unnecessary renders
    if (JSON.stringify(initialBlocks) !== JSON.stringify(blocks)) {
      setBlocks(initialBlocks);
      setIsLoading(false);
    }
  }, [initialBlocks, blocks]);

  // Use this function to notify parent component that a refresh is needed
  // Rather than fetching data directly, we'll trigger UI updates locally
  // and depend on the parent component to provide fresh data
  const fetchAvailabilityBlocks = async () => {
    // Don't use setTimeout which can cause timing issues and re-renders
    setIsLoading(true);
    // Just increment the refresh key and immediately update the UI
    setRefreshKey((prev) => prev + 1);
    setIsLoading(false);
  };

  const handleAvailabilitySuccess = () => {
    // Refresh calendar data
    setRefreshKey((prev) => prev + 1);
    // Refresh blocks list
    fetchAvailabilityBlocks();
  };

  const handleEditClick = (block: AvailabilityDTO) => {
    setEditingBlock(block);
  };

  const handleEditCancel = () => {
    setEditingBlock(null);
  };

  const handleEditSuccess = () => {
    setEditingBlock(null);
    handleAvailabilitySuccess();
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (
      window.confirm("Are you sure you want to delete this availability block?")
    ) {
      try {
        // Optimistically update UI by removing the block immediately
        // This gives users immediate feedback before API request completes
        setBlocks((currentBlocks) =>
          currentBlocks.filter((block) => block.id !== blockId),
        );

        // Then actually delete the block on the server
        const response = await fetch(`/api/availability/${blockId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // If the API call fails, restore the original block list
          // by triggering a refresh from the parent
          throw new Error("Failed to delete availability block");
        }

        // After successful API call, refresh calendar view and any other data
        // The list will already show the block as deleted
        handleAvailabilitySuccess();
      } catch (err) {
        console.error("Error deleting availability block:", err);
        alert("Error deleting availability block. Please try again.");

        // Refresh the data to ensure consistency after an error
        fetchAvailabilityBlocks();
      }
    }
  };

  // Filter blocks based on search query and status
  const filteredBlocks = blocks.filter((block) => {
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

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-2 ${activeTab === "calendar" ? "border-b-2 border-teal-600 font-semibold text-teal-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("calendar")}
          >
            Calendar View
          </button>
          <button
            className={`pb-2 px-2 ${activeTab === "list" ? "border-b-2 border-teal-600 font-semibold text-teal-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("list")}
          >
            List View
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {activeTab === "calendar" && (
        <div className="mb-6">
          <div className="mb-6">
            <div style={{ height: "700px" }} className="w-full">
              {/* Using our wrapper to prevent infinite re-renders */}
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
                    <h3 className="font-bold mb-2">Calendar Error</h3>
                    <p className="mb-2">
                      {error.message ||
                        "An error occurred while loading the calendar"}
                    </p>
                    <button
                      onClick={reset}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              >
                <CalendarProvider userId={userId}>
                  {/* Placeholder for calendar - component has been removed */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-center">
                    <p>
                      Calendar view has been migrated to the main availability
                      page.
                    </p>
                  </div>
                </CalendarProvider>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {activeTab === "list" && (
        <div>
          {/* Show edit form if editing a block */}
          {editingBlock ? (
            <div className="mb-6">
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
                    <h3 className="font-bold mb-2">Form Error</h3>
                    <p className="mb-2">
                      {error.message ||
                        "An error occurred while loading the edit form"}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={reset}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  </div>
                )}
              >
                <EditAvailabilityForm
                  availabilityBlock={editingBlock}
                  onSuccess={handleEditSuccess}
                  onCancel={handleEditCancel}
                />
              </ErrorBoundary>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Add Availability</h2>
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
                    <h3 className="font-bold mb-2">Form Error</h3>
                    <p className="mb-2">
                      {error.message ||
                        "An error occurred while loading the availability form"}
                    </p>
                    <button
                      onClick={reset}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              >
                <AvailabilityForm
                  userId={userId}
                  onSuccess={handleAvailabilitySuccess}
                  className="mb-8"
                />
              </ErrorBoundary>
            </div>
          )}

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
                              className="text-blue-500 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => handleEditClick(block)}
                            >
                              Edit
                            </button>
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
                    : "Add some using the form above."}
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
});

export default AgentAvailabilityView;
