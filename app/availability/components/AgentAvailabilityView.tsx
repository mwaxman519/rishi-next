&quot;use client&quot;;

import { useState, useEffect, Suspense } from &quot;react&quot;;
import { AvailabilityDTO } from &quot;../../models/availability&quot;;
import { format } from &quot;date-fns&quot;;
import { ThemeToggle } from &quot;../../components/ui/theme-toggle&quot;;
import { useTheme } from &quot;@/hooks/useTheme&quot;;
import { useSidebarState } from &quot;@/hooks/useSidebarState&quot;;
import { Sun, Moon } from &quot;lucide-react&quot;;
import { memo } from &quot;react&quot;;

import ErrorBoundary from &quot;../../components/ErrorBoundary&quot;;

// Import only what we need for the list view directly
import AvailabilityForm from &quot;../../components/agent-calendar/AvailabilityForm&quot;;
import EditAvailabilityForm from &quot;../../components/agent-calendar/EditAvailabilityForm&quot;;

// Import the calendar provider
import { CalendarProvider } from &quot;../../components/agent-calendar/CalendarProvider&quot;;

interface AgentAvailabilityViewProps {
  userId: number;
  availabilityBlocks: AvailabilityDTO[];
}

// Use memo to prevent unnecessary re-renders
const AgentAvailabilityView = memo(function AgentAvailabilityView({
  userId,
  availabilityBlocks: initialBlocks,
}: AgentAvailabilityViewProps) {
  const [activeTab, setActiveTab] = useState<&quot;calendar&quot; | &quot;list&quot;>(&quot;calendar&quot;);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<AvailabilityDTO[]>(initialBlocks);
  const [editingBlock, setEditingBlock] = useState<AvailabilityDTO | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState<
    &quot;all&quot; | &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;
  >(&quot;all&quot;);
  const { theme, toggleTheme } = useTheme();
  const { sidebarCollapsed } = useSidebarState();

  // Refresh blocks when initial data changes or after operations
  useEffect(() => {
    // Only update if there&apos;s a meaningful difference to avoid unnecessary renders
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
      window.confirm(&quot;Are you sure you want to delete this availability block?&quot;)
    ) {
      try {
        // Optimistically update UI by removing the block immediately
        // This gives users immediate feedback before API request completes
        setBlocks((currentBlocks) =>
          currentBlocks.filter((block) => block.id !== blockId),
        );

        // Then actually delete the block on the server
        const response = await fetch(`/api/availability/${blockId}`, {
          method: &quot;DELETE&quot;,
        });

        if (!response.ok) {
          // If the API call fails, restore the original block list
          // by triggering a refresh from the parent
          throw new Error(&quot;Failed to delete availability block&quot;);
        }

        // After successful API call, refresh calendar view and any other data
        // The list will already show the block as deleted
        handleAvailabilitySuccess();
      } catch (err) {
        console.error(&quot;Error deleting availability block:&quot;, err);
        alert(&quot;Error deleting availability block. Please try again.&quot;);

        // Refresh the data to ensure consistency after an error
        fetchAvailabilityBlocks();
      }
    }
  };

  // Filter blocks based on search query and status
  const filteredBlocks = blocks.filter((block) => {
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

  return (
    <div>
      {/* Tab navigation */}
      <div className=&quot;mb-6 border-b&quot;>
        <div className=&quot;flex space-x-4&quot;>
          <button
            className={`pb-2 px-2 ${activeTab === &quot;calendar&quot; ? &quot;border-b-2 border-teal-600 font-semibold text-teal-600&quot; : &quot;text-gray-500&quot;}`}
            onClick={() => setActiveTab(&quot;calendar&quot;)}
          >
            Calendar View
          </button>
          <button
            className={`pb-2 px-2 ${activeTab === &quot;list&quot; ? &quot;border-b-2 border-teal-600 font-semibold text-teal-600&quot; : &quot;text-gray-500&quot;}`}
            onClick={() => setActiveTab(&quot;list&quot;)}
          >
            List View
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {activeTab === &quot;calendar&quot; && (
        <div className=&quot;mb-6&quot;>
          <div className=&quot;mb-6&quot;>
            <div style={{ height: &quot;700px&quot; }} className=&quot;w-full&quot;>
              {/* Using our wrapper to prevent infinite re-renders */}
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className=&quot;p-4 border border-red-300 rounded bg-red-50 text-red-700&quot;>
                    <h3 className=&quot;font-bold mb-2&quot;>Calendar Error</h3>
                    <p className=&quot;mb-2&quot;>
                      {error.message ||
                        &quot;An error occurred while loading the calendar&quot;}
                    </p>
                    <button
                      onClick={reset}
                      className=&quot;px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700&quot;
                    >
                      Try Again
                    </button>
                  </div>
                )}
              >
                <CalendarProvider userId={userId}>
                  {/* Placeholder for calendar - component has been removed */}
                  <div className=&quot;bg-gray-100 dark:bg-gray-800 rounded p-4 text-center&quot;>
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
      {activeTab === &quot;list&quot; && (
        <div>
          {/* Show edit form if editing a block */}
          {editingBlock ? (
            <div className=&quot;mb-6&quot;>
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className=&quot;p-4 border border-red-300 rounded bg-red-50 text-red-700&quot;>
                    <h3 className=&quot;font-bold mb-2&quot;>Form Error</h3>
                    <p className=&quot;mb-2&quot;>
                      {error.message ||
                        &quot;An error occurred while loading the edit form&quot;}
                    </p>
                    <div className=&quot;flex space-x-3&quot;>
                      <button
                        onClick={reset}
                        className=&quot;px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700&quot;
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className=&quot;px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700&quot;
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
            <div className=&quot;mb-6&quot;>
              <h2 className=&quot;text-lg font-semibold mb-4&quot;>Add Availability</h2>
              <ErrorBoundary
                errorComponent={(error, reset) => (
                  <div className=&quot;p-4 border border-red-300 rounded bg-red-50 text-red-700&quot;>
                    <h3 className=&quot;font-bold mb-2&quot;>Form Error</h3>
                    <p className=&quot;mb-2&quot;>
                      {error.message ||
                        &quot;An error occurred while loading the availability form&quot;}
                    </p>
                    <button
                      onClick={reset}
                      className=&quot;px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700&quot;
                    >
                      Try Again
                    </button>
                  </div>
                )}
              >
                <AvailabilityForm
                  userId={userId}
                  onSuccess={handleAvailabilitySuccess}
                  className=&quot;mb-8&quot;
                />
              </ErrorBoundary>
            </div>
          )}

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
                              className=&quot;text-blue-500 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300&quot;
                              onClick={() => handleEditClick(block)}
                            >
                              Edit
                            </button>
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
                    : &quot;Add some using the form above.&quot;}
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
});

export default AgentAvailabilityView;
