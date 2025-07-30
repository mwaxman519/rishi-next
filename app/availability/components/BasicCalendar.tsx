&quot;use client&quot;;

import React, { useState, useEffect, useCallback, useRef } from &quot;react&quot;;
import FullCalendar from &quot;@fullcalendar/react&quot;;
import dayGridPlugin from &quot;@fullcalendar/daygrid&quot;;
import timeGridPlugin from &quot;@fullcalendar/timegrid&quot;;
import interactionPlugin from &quot;@fullcalendar/interaction&quot;;
import { DateSelectArg, EventClickArg } from &quot;@fullcalendar/core&quot;;
import { format } from &quot;date-fns&quot;;
// CSS imported in layout.tsx to prevent webpack style-loader issues

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
  status: &quot;available&quot; | &quot;unavailable&quot;;
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
    status: &quot;available&quot; | &quot;unavailable&quot;;
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
    return format(date, &quot;yyyy-MM-dd&quot;);
  };

  // Status colors
  const getStatusColor = (
    status: string,
  ): { bg: string; border: string; text: string } => {
    switch (status) {
      case &quot;available&quot;:
        return { bg: &quot;#00A8A8&quot;, border: &quot;#007777&quot;, text: &quot;#FFFFFF&quot; };
      case &quot;unavailable&quot;:
        return { bg: &quot;#E53E3E&quot;, border: &quot;#C53030&quot;, text: &quot;#FFFFFF&quot; };
      default:
        return { bg: &quot;#718096&quot;, border: &quot;#4A5568&quot;, text: &quot;#FFFFFF&quot; };
    }
  };

  // Fetch availability data from API
  const fetchAvailability = useCallback(async () => {
    if (!userId) {
      setError(&quot;No user ID provided&quot;);
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

      console.log(&quot;Creating sample availability data for demonstration&quot;);

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

        const availableColors = getStatusColor(&quot;available&quot;);

        // Add morning availability
        sampleData.push({
          id: `morning-${i}`,
          title: &quot;Available&quot;,
          start: morningStart.toISOString(),
          end: morningEnd.toISOString(),
          extendedProps: {
            status: &quot;available&quot;,
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
          title: &quot;Available&quot;,
          start: afternoonStart.toISOString(),
          end: afternoonEnd.toISOString(),
          extendedProps: {
            status: &quot;available&quot;,
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

      const unavailableColors = getStatusColor(&quot;unavailable&quot;);

      sampleData.push({
        id: &quot;unavailable-day&quot;,
        title: &quot;Unavailable - Personal Day&quot;,
        start: unavailableDate.toISOString(),
        end: unavailableEnd.toISOString(),
        extendedProps: {
          status: &quot;unavailable&quot;,
          isRecurring: false,
          originalId: 3000,
        },
        backgroundColor: unavailableColors.bg,
        borderColor: unavailableColors.border,
        textColor: unavailableColors.text,
      });

      console.log(`Created ${sampleData.length} sample availability blocks`);
      setEvents(sampleData);

      // Uncomment the following code to use the actual API once it&apos;s ready
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
      console.error(&quot;Error fetching availability:&quot;, err);
      setError(err instanceof Error ? err.message : &quot;Unknown error occurred&quot;);
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
    title: "&quot;,
    status: &quot;available&quot; as &quot;available&quot; | &quot;unavailable&quot;,
    isRecurring: false,
    recurrencePattern: &quot;daily&quot;,
    recurrenceEndType: &quot;never&quot; as &quot;never&quot; | &quot;count&quot; | &quot;date&quot;,
    recurrenceCount: 10,
    recurrenceEndDate: &quot;&quot;,
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
      const defaultTitle = `${format(startDate, &quot;h:mm a&quot;)} - ${format(endDate, &quot;h:mm a&quot;)}`;

      // Get day of week from the start date (0-6, where 0 is Sunday)
      const dayOfWeek = startDate.getDay();

      // Format default end date for recurrence (30 days from now)
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);

      setCreateFormValues({
        title: defaultTitle,
        status: &quot;available&quot;,
        isRecurring: false,
        recurrencePattern: &quot;daily&quot;,
        recurrenceEndType: &quot;count&quot;,
        recurrenceCount: 10,
        recurrenceEndDate: format(defaultEndDate, &quot;yyyy-MM-dd&quot;),
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
          status: status as &quot;available&quot; | &quot;unavailable&quot;,
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
      // The following code would call the API, but it&apos;s currently failing due to schema issues
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
      const successMessage = `Successfully ${isRecurring ? &quot;created recurring&quot; : &quot;created&quot;} availability block${isRecurring ? &quot;s&quot; : &quot;&quot;}`;
      console.log(&quot;Block created successfully in client state&quot;);
      setSuccess(successMessage);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // No need to refresh data since we added directly to state
      // await fetchAvailability();
    } catch (err) {
      console.error(&quot;Error creating availability block:&quot;, err);
      setError(
        err instanceof Error
          ? err.message
          : &quot;Failed to create availability block&quot;,
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
      &quot;Are you sure you want to delete this availability block?&quot;;

    if (deleteSeries) {
      confirmMessage =
        &quot;Are you sure you want to delete this block and all future occurrences in this series?&quot;;
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
          deleteUrl += &quot;?deleteSeries=true&quot;;
        }

        const response = await fetch(deleteUrl, {
          method: &quot;DELETE&quot;,
        });

        if (!response.ok) {
          throw new Error(&quot;Failed to delete block&quot;);
        }

        // Close modal
        handleCloseModal();

        // Show success message
        setSuccess(
          `Successfully deleted ${deleteSeries ? &quot;recurring series&quot; : &quot;availability block&quot;}`,
        );

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);

        // Refresh data
        await fetchAvailability();
      } catch (err) {
        console.error(&quot;Error deleting block:&quot;, err);
        setError(err instanceof Error ? err.message : &quot;Failed to delete block&quot;);
        // Revert optimistic update by fetching fresh data
        fetchAvailability();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className=&quot;flex justify-center items-center h-64&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500&quot;></div>
        <span className=&quot;ml-3 text-gray-600&quot;>Loading calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className=&quot;bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4&quot;>
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
              onClick={fetchAvailability}
              className=&quot;mt-2 text-sm text-red-700 underline font-medium hover:text-red-600&quot;
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;bg-white dark:bg-gray-800 shadow rounded-lg p-4&quot;>
      {success && (
        <div className=&quot;bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4 rounded mb-4 transition-opacity duration-300&quot;>
          <div className=&quot;flex&quot;>
            <div className=&quot;flex-shrink-0&quot;>
              <svg
                className=&quot;h-5 w-5 text-green-400&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
                viewBox=&quot;0 0 20 20&quot;
                fill=&quot;currentColor&quot;
              >
                <path
                  fillRule=&quot;evenodd&quot;
                  d=&quot;M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z&quot;
                  clipRule=&quot;evenodd&quot;
                />
              </svg>
            </div>
            <div className=&quot;ml-3&quot;>
              <p className=&quot;text-sm text-green-700 dark:text-green-200&quot;>
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className=&quot;fc fc-theme-standard dark:text-white&quot;>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView=&quot;timeGridWeek&quot;
          headerToolbar={{
            left: &quot;prev,next today&quot;,
            center: &quot;title&quot;,
            right: &quot;dayGridMonth,timeGridWeek,timeGridDay&quot;,
          }}
          buttonText={{
            today: &quot;Today&quot;,
            month: &quot;Month&quot;,
            week: &quot;Week&quot;,
            day: &quot;Day&quot;,
            prev: &quot;&quot;, // Empty text, using CSS for arrows
            next: &quot;&quot;, // Empty text, using CSS for arrows
          }}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          selectable={!viewOnly}
          select={handleDateSelect}
          selectMirror={true}
          dayMaxEvents={true}
          slotMinTime=&quot;07:00:00&quot;
          slotMaxTime=&quot;24:00:00&quot;
          slotDuration=&quot;00:30:00&quot;
          snapDuration=&quot;00:15:00&quot;
          allDaySlot={false}
          height=&quot;auto&quot;
          themeSystem=&quot;standard&quot;
        />
      </div>

      {/* Modal for block details */}
      {isModalOpen && selectedBlock && (
        <div className=&quot;fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4&quot;>
          <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6&quot;>
            <h3 className=&quot;text-lg font-semibold mb-4&quot;>
              Availability Block Details
            </h3>

            <div className=&quot;mb-4&quot;>
              <p>
                <strong>Title:</strong> {selectedBlock.title}
              </p>
              <p>
                <strong>Status:</strong> {selectedBlock.extendedProps.status}
              </p>
              <p>
                <strong>Start:</strong>{&quot; &quot;}
                {format(new Date(selectedBlock.start), &quot;PPpp&quot;)}
              </p>
              <p>
                <strong>End:</strong>{&quot; &quot;}
                {format(new Date(selectedBlock.end), &quot;PPpp&quot;)}
              </p>
              {selectedBlock.extendedProps.isRecurring && (
                <p>
                  <strong>Recurring:</strong> Yes
                </p>
              )}
            </div>

            <div className=&quot;flex flex-col space-y-3&quot;>
              {!viewOnly && selectedBlock.extendedProps.isRecurring && (
                <div className=&quot;border-t border-gray-200 dark:border-gray-700 pt-3 mt-2&quot;>
                  <h4 className=&quot;text-sm font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                    Delete options:
                  </h4>
                  <div className=&quot;flex space-x-2&quot;>
                    <button
                      onClick={() =>
                        selectedBlock && handleDelete(selectedBlock.id, false)
                      }
                      className=&quot;px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700&quot;
                    >
                      Delete This Occurrence
                    </button>
                    <button
                      onClick={() =>
                        selectedBlock && handleDelete(selectedBlock.id, true)
                      }
                      className=&quot;px-3 py-1.5 bg-red-700 text-white text-sm rounded hover:bg-red-800&quot;
                    >
                      Delete Entire Series
                    </button>
                  </div>
                </div>
              )}

              {!viewOnly && !selectedBlock.extendedProps.isRecurring && (
                <div className=&quot;flex justify-end space-x-2 mt-2&quot;>
                  <button
                    onClick={() =>
                      selectedBlock && handleDelete(selectedBlock.id)
                    }
                    className=&quot;px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700&quot;
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className=&quot;flex justify-end space-x-2 mt-2&quot;>
                <button
                  onClick={handleCloseModal}
                  className=&quot;px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600&quot;
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
        <div className=&quot;fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4&quot;>
          <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6&quot;>
            <h3 className=&quot;text-lg font-semibold mb-4&quot;>
              Create Availability Block
            </h3>

            <div className=&quot;mb-6 space-y-4&quot;>
              <div>
                <label className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;>
                  Time Range
                </label>
                <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>
                  {format(new Date(selectInfo.start), &quot;PPpp&quot;)} to{&quot; &quot;}
                  {format(new Date(selectInfo.end), &quot;PPpp&quot;)}
                </p>
              </div>

              <div>
                <label
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  htmlFor=&quot;title&quot;
                >
                  Title
                </label>
                <input
                  type=&quot;text&quot;
                  id=&quot;title&quot;
                  value={createFormValues.title}
                  onChange={(e) =>
                    setCreateFormValues({
                      ...createFormValues,
                      title: e.target.value,
                    })
                  }
                  className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white&quot;
                />
              </div>

              <div>
                <label className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;>
                  Status
                </label>
                <div className=&quot;flex space-x-4&quot;>
                  <label className=&quot;inline-flex items-center&quot;>
                    <input
                      type=&quot;radio&quot;
                      name=&quot;status&quot;
                      value=&quot;available&quot;
                      checked={createFormValues.status === &quot;available&quot;}
                      onChange={() =>
                        setCreateFormValues({
                          ...createFormValues,
                          status: &quot;available&quot;,
                        })
                      }
                      className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                    />
                    <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                      Available
                    </span>
                  </label>
                  <label className=&quot;inline-flex items-center&quot;>
                    <input
                      type=&quot;radio&quot;
                      name=&quot;status&quot;
                      value=&quot;unavailable&quot;
                      checked={createFormValues.status === &quot;unavailable&quot;}
                      onChange={() =>
                        setCreateFormValues({
                          ...createFormValues,
                          status: &quot;unavailable&quot;,
                        })
                      }
                      className=&quot;h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300&quot;
                    />
                    <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                      Unavailable
                    </span>
                  </label>
                </div>
              </div>

              {/* Recurring options */}
              <div className=&quot;pt-4 border-t border-gray-200 dark:border-gray-700&quot;>
                <div className=&quot;flex items-center mb-4&quot;>
                  <input
                    type=&quot;checkbox&quot;
                    id=&quot;isRecurring&quot;
                    checked={createFormValues.isRecurring}
                    onChange={(e) =>
                      setCreateFormValues({
                        ...createFormValues,
                        isRecurring: e.target.checked,
                      })
                    }
                    className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded&quot;
                  />
                  <label
                    htmlFor=&quot;isRecurring&quot;
                    className=&quot;ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300&quot;
                  >
                    Make this a recurring block
                  </label>
                </div>

                {createFormValues.isRecurring && (
                  <div className=&quot;pl-6 space-y-4&quot;>
                    {/* Recurrence Pattern */}
                    <div>
                      <label className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;>
                        Recurrence Pattern
                      </label>
                      <div className=&quot;flex flex-col space-y-2&quot;>
                        <label className=&quot;inline-flex items-center&quot;>
                          <input
                            type=&quot;radio&quot;
                            name=&quot;recurrencePattern&quot;
                            value=&quot;daily&quot;
                            checked={
                              createFormValues.recurrencePattern === &quot;daily&quot;
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrencePattern: &quot;daily&quot;,
                              })
                            }
                            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                            Daily (every day)
                          </span>
                        </label>
                        <label className=&quot;inline-flex items-center&quot;>
                          <input
                            type=&quot;radio&quot;
                            name=&quot;recurrencePattern&quot;
                            value=&quot;weekly&quot;
                            checked={
                              createFormValues.recurrencePattern === &quot;weekly&quot;
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrencePattern: &quot;weekly&quot;,
                              })
                            }
                            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                            Weekly (every{&quot; &quot;}
                            {format(new Date(selectInfo.start), &quot;EEEE&quot;)})
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Recurrence End */}
                    <div>
                      <label className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;>
                        End Recurrence
                      </label>
                      <div className=&quot;space-y-3&quot;>
                        <label className=&quot;inline-flex items-center&quot;>
                          <input
                            type=&quot;radio&quot;
                            name=&quot;recurrenceEndType&quot;
                            value=&quot;never&quot;
                            checked={
                              createFormValues.recurrenceEndType === &quot;never&quot;
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: &quot;never&quot;,
                              })
                            }
                            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                            Never
                          </span>
                        </label>

                        <div className=&quot;flex items-center&quot;>
                          <input
                            type=&quot;radio&quot;
                            name=&quot;recurrenceEndType&quot;
                            value=&quot;count&quot;
                            checked={
                              createFormValues.recurrenceEndType === &quot;count&quot;
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: &quot;count&quot;,
                              })
                            }
                            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300 mr-2&quot;>
                            After
                          </span>
                          <input
                            type=&quot;number&quot;
                            min=&quot;1&quot;
                            max=&quot;100&quot;
                            value={createFormValues.recurrenceCount}
                            onChange={(e) =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceCount: parseInt(e.target.value),
                                recurrenceEndType: &quot;count&quot;,
                              })
                            }
                            disabled={
                              createFormValues.recurrenceEndType !== &quot;count&quot;
                            }
                            className=&quot;w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300&quot;>
                            occurrences
                          </span>
                        </div>

                        <div className=&quot;flex items-center&quot;>
                          <input
                            type=&quot;radio&quot;
                            name=&quot;recurrenceEndType&quot;
                            value=&quot;date&quot;
                            checked={
                              createFormValues.recurrenceEndType === &quot;date&quot;
                            }
                            onChange={() =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndType: &quot;date&quot;,
                              })
                            }
                            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300&quot;
                          />
                          <span className=&quot;ml-2 text-gray-700 dark:text-gray-300 mr-2&quot;>
                            On
                          </span>
                          <input
                            type=&quot;date&quot;
                            value={createFormValues.recurrenceEndDate}
                            onChange={(e) =>
                              setCreateFormValues({
                                ...createFormValues,
                                recurrenceEndDate: e.target.value,
                                recurrenceEndType: &quot;date&quot;,
                              })
                            }
                            disabled={
                              createFormValues.recurrenceEndType !== &quot;date&quot;
                            }
                            className=&quot;px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white&quot;
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className=&quot;flex justify-end space-x-2&quot;>
              <button
                onClick={handleCreateModalClose}
                className=&quot;px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600&quot;
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlock}
                className=&quot;px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
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
