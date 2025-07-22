"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import AgentCalendar from "./AgentCalendar";
import { useTheme } from "../../hooks/useTheme";
import { useSidebarState } from "../../hooks/useSidebarState";
import ErrorBoundary from "../ErrorBoundary";

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
    console.log("Calendar: useEffect triggered with userId:", userId);

    // Always set mounted status
    mountedRef.current = true;

    if (userId) {
      console.log("Calendar: Initial mount with userId:", userId);

      // Immediately render the calendar when userId is available
      console.log("Calendar: Immediate render starting...");
      setShouldRender(true);
      setHasError(false);

      // Cleanup function to handle unmounting
      return () => {
        console.log("Calendar: Cleanup called");
        mountedRef.current = false;
        setShouldRender(false);
      };
    }
  }, [userId]); // userId is the only dependency we need

  // Handle sidebar collapse state changes
  useEffect(() => {
    if (shouldRender && calendarRef.current) {
      console.log("Sidebar state changed, updating calendar size");
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
    "CalendarWrapper: Rendering with userId:",
    userId,
    "shouldRender:",
    shouldRender,
    "isLoading:",
    isLoading,
  );

  return (
    <div className="calendar-wrapper w-full">
      {/* Error display (if needed) */}
      {hasError && (
        <div className="mb-4 w-full">
          <p className="text-red-600">
            There was a problem loading the calendar data.
            <button
              onClick={refreshCalendar}
              className="ml-2 text-sm underline hover:text-red-800"
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
          className={`${theme === "dark" ? "bg-gray-800 fc-theme-dark" : "bg-white"} rounded-lg shadow w-full`}
          data-theme={theme}
        >
          <ErrorBoundary
            onError={(error) => {
              console.error("Calendar error caught by boundary:", error);
              handleError();
            }}
            errorComponent={(error, reset) => (
              <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
                <h3 className="font-bold mb-2">Calendar Error</h3>
                <p className="mb-4">
                  There was a problem loading the calendar component.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={reset}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={refreshCalendar}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
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
          className={`flex justify-center items-center h-64 w-full ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow p-4`}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          {false && (
            <div className="ml-3 text-sm text-gray-600 dark:text-gray-300">
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
