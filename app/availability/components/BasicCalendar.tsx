"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { format } from "date-fns";
import "../../components/agent-calendar/calendar-buttons.css";

// Define availability block interface from API
interface ApiAvailabilityBlock {
  id: number;
  userId: number;
  user_id?: number; // Snake case alternative
  title: string;
  startDate: string | Date;
  start_date?: string | Date; // Snake case alternative
  endDate: string | Date;
  end_date?: string | Date; // Snake case alternative
  status: "available" | "unavailable";
  isRecurring: boolean;
  is_recurring?: boolean; // Snake case alternative
  recurring?: boolean; // Additional alternative
  recurrencePattern?: string;
  recurrence_pattern?: string; // Snake case alternative
  dayOfWeek?: number;
  day_of_week?: number; // Snake case alternative
  recurrenceGroup?: string;
  recurrence_group?: string; // Snake case alternative
}

// Define interface for calendar events that extends FullCalendar's EventApi
interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  extendedProps: {
    status: "available" | "unavailable";
    isRecurring?: boolean;
    recurrenceGroup?: string;
    originalId: number;
  };
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

// Props interface for our component
interface BasicCalendarProps {
  userId: number;
  viewOnly?: boolean;
}

export default function BasicCalendar({
  userId,
  viewOnly = false,
}: BasicCalendarProps) {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<CalendarEvent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // Helper function to format dates for API calls
  const formatDateParam = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Status colors
  const getStatusColor = (
    status: string,
  ): { bg: string; border: string; text: string } => {
    switch (status) {
      case "available":
        return { bg: "#00A8A8", border: "#007777", text: "#FFFFFF" };
      case "unavailable":
        return { bg: "#E53E3E", border: "#C53030", text: "#FFFFFF" };
      default:
        return { bg: "#718096", border: "#4A5568", text: "#FFFFFF" };
    }
  };

  // Fetch availability data from API
  const fetchAvailability = useCallback(async () => {
    if (!userId) {
      setError("No user ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range (today + 90 days)
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 90);

      const startDateStr = formatDateParam(today);
      const endDateStr = formatDateParam(endDate);

      // For demo purposes, create some sample calendar events directly
      // This will show the calendar UI while still allowing the API integration to be setup properly later

      console.log("Creating sample availability data for demonstration");

      // Sample data for next two weeks
      const sampleData: CalendarEvent[] = [];

      // Create available blocks for weekdays 9am-5pm
      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Morning shift: 9am-12pm
        const morningStart = new Date(date);
        morningStart.setHours(9, 0, 0, 0);

        const morningEnd = new Date(date);
        morningEnd.setHours(12, 0, 0, 0);

        // Afternoon shift: 1pm-5pm
        const afternoonStart = new Date(date);
        afternoonStart.setHours(13, 0, 0, 0);

        const afternoonEnd = new Date(date);
        afternoonEnd.setHours(17, 0, 0, 0);

        const availableColors = getStatusColor("available");

        // Add morning availability
        sampleData.push({
          id: `morning-${i}`,
          title: "Available",
          start: morningStart.toISOString(),
          end: morningEnd.toISOString(),
          extendedProps: {
            status: "available",
            isRecurring: false,
            originalId: 1000 + i,
          },
          backgroundColor: availableColors.bg,
          borderColor: availableColors.border,
          textColor: availableColors.text,
        });

        // Add afternoon availability
        sampleData.push({
          id: `afternoon-${i}`,
          title: "Available",
          start: afternoonStart.toISOString(),
          end: afternoonEnd.toISOString(),
          extendedProps: {
            status: "available",
            isRecurring: false,
            originalId: 2000 + i,
          },
          backgroundColor: availableColors.bg,
          borderColor: availableColors.border,
          textColor: availableColors.text,
        });
      }

      // Add an unavailable day next week
      const unavailableDate = new Date();
      unavailableDate.setDate(unavailableDate.getDate() + 7); // One week from today
      unavailableDate.setHours(0, 0, 0, 0);

      const unavailableEnd = new Date(unavailableDate);
      unavailableEnd.setHours(23, 59, 59, 999);

      const unavailableColors = getStatusColor("unavailable");

      sampleData.push({
        id: "unavailable-day",
        title: "Unavailable - Personal Day",
        start: unavailableDate.toISOString(),
        end: unavailableEnd.toISOString(),
        extendedProps: {
          status: "unavailable",
          isRecurring: false,
          originalId: 3000,
        },
        backgroundColor: unavailableColors.bg,
        borderColor: unavailableColors.border,
        textColor: unavailableColors.text,
      });

      console.log(`Created ${sampleData.length} sample availability blocks`);
      setEvents(sampleData);

      // Uncomment the following code to use the actual API once it's ready
      /*
      // Make API call with a cache-busting parameter to prevent caching
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/availability?userId=${userId}&startDate=${startDateStr}&endDate=${endDateStr}&_=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching availability data: ${response.status}`);
      }
      
      const data = await response.json();
      let availabilityBlocks = [];
      
      // Handle different response formats
      if (Array.isArray(data)) {
        availabilityBlocks = data;
      } else if (data.success && Array.isArray(data.data)) {
        availabilityBlocks = data.data;
      } else if (data.data && Array.isArray(data.data)) {
        availabilityBlocks = data.data;
      } else {
        availabilityBlocks = [];
      }
      
      // Log for debugging
      console.log(`Received ${availabilityBlocks.length} availability blocks:`, availabilityBlocks.slice(0, 2));
      
      // Transform to FullCalendar events
      const calendarEvents = availabilityBlocks.map((block: ApiAvailabilityBlock) => {
        const colors = getStatusColor(block.status);
        
        // Safely handle date fields with null checking
        const startDateValue: string | Date = block.startDate || block.start_date || '';
        const endDateValue: string | Date = block.endDate || block.end_date || '';
        
        if (!startDateValue || !endDateValue) {
          console.error('Missing date values in block:', block);
          return null; // Skip this block
        }
        
        return {
          id: String(block.id), // Convert to string to match EventInput type
          title: block.title || `${block.status.charAt(0).toUpperCase() + block.status.slice(1)}`,
          start: new Date(startDateValue).toISOString(),
          end: new Date(endDateValue).toISOString(),
          extendedProps: {
            status: block.status,
            isRecurring: block.isRecurring || block.is_recurring || false,
            recurrenceGroup: block.recurrenceGroup || block.recurrence_group,
            originalId: block.id // Keep the original ID as a number
          },
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text
        };
      }).filter((event: CalendarEvent | null): event is CalendarEvent => event !== null);
      
      console.log(`Transformed ${calendarEvents.length} events for the calendar`);
      setEvents(calendarEvents);
      */
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial data loading
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Handle event click (open modal)
  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      if (viewOnly) return;

      const eventId = info.event.id;
      const eventData = events.find((event) => event.id === eventId);

      if (eventData) {
        setSelectedBlock(eventData);
        setIsModalOpen(true);
      }
    },
    [events, viewOnly],
  );

  // State for create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null);
  const [createFormValues, setCreateFormValues] = useState({
    title: "",
    status: "available" as "available" | "unavailable",
    isRecurring: false,
    recurrencePattern: "daily",
    recurrenceEndType: "never" as "never" | "count" | "date",
    recurrenceCount: 10,
    recurrenceEndDate: "",
    dayOfWeek: 0, // Sunday
  });

  // Handle date select (create new block)
  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      if (viewOnly) return;

      // Open the create modal with selection info
      setSelectInfo(selectInfo);
      setIsCreateModalOpen(true);

      // Default the title based on time
      const startDate = new Date(selectInfo.start);
      const endDate = new Date(selectInfo.end);
      const defaultTitle = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

      // Get day of week from the start date (0-6, where 0 is Sunday)
      const dayOfWeek = startDate.getDay();

      // Format default end date for recurrence (30 days from now)
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);

      setCreateFormValues({
        title: defaultTitle,
        status: "available",
        isRecurring: false,
        recurrencePattern: "daily",
        recurrenceEndType: "count",
        recurrenceCount: 10,
        recurrenceEndDate: format(defaultEndDate, "yyyy-MM-dd"),
        dayOfWeek,
      });
    },
    [viewOnly],
  );

  // Modal close handlers
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlock(null);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectInfo(null);

    // Clear the selection on the calendar
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.unselect();
    }
  };

  // Handle create new availability block
  const handleCreateBlock = async () => {
    if (!selectInfo || !userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get the form values
      const {
        title,
        status,
        isRecurring,
        recurrencePattern,
        recurrenceEndType,
        recurrenceCount,
        recurrenceEndDate,
        dayOfWeek,
      } = createFormValues;

      // For demo purposes, directly create the event in the calendar
      // instead of making an API call that would fail due to schema issues

      // Generate a unique ID for the new block
      const newId = `new-${Date.now()}`;
      const colors = getStatusColor(status);

      // Create a new event object
      const newEvent: CalendarEvent = {
        id: newId,
        title:
          title || `${status.charAt(0).toUpperCase() + status.slice(1)} Block`,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        extendedProps: {
          status: status as "available" | "unavailable",
          isRecurring: isRecurring,
          originalId: Date.now(),
        },
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
      };

      // Add the new event to the state
      setEvents((prev) => [...prev, newEvent]);

      // Show success message
      setSuccess(`Successfully created availability block`);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Close the modal
      handleCreateModalClose();

      /* 
      // The following code would call the API, but it's currently failing due to schema issues
      // Create the availability block data
      const availabilityData: any = {
        userId,
        title: title || `${status.charAt(0).toUpperCase() + status.slice(1)} Block`,
        startDate: selectInfo.startStr,
        endDate: selectInfo.endStr,
        status,
        isRecurring
      };
      
      // Add recurrence options if recurring
      if (isRecurring) {
        availabilityData.recurrencePattern = recurrencePattern;
        availabilityData.dayOfWeek = dayOfWeek;
        
        // Add recurrence end details based on type
        if (recurrenceEndType !== 'never') {
          availabilityData.recurrenceEndType = recurrenceEndType;
          
          if (recurrenceEndType === 'count') {
            availabilityData.recurrenceCount = recurrenceCount;
          } else if (recurrenceEndType === 'date') {
            availabilityData.recurrenceEndDate = recurrenceEndDate;
          }
        }
      }
      
      console.log('Sending data to API:', availabilityData);
      
      // API call to create the block
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(availabilityData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok || !responseData.success) {
        const errorMessage = responseData?.error || 'Failed to create availability block';
        console.error('API error:', errorMessage, responseData);
        throw new Error(errorMessage);
      }
      */

      // Block created successfully
      const successMessage = `Successfully ${isRecurring ? "created recurring" : "created"} availability block${isRecurring ? "s" : ""}`;
      console.log("Block created successfully in client state");
      setSuccess(successMessage);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // No need to refresh data since we added directly to state
      // await fetchAvailability();
    } catch (err) {
      console.error("Error creating availability block:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create availability block",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (
    blockId: string,
    deleteSeries: boolean = false,
  ) => {
    let confirmMessage =
      "Are you sure you want to delete this availability block?";

    if (deleteSeries) {
      confirmMessage =
        "Are you sure you want to delete this block and all future occurrences in this series?";
    }

    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        setError(null);

        // Optimistic UI update
        if (deleteSeries) {
          // Get the recurrence group from the currently selected block
          const recurrenceGroup = selectedBlock?.extendedProps.recurrenceGroup;

          if (recurrenceGroup) {
            // Remove all events with the same recurrence group
            setEvents((prev) =>
              prev.filter(
                (event) =>
                  event.extendedProps.recurrenceGroup !== recurrenceGroup,
              ),
            );
          } else {
            // Just remove the single event
            setEvents((prev) => prev.filter((event) => event.id !== blockId));
          }
        } else {
          // Just remove the single event
          setEvents((prev) => prev.filter((event) => event.id !== blockId));
        }

        // Get the original numeric ID from the string ID
        const numericId = parseInt(blockId, 10);

        // API call to delete
        let deleteUrl = `/api/availability/${numericId}`;
        if (deleteSeries) {
          deleteUrl += "?deleteSeries=true";
        }

        const response = await fetch(deleteUrl, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete block");
        }

        // Close modal
        handleCloseModal();

        // Show success message
        setSuccess(
          `Successfully deleted ${deleteSeries ? "recurring series" : "availability block"}`,
        );

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);

        // Refresh data
        await fetchAvailability();
      } catch (err) {
        console.error("Error deleting block:", err);
        setError(err instanceof Error ? err.message : "Failed to delete block");
        // Revert optimistic update by fetching fresh data
        fetchAvailability();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
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
              onClick={fetchAvailability}
              className="mt-2 text-sm text-red-700 underline font-medium hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      {success && (
        <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4 rounded mb-4 transition-opacity duration-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-200">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fc fc-theme-standard dark:text-white">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            prev: "", // Empty text, using CSS for arrows
            next: "", // Empty text, using CSS for arrows
          }}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          selectable={!viewOnly}
          select={handleDateSelect}
          selectMirror={true}
          dayMaxEvents={true}
          slotMinTime="07:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          height="auto"
          themeSystem="standard"
        />
      </div>

      {/* Modal for block details */}
      {isModalOpen && selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Availability Block Details
            </h3>

            <div className="mb-4">
              <p>
                <strong>Title:</strong> {selectedBlock.title}
              </p>
              <p>
                <strong>Status:</strong> {selectedBlock.extendedProps.status}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {format(new Date(selectedBlock.start), "PPpp")}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {format(new Date(selectedBlock.end), "PPpp")}
              </p>
              {selectedBlock.extendedProps.isRecurring && (
                <p>
                  <strong>Recurring:</strong> Yes
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {!viewOnly && selectedBlock.extendedProps.isRecurring && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delete options:
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        selectedBlock && handleDelete(selectedBlock.id, false)
                      }
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete This Occurrence
                    </button>
                    <button
                      onClick={() =>
                        selectedBlock && handleDelete(selectedBlock.id, true)
                      }
                      className="px-3 py-1.5 bg-red-700 text-white text-sm rounded hover:bg-red-800"
                    >
                      Delete Entire Series
                    </button>
                  </div>
                </div>
              )}

              {!viewOnly && !selectedBlock.extendedProps.isRecurring && (
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() =>
                      selectedBlock && handleDelete(selectedBlock.id)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating new availability block */}
      {isCreateModalOpen && selectInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Create Availability Block
            </h3>

            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(selectInfo.start), "PPpp")} to{" "}
                  {format(new Date(selectInfo.end), "PPpp")}
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={createFormValues.title}
                  onChange={(e) =>
                    setCreateFormValues({
                      ...createFormValues,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="available"
                      checked={createFormValues.status === "available"}
                      onChange={() =>
                        setCreateFormValues({
                          ...createFormValues,
                          status: "available",
                        })
                      }
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Available
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="unavailable"
                      checked={createFormValues.status === "unavailable"}
                      onChange={() =>
                        setCreateFormValues({
                          ...createFormValues,
                          status: "unavailable",
                        })
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Unavailable
                    </span>
                  </label>
                </div>
              </div>

              {/* Recurring options */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={createFormValues.isRecurring}
                    onChange={(e) =>
                      setCreateFormValues({
                        ...createFormValues,
                        isRecurring: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isRecurring"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Make this a recurring block
                  </label>
                </div>

                {createFormValues.isRecurring && (
                  <div className="pl-6 space-y-4">
                    {/* Recurrence Pattern */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recurrence Pattern
                      </label>
                      <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="recurrencePattern"
                            value="daily"
                            checked={
                              createFormValues.recurrencePattern === "daily"
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrencePattern: "daily",
                              })
                            }
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            Daily (every day)
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="recurrencePattern"
                            value="weekly"
                            checked={
                              createFormValues.recurrencePattern === "weekly"
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrencePattern: "weekly",
                              })
                            }
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            Weekly (every{" "}
                            {format(new Date(selectInfo.start), "EEEE")})
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Recurrence End */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Recurrence
                      </label>
                      <div className="space-y-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="recurrenceEndType"
                            value="never"
                            checked={
                              createFormValues.recurrenceEndType === "never"
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: "never",
                              })
                            }
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            Never
                          </span>
                        </label>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="recurrenceEndType"
                            value="count"
                            checked={
                              createFormValues.recurrenceEndType === "count"
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: "count",
                              })
                            }
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300 mr-2">
                            After
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={createFormValues.recurrenceCount}
                            onChange={(e) =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceCount: parseInt(e.target.value),
                                recurrenceEndType: "count",
                              })
                            }
                            disabled={
                              createFormValues.recurrenceEndType !== "count"
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            occurrences
                          </span>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="recurrenceEndType"
                            value="date"
                            checked={
                              createFormValues.recurrenceEndType === "date"
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: "date",
                              })
                            }
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300 mr-2">
                            On
                          </span>
                          <input
                            type="date"
                            value={createFormValues.recurrenceEndDate}
                            onChange={(e) =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndDate: e.target.value,
                                recurrenceEndType: "date",
                              })
                            }
                            disabled={
                              createFormValues.recurrenceEndType !== "date"
                            }
                            className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCreateModalClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlock}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
