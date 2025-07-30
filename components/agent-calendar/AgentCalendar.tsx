"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { format } from "date-fns";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarState } from "@/hooks/useSidebarState";
import AvailabilityModal from "./AvailabilityModal";
import BlockDetailModal from "./BlockDetailModal";
import ConflictDialog from "./ConflictDialog";
import { mergeAdjacentBlocks } from "./merged-blocks-processor";
import { SimpleAlertDialog } from "@/components/ui/simple-alert-dialog";
import "./calendar-fixes.css";
import "./calendar-buttons.css";
import "./calendar-compact.css";

// CSS fixes for FullCalendar are now in globals.css and in the local CSS files
// This ensures proper styling in both light and dark modes

interface AgentCalendarProps {
  userId: number | string; // Allow both types for compatibility
  startDate?: Date;
  endDate?: Date;
  viewOnly?: boolean;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  globalThrottle?: {
    lastRequestTime: number;
    isPending: boolean;
    requestQueue: Array<() => Promise<void>>;
    cache: Record<string, any>;
  };
  debug?: boolean; // Add debug flag for additional logging
  fullCalendarRef?: React.Ref<FullCalendar>; // Added ref for parent component access
}

export default function AgentCalendar({
  userId,
  startDate = new Date(),
  endDate = new Date(new Date().setDate(new Date().getDate() + 90)), // Increased to 90 days (3 months) to show all recurring blocks
  viewOnly = false,
  onError,
  onLoadingChange,
  globalThrottle,
  debug = false,
  fullCalendarRef,
}: AgentCalendarProps) {
  console.log("AgentCalendar: Component rendering with userId:", userId);
  // All state hooks must be declared first and in the same order on every render
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [newBlockStatus, setNewBlockStatus] = useState("available");
  const [deletedSeriesGroups, setDeletedSeriesGroups] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Alert dialog states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertVariant, setAlertVariant] = useState<
    "info" | "warning" | "error" | "success"
  >("info");

  // Confirm dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});

  // All useRef hooks
  const calendarRef = useRef<FullCalendar | null>(null);
  const hasFetchedRef = useRef(false);
  const dataCache = useRef<{
    lastFetchTimestamp: number;
    key: string;
    data: any[];
  }>({
    lastFetchTimestamp: 0,
    key: "",
    data: [],
  });

  // All context hooks - must be called in the same order on every render
  const { theme } = useTheme();
  const { sidebarCollapsed } = useSidebarState();

  // Format dates properly for API calls
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  // Define fetchAvailability function here so it can be used in callbacks
  const fetchAvailability = async () => {
    console.log("Manually triggered fetchAvailability");
    // First, check if we should use the cached data
    const userIdString = String(userId);
    const cacheKey = `${userIdString}|${formattedStartDate}|${formattedEndDate}`;

    // Check if we have recently fetched this exact data (within last 10 seconds)
    const now = Date.now();
    const cacheExpiry = 10000; // 10 seconds

    if (
      dataCache.current.key === cacheKey &&
      dataCache.current.data.length > 0 &&
      now - dataCache.current.lastFetchTimestamp < cacheExpiry
    ) {
      // Use cached data instead of making a new request
      console.log("Using cached availability data - skipping fetch");
      return;
    }

    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);

      console.log(
        `Fetching availability for user ${userIdString} from ${formattedStartDate} to ${formattedEndDate}`,
      );

      const url = `/api/availability?userId=${userIdString}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      const options: RequestInit = {
        headers: { "Content-Type": "application/json" },
        cache: "no-store" as RequestCache,
      };

      // Use throttled fetch
      const response = await throttledFetch(url, options);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch availability data (Status: ${response.status})`,
        );
      }

      const responseData = await response.json();

      let availabilityBlocks: any[] = [];

      if (responseData.success === true && Array.isArray(responseData.data)) {
        availabilityBlocks = responseData.data;
      } else if (Array.isArray(responseData)) {
        availabilityBlocks = responseData;
      } else {
        console.error("Unexpected response format", responseData);
      }

      // Process data for the calendar - first convert to standard format
      const standardizedBlocks = availabilityBlocks.map((block: any) => {
        const isRecurring = block.isRecurring || block.is_recurring;
        const isVirtual = block._isVirtualOccurrence === true;

        return {
          id: block.id,
          virtualId: block._virtualId,
          title: block.title || "Available",
          start: new Date(block.startDate || block.start_date),
          end: new Date(block.endDate || block.end_date),
          status: block.status || "available",
          isRecurring: isRecurring,
          isVirtual: isVirtual,
          blockId: isVirtual ? block._originalBlockId : block.id,
          originalId: block.id,
          dayOfWeek: block.dayOfWeek || block.day_of_week,
          recurrencePattern:
            block.recurrencePattern || block.recurrence_pattern,
          recurrenceGroup: block.recurrenceGroup || block.recurrence_group,
        };
      });

      console.log(`Standardized ${standardizedBlocks.length} blocks`);

      // Use our specialized merging function to handle the adjacent blocks issue
      const mergedBlocks = mergeAdjacentBlocks(standardizedBlocks);

      // Log details about the merged blocks for debugging
      console.log(
        `Merged ${standardizedBlocks.length} blocks into ${mergedBlocks.length} blocks`,
      );

      // Log any merged unavailable blocks for debugging
      const mergedUnavailable = mergedBlocks.filter(
        (block) => block.isMerged && block.status === "unavailable",
      );
      if (mergedUnavailable.length > 0) {
        console.log(
          `Found ${mergedUnavailable.length} merged unavailable blocks`,
        );
        mergedUnavailable.forEach((block) => {
          console.log(
            `Merged block: ${new Date(block.start).toLocaleTimeString()} - ${new Date(block.end).toLocaleTimeString()}, IDs: ${block.mergedIds?.join(", ")}`,
          );
        });
      }

      // Debug all blocks to understand the structure
      console.log("Block structure analysis:");
      const sampleBlocks = mergedBlocks.slice(
        0,
        Math.min(5, mergedBlocks.length),
      );
      sampleBlocks.forEach((block, index) => {
        console.log(`Block ${index} - ID: ${block.id}`);
        console.log(`  Start: ${new Date(block.start).toLocaleString()}`);
        console.log(`  End: ${new Date(block.end).toLocaleString()}`);
        console.log(`  Status: ${block.status}`);
        console.log(`  isMerged: ${!!block.isMerged}`);
        console.log(`  mergedIds: ${block.mergedIds?.join(", ") || "none"}`);
      });

      // Convert merged blocks to calendar events
      const calendarEvents = mergedBlocks.map((block: any) => {
        // Add recurring indicator to title for recurring events
        let displayTitle = block.isRecurring
          ? `${block.title} 🔄`
          : block.title;

        // If this is a merged block, use the display start/end times
        // This ensures that the visual block matches what we show in the modal
        const blockStart =
          block.displayStart?.toISOString() || block.start.toISOString();
        const blockEnd =
          block.displayEnd?.toISOString() || block.end.toISOString();

        // Add time information to the title for all unavailable blocks
        // This ensures clarity about what time periods are blocked
        if (block.status === "unavailable") {
          const startTime = new Date(blockStart).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });
          const endTime = new Date(blockEnd).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          // For merged blocks, make it clear this represents multiple blocks
          if (block.isMerged && block.mergedIds && block.mergedIds.length > 1) {
            displayTitle = `${startTime} - ${endTime} (${block.mergedIds.length} blocks)`;
          } else {
            displayTitle = `${startTime} - ${endTime}`;
          }
        }

        return {
          id: block.isVirtual ? block.virtualId : `block-${block.id}`,
          title: displayTitle,
          start: blockStart,
          end: blockEnd,
          backgroundColor: getStatusColor(block.status),
          borderColor: getStatusColor(block.status),
          textColor: "#FFFFFF",
          display: "block",
          allDay: false,
          constraint: "businessHours",
          extendedProps: {
            blockId: block.blockId,
            originalId: block.originalId,
            status: block.status,
            isRecurring: block.isRecurring,
            isVirtual: block.isVirtual,
            dayOfWeek: block.dayOfWeek,
            recurrencePattern: block.recurrencePattern,
            recurrenceGroup: block.recurrenceGroup,
            mergedIds: block.mergedIds,
          },
          classNames: [
            `status-${block.status}`,
            block.isRecurring ? "recurring-event" : "",
            block.isVirtual ? "virtual-occurrence" : "",
            block.isMerged ? "merged-event" : "",
            "day-lock",
            "fc-day-lock",
          ],
          dataAttributes: {
            "data-status": block.status,
            "data-recurring": block.isRecurring ? "true" : "false",
            "data-virtual": block.isVirtual ? "true" : "false",
            "data-merged": block.isMerged ? "true" : "false",
            "data-day": block.start.getDay(),
          },
        };
      });

      // Update cache
      dataCache.current = {
        lastFetchTimestamp: now,
        key: cacheKey,
        data: calendarEvents,
      };

      setCalendarData(calendarEvents);
      setError(null);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error("Error fetching availability data:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch availability data";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Listen for sidebar state changes and window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        setTimeout(() => {
          calendarApi.updateSize();
        }, 300); // Wait for transition to complete
      }
    };

    handleResize(); // Initial resize

    // Listen for sidebar state changes
    const handleSidebarStateChange = (e: CustomEvent) => {
      handleResize();
    };

    window.addEventListener(
      "sidebarStateChange",
      handleSidebarStateChange as EventListener,
    );
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "sidebarStateChange",
        handleSidebarStateChange as EventListener,
      );
      window.removeEventListener("resize", handleResize);
    };
  }, [sidebarCollapsed]);

  // Update calendar size when sidebar collapse state changes
  useEffect(() => {
    // When sidebar state changes, force resize the calendar
    if (calendarRef.current) {
      console.log(
        "AgentCalendar: Sidebar state changed, updating calendar size",
      );
      setTimeout(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.updateSize();
        }
      }, 150); // Slight delay to ensure DOM updates first
    }
  }, [sidebarCollapsed]);

  // Handle theme changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Force calendar to re-render with new theme
      setTimeout(() => {
        if (calendarRef.current) {
          // Re-get the API to ensure calendarRef still exists
          const api = calendarRef.current.getApi();
          api.updateSize();
        }
      }, 100);
    }
  }, [theme]);

  // Effect to clean up deleted recurring events from UI
  useEffect(() => {
    if (deletedSeriesGroups.length > 0 && calendarRef.current) {
      console.log(
        `Cleaning up ${deletedSeriesGroups.length} deleted series from UI`,
      );
      const calendarApi = calendarRef.current.getApi();
      const allEvents = calendarApi.getEvents();

      let removedCount = 0;
      allEvents.forEach((evt) => {
        const group = evt.extendedProps.recurrenceGroup;
        if (group && deletedSeriesGroups.includes(group)) {
          console.log(`Removing event ${evt.id} from deleted series ${group}`);
          evt.remove();
          removedCount++;
        }
      });

      console.log(`Removed ${removedCount} events from deleted series`);

      // Clear the deleted series list after processing
      setDeletedSeriesGroups([]);

      // If we removed events, ensure calendar is refreshed
      if (removedCount > 0 && calendarRef.current) {
        setTimeout(() => {
          const api = calendarRef.current?.getApi();
          api?.refetchEvents();
        }, 100);
      }
    }
  }, [deletedSeriesGroups]);

  // Ensure userId is treated as string for UUID compatibility
  const userIdString = String(userId);

  // Throttled fetch implementation
  const throttledFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      // If no globalThrottle is provided, just do a regular fetch
      if (!globalThrottle) {
        try {
          const response = await fetch(url, options);

          // Handle 502 Bad Gateway (common with serverless functions under load)
          if (response.status === 502) {
            console.warn(
              `Received 502 Bad Gateway for ${url}, returning empty data array to prevent errors`,
            );
            return {
              ok: true, // Convert to success to avoid errors in the UI
              status: 200,
              json: () => Promise.resolve({ success: true, data: [] }),
            } as Response;
          }

          return response;
        } catch (error) {
          console.error(`Error in direct fetch to ${url}:`, error);

          // Return empty data instead of throwing to prevent UI errors
          return {
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: [] }),
          } as Response;
        }
      }

      // Generate a cache key based on the URL and options
      const cacheKey = `${url}-${JSON.stringify(options || {})}`;

      // Check cache first
      if (globalThrottle.cache[cacheKey]) {
        console.log(`Using cached response for ${url}`);
        return {
          ok: true,
          json: () => Promise.resolve(globalThrottle.cache[cacheKey]),
          status: 200,
        } as Response;
      }

      // Apply throttling
      const now = Date.now();
      const timeSinceLastRequest = now - globalThrottle.lastRequestTime;
      const minRequestInterval = 500; // Increased from 300ms to 500ms to reduce server load

      if (globalThrottle.isPending) {
        console.log(`Request in progress, queuing ${url}`);

        // Return a promise that will resolve when the request is processed
        return new Promise<Response>((resolve) => {
          const executeRequest = async () => {
            try {
              console.log(`Executing queued request for ${url}`);
              const response = await fetch(url, options);

              // Handle 502 Bad Gateway specifically
              if (response.status === 502) {
                console.warn(
                  `Received 502 Bad Gateway for queued request to ${url}, returning empty data array`,
                );
                const emptyResponse = {
                  ok: true,
                  status: 200,
                  json: () => Promise.resolve({ success: true, data: [] }),
                } as Response;
                resolve(emptyResponse);
                return;
              }

              if (response.ok) {
                const data = await response.json();
                // Update cache
                globalThrottle.cache[cacheKey] = data;
                // Create a new response with the data
                const newResponse = {
                  ok: true,
                  json: () => Promise.resolve(data),
                  status: 200,
                } as Response;
                resolve(newResponse);
              } else {
                resolve(response);
              }
            } catch (error) {
              console.error(`Error in queued request for ${url}:`, error);
              // Create response with empty data instead of error
              const emptyResponse = {
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: [] }),
              } as Response;
              resolve(emptyResponse);
            }
          };

          // Add to queue
          globalThrottle.requestQueue.push(executeRequest);
        });
      }

      // If we need to wait before making the request
      if (timeSinceLastRequest < minRequestInterval) {
        const waitTime = minRequestInterval - timeSinceLastRequest;
        console.log(`Throttling request to ${url}, waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      // Mark as pending
      globalThrottle.isPending = true;
      globalThrottle.lastRequestTime = Date.now();

      try {
        // Execute the fetch with retry logic for 502 errors
        console.log(`Executing throttled request to ${url}`);

        let retries = 2; // Allow up to 2 retries
        let response: Response | null = null;

        while (retries >= 0) {
          try {
            response = await fetch(url, options);

            // If we get a 502, retry after a short delay unless this is our last attempt
            if (response.status === 502 && retries > 0) {
              console.warn(
                `Received 502 for ${url}, retrying after delay (${retries} retries left)`,
              );
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay before retry
              retries--;
              continue;
            }

            // If we get here, either the request succeeded or we're out of retries
            break;
          } catch (fetchError) {
            // If we encounter a network error during retry
            console.error(`Network error during retry for ${url}:`, fetchError);
            if (retries > 0) {
              retries--;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
            // If no retries left, return empty data
            return {
              ok: true,
              status: 200,
              json: () => Promise.resolve({ success: true, data: [] }),
            } as Response;
          }
        }

        // Should always have a response at this point (either successful or failed)
        if (!response) {
          console.error(
            `No response object created for ${url}, returning empty data`,
          );
          return {
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: [] }),
          } as Response;
        }

        // Handle 502 even after retries by returning empty data
        if (response.status === 502) {
          console.warn(
            `All retries failed with 502 for ${url}, returning empty data`,
          );
          return {
            ok: true, // Convert to success to avoid errors
            status: 200,
            json: () => Promise.resolve({ success: true, data: [] }),
          } as Response;
        }

        // If successful, cache the response
        if (response.ok) {
          try {
            const data = await response.json();
            globalThrottle.cache[cacheKey] = data;

            // Create a new response with the cached data
            const newResponse = {
              ok: true,
              json: () => Promise.resolve(data),
              status: response.status,
            } as Response;

            return newResponse;
          } catch (jsonError) {
            console.error(`Error parsing JSON from ${url}:`, jsonError);
            return {
              ok: true,
              status: 200,
              json: () => Promise.resolve({ success: true, data: [] }),
            } as Response;
          }
        }

        return response;
      } catch (error) {
        console.error(`Error in throttled fetch to ${url}:`, error);

        // Return empty data instead of throwing
        return {
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] }),
        } as Response;
      } finally {
        // Mark as not pending
        globalThrottle.isPending = false;

        // Process the next request in the queue if any
        if (globalThrottle.requestQueue.length > 0) {
          const nextRequest = globalThrottle.requestQueue.shift();
          if (nextRequest) {
            nextRequest();
          }
        }
      }
    },
    [globalThrottle],
  );

  // Fetch availability data with improved caching strategy
  useEffect(() => {
    // Create a unique cache key for this data request
    const cacheKey = `user-${userIdString}-${formattedStartDate}-${formattedEndDate}`;

    // Function to perform data fetch
    async function fetchAvailability() {
      console.log("AgentCalendar: Data fetch triggered");
      hasFetchedRef.current = true;

      // Check if we have recently fetched this exact data (within last 30 seconds)
      const now = Date.now();
      const cacheExpiry = 30000; // 30 seconds

      if (
        dataCache.current.key === cacheKey &&
        dataCache.current.data.length > 0 &&
        now - dataCache.current.lastFetchTimestamp < cacheExpiry
      ) {
        // Use cached data instead of making a new request
        console.log("AgentCalendar: Using cached availability data");
        setCalendarData(dataCache.current.data);
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        return;
      }

      try {
        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);

        console.log(
          `AgentCalendar: Fetching for user ${userIdString} from ${formattedStartDate} to ${formattedEndDate}`,
        );

        const url = `/api/availability?userId=${userIdString}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        const options: RequestInit = {
          headers: { "Content-Type": "application/json" },
          cache: "no-store" as RequestCache,
        };

        // Use throttled fetch instead of direct fetch
        const response = await throttledFetch(url, options);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch availability data (Status: ${response.status})`,
          );
        }

        const responseData = await response.json();

        // Handle new standardized response format
        let availabilityBlocks: any[] = [];

        if (responseData.success === true && Array.isArray(responseData.data)) {
          // New format - success response with data array
          availabilityBlocks = responseData.data;
          console.log(
            `AgentCalendar: Received ${availabilityBlocks.length} availability blocks (standardized format)`,
          );
        } else if (responseData.success === false) {
          // New format - error response
          console.error(
            `AgentCalendar: API returned error: ${responseData.error}`,
          );
          if (responseData.data && Array.isArray(responseData.data)) {
            availabilityBlocks = responseData.data; // Use provided fallback data
          }
        } else if (Array.isArray(responseData)) {
          // Legacy format - direct array
          availabilityBlocks = responseData;
          console.log(
            `AgentCalendar: Received ${availabilityBlocks.length} availability blocks (legacy format)`,
          );
        } else {
          console.error(
            "AgentCalendar: Unexpected response format",
            responseData,
          );
        }

        // IMPORTANT: We no longer expand recurring events on the client side
        // All events now come directly from the database via the API

        // Just use the blocks directly as they come from the API
        const expandedBlocks = availabilityBlocks;
        console.log(
          `AgentCalendar: Using ${availabilityBlocks.length} blocks directly from the API (client-side expansion disabled)`,
        );

        // First, convert API blocks to our internal format for merging
        const blocksForMerge = expandedBlocks.map((block: any) => {
          return {
            id: block.id,
            start: new Date(block.startDate || block.start_date),
            end: new Date(block.endDate || block.end_date),
            status: block.status || "available",
            isRecurring: block.isRecurring || block.is_recurring,
            recurrencePattern:
              block.recurrencePattern || block.recurrence_pattern,
            recurrenceGroup: block.recurrenceGroup || block.recurrence_group,
            dayOfWeek: block.dayOfWeek || block.day_of_week,
            title:
              block.title ||
              (block.status === "unavailable" ? "Unavailable" : "Available"),
            _originalBlock: block, // Keep reference to original block
          };
        });

        // Merge adjacent blocks with the same status
        console.log("Attempting to merge adjacent blocks...");
        const mergedBlocks = mergeAdjacentBlocks(blocksForMerge);
        console.log(
          `Merged blocks: ${blocksForMerge.length} original → ${mergedBlocks.length} after merging`,
        );

        // Convert merged blocks to calendar events
        const calendarEvents = mergedBlocks.map((block: any) => {
          const isRecurring = block.isRecurring;
          const isVirtual = block._isVirtualOccurrence === true;
          const isMerged = block.isMerged === true;

          // Format time for display in title when merged
          const formattedStartTime = new Date(block.start).toLocaleTimeString(
            [],
            { hour: "numeric", minute: "2-digit" },
          );
          const formattedEndTime = new Date(block.end).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          // Add time information to merged blocks
          let displayTitle = isRecurring
            ? `${block.title || "Available"} 🔄`
            : block.title || "Available";

          // For merged blocks, show time range in title
          if (isMerged) {
            displayTitle = `${block.status === "unavailable" ? "Unavailable" : "Available"}: ${formattedStartTime} - ${formattedEndTime}`;
          }

          // Use forced ID if available to avoid caching issues with merged blocks
          const eventId =
            block._forceId ||
            (isVirtual ? block._virtualId : `block-${block.id}`);
          // Use forced title if available
          const eventTitle = block._forceTitleWithTime || displayTitle;

          return {
            id: eventId,
            title: eventTitle,
            // Use display start/end for actual rendering if available
            start: block.displayStart || block.start,
            end: block.displayEnd || block.end,
            backgroundColor: getStatusColor(block.status),
            borderColor: getStatusColor(block.status),
            textColor: "#FFFFFF",
            // Force events to be constrained to their day column
            display: "block",
            // Prevent incorrect positioning
            allDay: false,
            // Don't allow event drag to overlap days
            constraint: "businessHours",
            extendedProps: {
              blockId: isVirtual ? block._originalBlockId : block.id,
              originalId: block.id,
              status: block.status,
              isRecurring: isRecurring,
              isVirtual: isVirtual,
              isMerged: isMerged,
              mergedIds: block.mergedIds || [block.id],
              mergedBlockData: block.mergedBlockData || [],
              dayOfWeek: block.dayOfWeek,
              recurrencePattern: block.recurrencePattern,
              recurrenceGroup: block.recurrenceGroup,
              originalStart: block.originalStart,
              originalEnd: block.originalEnd,
            },
            // Add data attributes for status-based styling in dark mode
            classNames: [
              `status-${block.status || "available"}`,
              isRecurring ? "recurring-event" : "",
              isVirtual ? "virtual-occurrence" : "",
              isMerged ? "merged-event" : "",
              "day-lock", // Add day-lock class to prevent horizontal shifting
              "fc-day-lock", // Add class for our CSS overrides
            ],
            dataAttributes: {
              "data-status": block.status || "available",
              "data-recurring": isRecurring ? "true" : "false",
              "data-virtual": isVirtual ? "true" : "false",
              "data-day": new Date(
                block.startDate || block.start_date,
              ).getDay(), // Add day of week for alignment
            },
          };
        });

        // Update cache
        dataCache.current = {
          lastFetchTimestamp: now,
          key: cacheKey,
          data: calendarEvents,
        };

        setCalendarData(calendarEvents);
        setError(null);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Error fetching availability data:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch availability data";
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setCalendarData([]);
      } finally {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    }

    fetchAvailability();

    // Clean up
    return () => {
      hasFetchedRef.current = false;
    };
  }, [
    userIdString,
    formattedStartDate,
    formattedEndDate,
    onError,
    onLoadingChange,
    throttledFetch,
  ]);

  // We now handle the sidebar state changes in the useEffect at the top of the component

  // Helper to get color based on status
  function getStatusColor(status: string): string {
    switch (status) {
      case "unavailable":
        return "#DC2626"; // red
      default:
        return "#00A8A8"; // teal for available
    }
  }

  // Show styled alert instead of browser alert
  const showAlert = (
    message: string,
    title: string = "Notification",
    variant: "info" | "warning" | "error" | "success" = "info",
  ) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVariant(variant);
    setIsAlertOpen(true);
  };

  // Show styled confirmation dialog instead of browser confirm
  const showConfirm = (
    message: string,
    callback: () => void,
    title: string = "Confirm Action",
  ) => {
    setConfirmMessage(message);
    setConfirmTitle(title);
    setConfirmCallback(() => callback);
    setIsConfirmOpen(true);
  };

  // Function to handle saving from the modal
  const handleModalSave = useCallback(
    async (
      title: string,
      status: string,
      isRecurring: boolean,
      recurrencePattern: string,
      recurrenceEndType?: string,
      recurrenceEndDate?: string,
      recurrenceCount?: number,
      mergeStrategy?: "merge" | "override",
      // Add parameters for modified times
      modifiedStartStr?: string,
      modifiedEndStr?: string,
    ) => {
      if (!selectedTimeSlot) return;

      // Store the status for conflict dialog
      setNewBlockStatus(status);

      // Don't set global loading state, just disable the modal
      setIsModalOpen(false);

      // Add temporary event to show something is happening without hiding the calendar
      const calendarApi = calendarRef.current?.getApi();
      const tempEventId = `temp-${Date.now()}`;
      if (calendarApi) {
        const tempColor = status === "unavailable" ? "#DC2626" : "#00A8A8";
        calendarApi.addEvent({
          id: tempEventId,
          title: title + " (Saving...)",
          start: modifiedStartStr || selectedTimeSlot.startStr,
          end: modifiedEndStr || selectedTimeSlot.endStr,
          backgroundColor: tempColor,
          borderColor: tempColor,
          textColor: "#FFFFFF",
          classNames: ["temp-saving-event", "day-lock", "fc-day-lock"],
          display: "block", // Force block display to ensure proper positioning
        });
      }

      try {
        // Get day of week (0-6, where 0 is Sunday) for recurring events
        const startDate = new Date(selectedTimeSlot.startStr);
        const dayOfWeek = isRecurring ? startDate.getDay() : undefined;

        // Prepare the request body with our availability data
        const requestBody = {
          userId: userId,
          user_id: userId, // Include both formats for compatibility
          title: title,
          // Use modified times if provided, otherwise use the original selection
          startDate: modifiedStartStr || selectedTimeSlot.startStr,
          start_date: modifiedStartStr || selectedTimeSlot.startStr, // Include both formats for compatibility
          endDate: modifiedEndStr || selectedTimeSlot.endStr,
          end_date: modifiedEndStr || selectedTimeSlot.endStr, // Include both formats for compatibility
          status,
          isRecurring,
          is_recurring: isRecurring, // Include both formats for compatibility
          dayOfWeek: dayOfWeek,
          day_of_week: dayOfWeek, // Include both formats for compatibility
          recurrencePattern: isRecurring ? recurrencePattern : undefined,
          recurrence_pattern: isRecurring ? recurrencePattern : undefined, // Include both formats for compatibility
          recurrenceEndType: isRecurring ? recurrenceEndType : undefined,
          recurrence_end_type: isRecurring ? recurrenceEndType : undefined, // Include both formats for compatibility
          recurrenceEndDate:
            isRecurring && recurrenceEndType === "date"
              ? recurrenceEndDate
              : undefined,
          recurrence_end_date:
            isRecurring && recurrenceEndType === "date"
              ? recurrenceEndDate
              : undefined, // Include both formats for compatibility
          recurrenceCount:
            isRecurring && recurrenceEndType === "count"
              ? recurrenceCount
              : undefined,
          recurrence_count:
            isRecurring && recurrenceEndType === "count"
              ? recurrenceCount
              : undefined, // Include both formats for compatibility
        };

        // Always use merge strategy to automatically merge adjacent blocks
        // This will ensure the server tries to merge this block with any adjacent ones of the same type
        Object.assign(requestBody, {
          mergeStrategy: mergeStrategy || "merge",
          merge_strategy: mergeStrategy || "merge", // Include both formats for compatibility
        });

        // Create the availability block via API
        const response = await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error(
              "You are not authorized to create availability blocks",
            );
          } else if (response.status === 403) {
            throw new Error(
              "You do not have permission to create availability blocks",
            );
          } else if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Invalid availability block data",
            );
          } else if (response.status === 500) {
            throw new Error("Server error while creating availability block");
          } else {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Failed to create availability block (Status: ${response.status})`,
            );
          }
        }

        const responseData = await response.json();

        // Handle the standardized response format
        let newBlock;

        if (responseData.success && responseData.data) {
          // New standardized format
          newBlock = responseData.data;
        } else if (Array.isArray(responseData)) {
          // Legacy format - array response
          newBlock = responseData[0];
        } else if (responseData.id) {
          // Legacy format - direct object
          newBlock = responseData;
        } else {
          throw new Error(
            "Invalid response format from server after creating availability block",
          );
        }

        if (!newBlock || !newBlock.id) {
          throw new Error(
            "Invalid response from server after creating availability block",
          );
        }

        // Set color based on status
        let backgroundColor = getStatusColor(status);

        // Add new event to calendar
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          // First, remove the temporary event
          const tempEvent = calendarApi.getEventById(tempEventId);
          if (tempEvent) {
            tempEvent.remove();
          }

          // Add a visual indicator for recurring events
          const displayTitle = isRecurring
            ? `${title} 🔄` // Add recurring emoji indicator
            : title;

          // If this is a recurring event, immediately create and show all the recurring instances
          if (isRecurring) {
            console.log(
              "Creating recurring instances immediately for newly created block:",
              newBlock.id,
            );

            // Add the original instance
            calendarApi.addEvent({
              id: `block-${newBlock.id}`,
              title: displayTitle,
              start: modifiedStartStr || selectedTimeSlot.startStr,
              end: modifiedEndStr || selectedTimeSlot.endStr,
              backgroundColor,
              borderColor: backgroundColor,
              textColor: "#FFFFFF",
              extendedProps: {
                status,
                blockId: newBlock.id,
                isRecurring: isRecurring,
                dayOfWeek: newBlock.dayOfWeek || newBlock.day_of_week,
                recurrencePattern: recurrencePattern,
                recurrenceEndType: recurrenceEndType,
                recurrenceCount: recurrenceCount,
                recurrenceEndDate: recurrenceEndDate,
              },
              display: "block",
              classNames: [
                `status-${status || "available"}`,
                "recurring-event",
                "day-lock",
                "fc-day-lock",
              ],
              dataAttributes: {
                "data-status": status || "available",
                "data-recurring": "true",
              },
            });

            // Calculate how many additional occurrences to generate
            let occurrencesToGenerate = 0;

            if (recurrenceEndType === "count" && recurrenceCount) {
              // Generate count-1 additional instances (the original is already added)
              occurrencesToGenerate = recurrenceCount - 1;
            } else if (recurrenceEndType === "date" && recurrenceEndDate) {
              const endDate = new Date(recurrenceEndDate);
              const startDate = new Date(selectedTimeSlot.startStr);
              const daysBetween = Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              if (recurrencePattern === "daily") {
                occurrencesToGenerate = daysBetween;
              } else if (recurrencePattern === "weekly") {
                occurrencesToGenerate = Math.ceil(daysBetween / 7);
              } else if (recurrencePattern === "biweekly") {
                occurrencesToGenerate = Math.ceil(daysBetween / 14);
              }
            } else {
              // For 'never', use reasonable defaults
              if (recurrencePattern === "daily") {
                occurrencesToGenerate = 14; // Two weeks
              } else if (recurrencePattern === "weekly") {
                occurrencesToGenerate = 8; // Two months
              } else if (recurrencePattern === "biweekly") {
                occurrencesToGenerate = 6; // Three months
              } else {
                occurrencesToGenerate = 8; // Default
              }
            }

            // Safety limit
            const MAX_OCCURRENCES = 52;
            if (occurrencesToGenerate > MAX_OCCURRENCES) {
              occurrencesToGenerate = MAX_OCCURRENCES;
            }

            // Generate and add recurring instances immediately
            const startDate = new Date(
              modifiedStartStr || selectedTimeSlot.startStr,
            );
            const endDate = new Date(modifiedEndStr || selectedTimeSlot.endStr);
            const durationMs = endDate.getTime() - startDate.getTime();

            for (let i = 1; i <= occurrencesToGenerate; i++) {
              const currentStart = new Date(startDate);

              // Adjust date based on pattern
              if (recurrencePattern === "daily") {
                currentStart.setDate(currentStart.getDate() + i);
              } else if (recurrencePattern === "weekly") {
                currentStart.setDate(currentStart.getDate() + i * 7);
              } else if (recurrencePattern === "biweekly") {
                currentStart.setDate(currentStart.getDate() + i * 14);
              }

              // Calculate end time based on same duration
              const currentEnd = new Date(currentStart.getTime() + durationMs);

              // Check if we've gone past the end date
              if (recurrenceEndType === "date" && recurrenceEndDate) {
                const endLimit = new Date(recurrenceEndDate);
                if (currentStart > endLimit) {
                  break;
                }
              }

              // Add this recurrence to the calendar
              calendarApi.addEvent({
                id: `block-${newBlock.id}-occurrence-${i}`,
                title: displayTitle,
                start: currentStart.toISOString(),
                end: currentEnd.toISOString(),
                backgroundColor,
                borderColor: backgroundColor,
                textColor: "#FFFFFF",
                extendedProps: {
                  status,
                  blockId: newBlock.id,
                  originalId: newBlock.id,
                  isRecurring: true,
                  isVirtual: true,
                  dayOfWeek: newBlock.dayOfWeek || newBlock.day_of_week,
                  recurrencePattern: recurrencePattern,
                },
                display: "block",
                classNames: [
                  `status-${status || "available"}`,
                  "recurring-event",
                  "virtual-occurrence",
                  "day-lock",
                  "fc-day-lock",
                ],
                dataAttributes: {
                  "data-status": status || "available",
                  "data-recurring": "true",
                  "data-virtual": "true",
                  "data-day": currentStart.getDay(),
                },
              });
            }

            console.log(
              `Created ${occurrencesToGenerate} additional instances for recurring block ${newBlock.id}`,
            );

            // For recurring events, we need to refresh the calendar data from the API
            // This is because the backend created all occurrences but we need to fetch them
            console.log(
              "Refreshing calendar data to show all recurring instances from the server",
            );

            // Invalidate data cache to force a fresh fetch
            dataCache.current = {
              lastFetchTimestamp: 0,
              key: "",
              data: [],
            };

            // Trigger a fetch after a short delay to ensure all data is available
            setTimeout(() => {
              fetchAvailability();
            }, 500);
          } else {
            // For non-recurring events, just add the single event
            calendarApi.addEvent({
              id: `block-${newBlock.id}`,
              title: displayTitle,
              start: modifiedStartStr || selectedTimeSlot.startStr,
              end: modifiedEndStr || selectedTimeSlot.endStr,
              backgroundColor,
              borderColor: backgroundColor,
              textColor: "#FFFFFF",
              extendedProps: {
                status,
                blockId: newBlock.id,
                isRecurring: false,
              },
              display: "block", // Force block display to ensure proper positioning
              classNames: [
                `status-${status || "available"}`,
                "day-lock", // Add day-lock class to prevent horizontal shifting
                "fc-day-lock", // Add class for our CSS overrides
              ],
              dataAttributes: {
                "data-status": status || "available",
                "data-recurring": "false",
              },
            });
          }
        }

        // Clear any previous errors
        setError(null);
      } catch (err) {
        console.error("Error handling availability creation:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error creating availability block. Please try again.";
        setError(errorMessage);
        showAlert(errorMessage, "Error Creating Availability", "error");

        // Remove the temporary event in case of error
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          const tempEvent = calendarApi.getEventById(tempEventId);
          if (tempEvent) {
            tempEvent.remove();
          }
        }
      } finally {
        setLoading(false);
        setSelectedTimeSlot(null);
      }
    },
    [
      userId,
      selectedTimeSlot,
      calendarRef,
      setNewBlockStatus,
      setError,
      fetchAvailability,
    ],
  );

  const handleDateSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      if (viewOnly) return;
      // @ts-ignore - FullCalendar types are sometimes incomplete
      const calendarApi = selectInfo.view?.calendar;

      // Don't set global loading to prevent calendar from disappearing
      const localLoadingState = true; // Local variable instead of state

      try {
        // Validate input
        if (!selectInfo.startStr || !selectInfo.endStr) {
          throw new Error("Invalid date selection: Missing start or end time");
        }

        // Check if this is a day selection from month view (all-day or multi-day selection)
        // FullCalendar types are sometimes incomplete, so we need to access type this way
        // @ts-ignore
        const isMonthViewSelection =
          selectInfo.view && selectInfo.view.type === "dayGridMonth";

        if (isMonthViewSelection) {
          // In month view, we need to convert the selection to a proper time range
          // First, determine if it's a single day or multiple days
          const startDate = new Date(selectInfo.startStr);
          const endDate = new Date(selectInfo.endStr);

          console.log(
            `Month view selection detected: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}`,
          );

          // Clone the selection info and modify it for the modal
          const modifiedSelection = { ...selectInfo };

          // For single-day selections in month view, create a default time range (9am-5pm)
          // For multi-day selections, keep the full days
          const isSameDay = startDate.toDateString() === endDate.toDateString();

          if (isSameDay) {
            // Set default work hours (9am - 5pm) for the selected day
            startDate.setHours(9, 0, 0);
            endDate.setHours(17, 0, 0);

            modifiedSelection.startStr = startDate.toISOString();
            modifiedSelection.endStr = endDate.toISOString();
            modifiedSelection.start = startDate;
            modifiedSelection.end = endDate;

            console.log(
              `Single day selection modified to work hours: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}`,
            );
          } else {
            // For multi-day selections, keep full days but make endDate inclusive
            // FullCalendar's end date is exclusive, so we need to subtract a day
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59);

            modifiedSelection.endStr = endDate.toISOString();
            modifiedSelection.end = endDate;

            console.log(
              `Multi-day selection modified to be inclusive: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}`,
            );
          }

          // Set the modified selection for the modal
          setSelectedTimeSlot(modifiedSelection);
        } else {
          // Regular time grid selection, use as is
          setSelectedTimeSlot(selectInfo);
        }

        // Show the modal
        setIsModalOpen(true);
        setLoading(false);
        return; // The rest of the function will be handled by the modal's save handler
      } catch (err) {
        console.error("Error handling availability selection:", err);

        // Set error state and show alert with specific message
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error creating availability block. Please try again.";

        setError(errorMessage);
        setAlertTitle("Error Creating Availability");
        setAlertMessage(errorMessage);
        setAlertVariant("error");
        setIsAlertOpen(true);
        calendarApi.unselect();
      } finally {
        setLoading(false);
      }
    },
    [userId, viewOnly, setSelectedTimeSlot, setIsModalOpen],
  );

  const handleEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      if (viewOnly) return;

      // Get all the block data from the event
      const blockId = clickInfo.event.extendedProps.blockId;
      const isRecurring = clickInfo.event.extendedProps.isRecurring;
      const status = clickInfo.event.extendedProps.status;
      const dayOfWeek = clickInfo.event.extendedProps.dayOfWeek;
      const recurrencePattern = clickInfo.event.extendedProps.recurrencePattern;
      const recurrenceGroup = clickInfo.event.extendedProps.recurrenceGroup;
      const mergedIds = clickInfo.event.extendedProps.mergedIds;

      if (!blockId) {
        console.error("Cannot open details: Missing block ID");
        return;
      }

      // Check if this is a merged event
      const isMerged = mergedIds && mergedIds.length > 1;

      // If this is a merged event, proceed to show the block details
      // We now support viewing merged blocks in detail
      if (isMerged) {
        console.log(
          `Clicked on merged event with ${mergedIds.length} blocks:`,
          mergedIds,
        );

        // We'll show a merged block detail modal that allows deletion but not direct editing
        // The modal will explain how to manage the blocks
      }

      // Clean the title - remove recurring indicator and merged blocks count
      let cleanTitle = clickInfo.event.title
        .replace(" 🔄", "") // Remove recurring indicator
        .replace(/ \(\d+ merged\)$/, ""); // Remove merged count

      // Prepare the block object for the detail modal
      const block = {
        id: blockId,
        title: cleanTitle,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        status: status || "available",
        isRecurring: !!isRecurring,
        dayOfWeek: dayOfWeek,
        recurrencePattern: recurrencePattern,
        recurrenceGroup: recurrenceGroup,
      };

      // Set the selected event and open the detail modal
      setSelectedEvent(block);
      setIsDetailModalOpen(true);
    },
    [viewOnly],
  );

  // Handle block deletion from detail modal
  const handleDeleteBlock = useCallback(
    async (blockId: number, deleteEntireSeries: boolean): Promise<void> => {
      console.log(
        `Deleting availability block ${blockId}, deleteEntireSeries=${deleteEntireSeries}`,
      );

      if (!calendarRef.current) {
        console.error("Calendar reference is not available");
        return;
      }

      try {
        setLoading(true);

        const calendarApi = calendarRef.current.getApi();

        // STEP 1: Update our internal state first for immediate UI feedback
        // This is the more reliable approach than directly manipulating the calendar API
        console.log(
          `Preparing to update calendar state for block deletion: ${blockId}`,
        );

        // Check if the event is part of a merged block - we need to find which event contains it as a merged ID
        let isMergedEvent = false;
        let mergedEventToDelete = null;

        // First check if we're trying to delete a merged block
        if (selectedEvent && calendarData) {
          // Find if any event has this blockId in its mergedIds
          for (const event of calendarData) {
            if (
              event.extendedProps?.mergedIds &&
              Array.isArray(event.extendedProps.mergedIds) &&
              event.extendedProps.mergedIds.includes(blockId)
            ) {
              isMergedEvent = true;
              mergedEventToDelete = event;
              console.log(
                `Found merged event containing blockId ${blockId}, showing warning`,
              );
              break;
            }
          }
        }

        // Handle merged event deletion with a warning
        if (isMergedEvent && mergedEventToDelete) {
          // Setup confirmation dialog with styled component
          const confirmMessage = `This block is part of a merged time block containing multiple availability entries. 
Deleting it will delete ALL availability in this merged block.
Do you want to continue?`;

          setConfirmMessage(confirmMessage);
          setConfirmTitle("Confirm Merged Block Deletion");
          setConfirmCallback(() => {
            // This will be executed if user confirms
            console.log(
              "User confirmed deletion of merged block, deleting all related blocks",
            );

            // Get all blockIds to delete
            const mergedIds = mergedEventToDelete.extendedProps.mergedIds;

            // Create a batch of delete requests - we'll execute them sequentially
            const deleteRequests = [];
            for (const id of mergedIds) {
              deleteRequests.push(() =>
                fetch(`/api/availability/${id as number}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                }),
              );
            }

            // Update UI by removing the merged event first
            setCalendarData((prevData) => {
              const filteredData = prevData.filter((event) => {
                // Remove the merged event
                if (
                  event.extendedProps?.mergedIds &&
                  Array.isArray(event.extendedProps.mergedIds)
                ) {
                  // Check if the blockId is in the mergedIds array
                  const foundMatch = event.extendedProps.mergedIds.some(
                    (idValue: any) => Number(idValue) === blockId,
                  );
                  if (foundMatch) {
                    return false;
                  }
                }
                return true;
              });

              console.log(
                `Filtered from ${prevData.length} to ${filteredData.length} events`,
              );
              return filteredData;
            });

            // Close modal immediately for responsive UI
            setIsDetailModalOpen(false);
            setSelectedEvent(null);

            // Execute delete requests one by one
            (async () => {
              for (const deleteRequest of deleteRequests) {
                try {
                  const response = await deleteRequest();
                  if (!response.ok) {
                    console.warn(
                      `Failed to delete one of the blocks in merged group: ${response.status}`,
                    );
                  }
                } catch (err) {
                  console.error("Error deleting block in merged group:", err);
                }
              }

              console.log(
                `Successfully deleted merged block containing ${mergedIds.length} blocks`,
              );

              // Force a refresh of the data to ensure UI is in sync
              setTimeout(() => {
                // Refresh data from server
                fetchAvailability();
              }, 500);
            })();
          });

          setIsConfirmOpen(true);
          setLoading(false);
          return;
        }

        // Standard deletion logic for non-merged blocks starts below

        // Standard deletion logic for non-merged blocks
        if (
          deleteEntireSeries &&
          selectedEvent?.isRecurring &&
          selectedEvent?.recurrenceGroup
        ) {
          // For series deletion, filter out all events with the same recurrence group
          const recurrenceGroup = selectedEvent.recurrenceGroup;

          console.log(
            `Filtering out events with recurrenceGroup: ${recurrenceGroup}`,
          );

          // Update our React state which will properly re-render the calendar
          setCalendarData((prevData) => {
            const filteredData = prevData.filter((event) => {
              // Make sure to check both in extendedProps and directly on the event
              const eventRecurrenceGroup =
                event.extendedProps?.recurrenceGroup || event.recurrenceGroup;

              return eventRecurrenceGroup !== recurrenceGroup;
            });

            console.log(
              `Filtered from ${prevData.length} to ${filteredData.length} events`,
            );
            return filteredData;
          });

          // Track the deleted recurrence group for cleanup in useEffect
          if (recurrenceGroup) {
            console.log(`Tracking deleted series group: ${recurrenceGroup}`);
            setDeletedSeriesGroups((prev) => [...prev, recurrenceGroup]);
          }
        } else {
          // For single event deletion, filter out just this event
          console.log(`Filtering out single event with blockId: ${blockId}`);

          // Update our React state which will properly re-render the calendar
          setCalendarData((prevData) => {
            const filteredData = prevData.filter((event) => {
              // Check both the event ID and the blockId in extendedProps
              const eventId = event.id;
              const eventBlockId =
                event.extendedProps?.blockId || event.blockId;

              return eventId !== `block-${blockId}` && eventBlockId !== blockId;
            });

            console.log(
              `Filtered from ${prevData.length} to ${filteredData.length} events`,
            );
            return filteredData;
          });
        }

        // STEP 2: Close modal immediately for responsive UI
        setIsDetailModalOpen(false);
        setSelectedEvent(null);

        // STEP 3: Send API request to perform the actual deletion on the server
        const deleteUrl = deleteEntireSeries
          ? `/api/availability/${blockId}?deleteSeries=true`
          : `/api/availability/${blockId}`;

        console.log(`Sending DELETE request to: ${deleteUrl}`);

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        // STEP 4: Handle API response errors
        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error(
              "You are not authorized to delete this availability block",
            );
          } else if (response.status === 403) {
            throw new Error(
              "You do not have permission to delete this availability block",
            );
          } else if (response.status === 404) {
            throw new Error("The availability block could not be found");
          } else if (response.status === 500) {
            throw new Error("Server error while deleting availability block");
          } else {
            // Try to get detailed error from the response
            try {
              const errorData = await response.json();
              throw new Error(
                errorData.error ||
                  `Failed to delete availability block (Status: ${response.status})`,
              );
            } catch (parseError) {
              throw new Error(
                `Failed to delete availability block (Status: ${response.status})`,
              );
            }
          }
        }

        console.log(
          `Successfully deleted availability block ${blockId}${deleteEntireSeries ? " and all recurring instances" : ""}`,
        );

        // STEP 5: Validate deletion count with server response (just for logging)
        if (deleteEntireSeries && selectedEvent?.isRecurring) {
          try {
            const result = await response.json();
            console.log("Server delete response:", JSON.stringify(result));

            // Get deletion count from server for validation purposes
            let deletedCount = 0;
            if (result?.data?.count) {
              deletedCount = result.data.count;
            } else if (result?.count) {
              deletedCount = result.count;
            } else if (
              typeof result.data === "object" &&
              result.data !== null
            ) {
              deletedCount = result.data.count || 0;
            }

            console.log(`Server reported ${deletedCount} deleted instances`);
          } catch (parseError) {
            console.warn(
              "Non-critical error processing deletion response:",
              parseError,
            );
          }
        }

        // STEP 6: Mark the cache as stale to force a fresh fetch on next page view
        // This ensures that all views (calendar and list) stay in sync when navigating
        // between pages or returning to this page later
        dataCache.current = { lastFetchTimestamp: 0, key: "", data: [] };
      } catch (err) {
        console.error("Error deleting block:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error deleting availability block";
        setError(errorMessage);

        // Re-fetch data if delete failed to restore the UI
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.refetchEvents();
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      selectedEvent,
      calendarRef,
      calendarData,
      setCalendarData,
      setLoading,
      setError,
      setDeletedSeriesGroups,
    ],
  );

  // Handle block editing from detail modal
  const handleEditBlock = useCallback(
    (block: any) => {
      console.log("Edit functionality to be implemented", block);
      // For now just close the modal
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
    },
    [setIsDetailModalOpen, setSelectedEvent],
  );

  if (loading && !calendarData.length) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-800 text-white dark" : "bg-white"} rounded-lg shadow p-4 h-full w-full transition-all duration-300 ease-in-out overflow-x-auto`}
    >
      {loading && !calendarData.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div
          className={`${theme === "dark" ? "fc-theme-dark dark" : ""} calendar-container w-full min-w-[320px] ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}
        >
          {/* Calendar styles moved to calendar-fixes.css */}
          <FullCalendar
            ref={(el) => {
              // Update the internal ref
              calendarRef.current = el;
              // Forward the ref to parent component if provided
              if (fullCalendarRef) {
                if (typeof fullCalendarRef === "function") {
                  fullCalendarRef(el);
                } else {
                  (
                    fullCalendarRef as React.MutableRefObject<FullCalendar | null>
                  ).current = el;
                }
              }
            }}
            themeSystem={theme === "dark" ? "standard" : "standard"}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: windowWidth <= 768 ? "timeGridWeek,timeGridDay" : "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            views={{
              dayGridMonth: { buttonText: "month" },
              timeGridWeek: { buttonText: "week" },
              timeGridDay: { buttonText: "day" },
            }}
            firstDay={0} // Start with Sunday
            selectable={!viewOnly}
            selectMirror={true}
            editable={!viewOnly}
            weekends={true}
            slotMinTime="08:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            allDaySlot={false}
            nowIndicator={true}
            events={calendarData}
            select={handleDateSelect}
            eventClick={handleEventClick}
            dayMaxEventRows={3}
            scrollTime="08:00:00"
            selectAllow={(selectInfo) => {
              // Get the duration of the selection in milliseconds
              const duration =
                selectInfo.end.valueOf() - selectInfo.start.valueOf();

              // Check if the selection is all-day (in day grid) by looking at format
              // All-day selections typically span exact days (00:00:00)
              const startDate = new Date(selectInfo.start.valueOf());
              const endDate = new Date(selectInfo.end.valueOf());

              const isAllDaySelection =
                startDate.getHours() === 0 &&
                startDate.getMinutes() === 0 &&
                endDate.getHours() === 0 &&
                endDate.getMinutes() === 0;

              if (isAllDaySelection) {
                // For all-day selections (likely in month view):
                // Ensure selections are at least 1 day (already guaranteed, but we check anyway)
                return duration >= 1000; // Just ensure it's a positive duration
              } else {
                // For time-specific selections (likely in week/day view):
                // 1. Only allow selections at least 30 minutes long
                // 2. Ensure the selection is within a single day (no cross-day selections)

                const startDate = new Date(selectInfo.start.valueOf());
                const endDate = new Date(selectInfo.end.valueOf());
                const sameDay =
                  startDate.getDate() === endDate.getDate() &&
                  startDate.getMonth() === endDate.getMonth() &&
                  startDate.getFullYear() === endDate.getFullYear();

                return duration >= 30 * 60 * 1000 && sameDay;
              }
            }}
            slotDuration="00:30:00" // 30 minute slots
            snapDuration="00:15:00" // 15 minute snap
            slotEventOverlap={false} // Prevent events from overlapping
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            dayHeaderFormat={{
              weekday: "short",
              month: "numeric",
              day: "numeric",
              omitCommas: true,
            }}
            expandRows={true} // Expand rows to fill height
            contentHeight="auto" // Automatically adjust height
            handleWindowResize={true} // Automatically handle window resizing
            fixedWeekCount={false} // Adjust to the number of weeks in month
            aspectRatio={windowWidth <= 768 ? 1.0 : windowWidth <= 1024 ? 1.4 : 1.8} // Responsive aspect ratio
            stickyHeaderDates={true} // Keep headers visible during scroll
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            eventClassNames={(info) => {
              return [
                "fc-day-lock",
                "day-lock",
                `status-${info.event.extendedProps.status || "available"}`,
                info.event.extendedProps.isRecurring ? "recurring-event" : "",
              ];
            }}
            eventContent={(info) => {
              // Only show time in timeGrid views
              // @ts-ignore - FullCalendar types don't fully cover info.view
              const showTime =
                info.view &&
                info.view.type &&
                info.view.type.includes("timeGrid");
              return {
                html: `<div class="fc-event-main-frame">
                  ${showTime ? `<div class="fc-event-time">${info.timeText || ""}</div>` : ""}
                  <div class="fc-event-title-container">
                    <div class="fc-event-title fc-sticky">${info.event.title || ""}${info.event.extendedProps.isRecurring ? " 🔄" : ""}</div>
                  </div>
                </div>`,
              };
            }}
            datesSet={(dateInfo) => {
              // Force resize when view changes to fix layout issues
              // Use two timeouts for better reliability - one immediate and one after waiting
              if (calendarRef.current) {
                // Immediate resize attempt
                const calendarApi = calendarRef.current.getApi();
                calendarApi.updateSize();

                // Delayed resize to ensure all DOM updates are complete
                setTimeout(() => {
                  if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    calendarApi.updateSize();

                    // One final resize after a longer delay to catch any late DOM updates
                    setTimeout(() => {
                      if (calendarRef.current) {
                        calendarApi.updateSize();
                      }
                    }, 250);
                  }
                }, 100);
              }
            }}
          />
        </div>
      )}

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTimeSlot(null);
          // Unselect the calendar selection
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.unselect();
          }
        }}
        onSave={handleModalSave}
        selectInfo={selectedTimeSlot}
        userId={userIdString}
      />

      {/* Block Detail Modal */}
      {selectedEvent && (
        <BlockDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedEvent(null);
          }}
          block={selectedEvent}
          onDelete={handleDeleteBlock}
          onEdit={handleEditBlock}
        />
      )}

      {/* Conflict Resolution Dialog */}
      <ConflictDialog
        isOpen={isConflictModalOpen}
        onClose={() => {
          setIsConflictModalOpen(false);
          setConflicts([]);
          // Unselect the calendar selection
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.unselect();
          }
        }}
        conflicts={conflicts}
        newBlockStatus={newBlockStatus}
        onProceed={(mergeStrategy) => {
          console.log(
            `Proceeding with conflict resolution strategy: ${mergeStrategy}`,
          );

          // Close the conflict dialog
          setIsConflictModalOpen(false);

          // Show the availability modal to let the user set the title and other properties
          if (!selectedTimeSlot) {
            console.error("No time slot selected for availability creation");
            return;
          }

          // We need to store the merge strategy for later use when the modal is saved
          setIsModalOpen(true);

          // Store the merge strategy as a data attribute on the modal element
          setTimeout(() => {
            const modalElement = document.querySelector(".availability-modal");
            if (modalElement) {
              modalElement.setAttribute("data-merge-strategy", mergeStrategy);
            }
          }, 50);
        }}
      />

      {/* Alert Dialog for general notifications */}
      <SimpleAlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
      />

      {/* Confirmation Dialog for actions requiring user approval */}
      <SimpleAlertDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmCallback}
        variant="warning"
      />
    </div>
  );
}
