&quot;use client&quot;;

import React, { useState, useEffect, useCallback, memo, useRef } from &quot;react&quot;;
import AgentCalendar from &quot;./AgentCalendar&quot;;
import { useTheme } from &quot;@/hooks/useTheme&quot;;
import { useSidebarState } from &quot;@/hooks/useSidebarState&quot;;
import ErrorBoundary from &quot;@/components/ErrorBoundary&quot;;

interface CalendarWrapperProps {
  userId: number;
  viewOnly?: boolean;
  debug?: boolean;
}

/**
 * CalendarWrapper
 * This component wraps the main AgentCalendar component and manages:
 * 1. Ensuring the calendar is only rendered once the userId is available
 * 2. Preventing unnecessary re-renders that cause continuous API calls
 * 3. Implementing a manual refresh mechanism
 * 4. Handling error recovery and component lifecycle
 * 5. Providing a global API request throttling mechanism
 */
function CalendarWrapper({
  userId,
  viewOnly = false,
  debug = false,
}: CalendarWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [instanceKey, setInstanceKey] = useState(Date.now()); // Used to force re-render
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(false);
  const calendarRef = useRef<any>(null);

  // Get current theme context
  const { theme } = useTheme();

  // Get sidebar state
  const { sidebarCollapsed } = useSidebarState();

  // Current userId reference to avoid stale closures
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Global request throttling - will be passed down to AgentCalendar
  const globalApiThrottleRef = useRef<{
    lastRequestTime: number;
    isPending: boolean;
    requestQueue: Array<() => Promise<void>>;
    cache: Record<string, any>;
  }>({
    lastRequestTime: 0,
    isPending: false,
    requestQueue: [],
    cache: {},
  });

  // Only render the calendar once, when the component mounts and userId is available
  useEffect(() => {
    console.log(&quot;Calendar: useEffect triggered with userId:&quot;, userId);

    // Always set mounted status
    mountedRef.current = true;

    if (userId) {
      console.log(&quot;Calendar: Initial mount with userId:&quot;, userId);

      // Immediately render the calendar when userId is available
      console.log(&quot;Calendar: Immediate render starting...&quot;);
      setShouldRender(true);
      setHasError(false);

      // Cleanup function to handle unmounting
      return () => {
        console.log(&quot;Calendar: Cleanup called&quot;);
        mountedRef.current = false;
        setShouldRender(false);
      };
    }
  }, [userId]); // userId is the only dependency we need

  // Handle sidebar collapse state changes
  useEffect(() => {
    if (shouldRender && calendarRef.current) {
      console.log(&quot;Sidebar state changed, updating calendar size&quot;);
      // Update calendar size when sidebar changes
      const calendarApi = calendarRef.current.getApi();
      setTimeout(() => {
        calendarApi.updateSize();
      }, 100);
    }
  }, [sidebarCollapsed, shouldRender]);

  // Function to manually refresh the calendar by re-mounting it
  const refreshCalendar = useCallback(() => {
    setIsLoading(true);
    setShouldRender(false);
    setHasError(false);

    // Clear any pending requests
    globalApiThrottleRef.current.requestQueue = [];
    globalApiThrottleRef.current.isPending = false;

    // Short delay to ensure unmounting completes
    setTimeout(() => {
      setInstanceKey(Date.now());
      setShouldRender(true);
    }, 100);
  }, []);

  // Handle errors from child components
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Handle loading state changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  console.log(
    &quot;CalendarWrapper: Rendering with userId:&quot;,
    userId,
    &quot;shouldRender:&quot;,
    shouldRender,
    &quot;isLoading:&quot;,
    isLoading,
  );

  return (
    <div className=&quot;calendar-wrapper w-full&quot;>
      {/* Error display (if needed) */}
      {hasError && (
        <div className=&quot;mb-4 w-full&quot;>
          <p className=&quot;text-red-600&quot;>
            There was a problem loading the calendar data.
            <button
              onClick={refreshCalendar}
              className=&quot;ml-2 text-sm underline hover:text-red-800&quot;
            >
              Try again
            </button>
          </p>
        </div>
      )}

      {/* Calendar - only render once and prevent automatic re-renders */}
      {shouldRender && (
        <div
          key={instanceKey}
          className={`${theme === &quot;dark&quot; ? &quot;bg-gray-800 fc-theme-dark&quot; : &quot;bg-white&quot;} rounded-lg shadow w-full`}
          data-theme={theme}
        >
          <ErrorBoundary
            onError={(error) => {
              console.error(&quot;Calendar error caught by boundary:&quot;, error);
              handleError();
            }}
            errorComponent={(error, reset) => (
              <div className=&quot;p-4 border border-red-300 rounded bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200&quot;>
                <h3 className=&quot;font-bold mb-2&quot;>Calendar Error</h3>
                <p className=&quot;mb-4&quot;>
                  There was a problem loading the calendar component.
                </p>
                <div className=&quot;flex space-x-4&quot;>
                  <button
                    onClick={reset}
                    className=&quot;px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700&quot;
                  >
                    Try Again
                  </button>
                  <button
                    onClick={refreshCalendar}
                    className=&quot;px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700&quot;
                  >
                    Reload Calendar
                  </button>
                </div>
              </div>
            )}
          >
            <MemoizedAgentCalendar
              userId={userId}
              viewOnly={viewOnly}
              onError={handleError}
              onLoadingChange={handleLoadingChange}
              globalThrottle={globalApiThrottleRef.current}
              debug={false}
              ref={calendarRef}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Loading/error state */}
      {(!shouldRender || isLoading) && (
        <div
          className={`flex justify-center items-center h-64 w-full ${theme === &quot;dark&quot; ? &quot;bg-gray-800&quot; : &quot;bg-white&quot;} rounded-lg shadow p-4`}
        >
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500&quot;></div>
          {false && (
            <div className=&quot;ml-3 text-sm text-gray-600 dark:text-gray-300&quot;>
              Loading calendar (userId: {userId})
            </div>
          )}
        </div>
      )}

      {/* Debug information removed as requested */}
    </div>
  );
}

// Memoize the AgentCalendar component to prevent unnecessary re-renders
// Use forwardRef to allow the ref to be passed to the AgentCalendar
const MemoizedAgentCalendar = memo(
  React.forwardRef((props: any, ref) => {
    return <AgentCalendar {...props} fullCalendarRef={ref} />;
  }),
);

export default memo(CalendarWrapper);
