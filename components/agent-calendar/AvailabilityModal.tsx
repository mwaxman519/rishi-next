&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { DateSelectArg } from &quot;@fullcalendar/core&quot;;
import { format } from &quot;date-fns&quot;;

interface AvailabilityConflict {
  existingBlock: {
    id: number;
    title: string;
    startDate: string | Date;
    endDate: string | Date;
    status: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
    isRecurring: boolean;
  };
  conflictType: &quot;overlap&quot; | &quot;adjacent&quot; | &quot;contained&quot;;
}

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    status: string,
    isRecurring: boolean,
    recurrencePattern: string,
    recurrenceEndType?: string,
    recurrenceEndDate?: string,
    recurrenceCount?: number,
    mergeStrategy?: &quot;merge&quot; | &quot;override&quot;,
    modifiedStartStr?: string,
    modifiedEndStr?: string,
  ) => void;
  selectInfo: DateSelectArg | null;
  userId?: number | string; // Add userId prop - supports both number and UUID string
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  onSave,
  selectInfo,
  userId: propUserId,
}: AvailabilityModalProps) {
  // Format dates and times for display and editing
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTimeStr, setStartTimeStr] = useState("&quot;);
  const [endTimeStr, setEndTimeStr] = useState(&quot;&quot;);
  const [dayStr, setDayStr] = useState(&quot;&quot;);

  // Initialize dates when selectInfo changes
  useEffect(() => {
    if (selectInfo) {
      const start = new Date(selectInfo.startStr);
      const end = new Date(selectInfo.endStr);

      setStartDate(start);
      setEndDate(end);
      setStartTimeStr(format(start, &quot;HH:mm&quot;));
      setEndTimeStr(format(end, &quot;HH:mm&quot;));
      setDayStr(format(start, &quot;EEEE, MMMM d, yyyy&quot;));
    }
  }, [selectInfo]);

  // Form state
  const [title, setTitle] = useState(&quot;&quot;);
  const [status, setStatus] = useState(&quot;available&quot;);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState(&quot;weekly&quot;);
  const [recurrenceEndType, setRecurrenceEndType] = useState(&quot;date&quot;);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(&quot;&quot;);
  const [recurrenceCount, setRecurrenceCount] = useState(10);

  // Conflict detection
  const [conflicts, setConflicts] = useState<AvailabilityConflict[]>([]);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<
    &quot;merge&quot; | &quot;override&quot; | undefined
  >(undefined);

  // Use userId from props or fallback to default UUID
  const [userId, setUserId] = useState<string | number>(
    propUserId || &quot;00000000-0000-0000-0000-000000000001&quot;,
  );

  // Update userId when prop changes
  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
      console.log(&quot;Using provided userId from prop:&quot;, propUserId);
    } else {
      // Use default UUID for mock user
      const defaultUserId = &quot;00000000-0000-0000-0000-000000000001&quot;;
      setUserId(defaultUserId);
      console.log(&quot;Using default userId:&quot;, defaultUserId);
    }
  }, [propUserId]);

  // Set default end date (3 months from now) when modal opens
  useEffect(() => {
    if (isOpen && selectInfo) {
      const defaultEndDate = new Date(selectInfo.startStr);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
      const endDateStr = defaultEndDate.toISOString().split(&quot;T&quot;)[0];
      if (endDateStr) {
        setRecurrenceEndDate(endDateStr);
      }
    }
  }, [isOpen, selectInfo]);

  // Check for conflicts whenever status changes
  useEffect(() => {
    if (isOpen && selectInfo && userId) {
      checkForConflicts();
    }
  }, [isOpen, selectInfo, userId, status]);

  async function checkForConflicts() {
    if (!selectInfo || !userId) return;

    setIsCheckingConflicts(true);

    try {
      const response = await fetch(
        `/api/availability/conflicts?userId=${userId}&startDate=${selectInfo.startStr}&endDate=${selectInfo.endStr}&status=${status}`,
        {
          method: &quot;GET&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
        setHasConflicts(data.hasConflicts || false);

        // Auto-set merge strategy if there are conflicts with same status
        if (data.conflicts && data.conflicts.length > 0) {
          const sameStatusConflicts = data.conflicts.filter(
            (conflict: AvailabilityConflict) =>
              conflict.existingBlock.status === status,
          );

          if (sameStatusConflicts.length > 0) {
            setMergeStrategy(&quot;merge&quot;);
          } else {
            setConflicts(data.conflicts);
            setHasConflicts(true);
            setMergeStrategy(undefined);
          }
        } else {
          setConflicts([]);
          setHasConflicts(false);
        }
      } else {
        setConflicts([]);
        setHasConflicts(false);
      }
      setMergeStrategy(undefined);
    } catch (error) {
      console.error(&quot;Error checking conflicts:&quot;, error);
      setConflicts([]);
      setHasConflicts(false);
    } finally {
      setIsCheckingConflicts(false);
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!isOpen || !selectInfo) return;

    // Validate required fields
    if (!title.trim()) {
      alert(&quot;Please enter a title for this availability block.&quot;);
      return;
    }

    // Check if we need merge strategy for conflicts
    if (hasConflicts && !mergeStrategy) {
      alert(&quot;Please choose how to handle the scheduling conflicts.&quot;);
      return;
    }

    // Calculate modified times if user changed them
    let modifiedStartStr: string | undefined;
    let modifiedEndStr: string | undefined;

    if (startDate && endDate) {
      const originalStart = new Date(selectInfo.startStr);
      const originalEnd = new Date(selectInfo.endStr);

      // Check if times were modified
      if (startDate.getTime() !== originalStart.getTime()) {
        modifiedStartStr = startDate.toISOString();
      }
      if (endDate.getTime() !== originalEnd.getTime()) {
        modifiedEndStr = endDate.toISOString();
      }
    }

    // Call the onSave callback
    onSave(
      title,
      status,
      isRecurring,
      recurrencePattern,
      isRecurring ? recurrenceEndType : undefined,
      isRecurring && recurrenceEndType === &quot;date&quot;
        ? recurrenceEndDate
        : undefined,
      isRecurring && recurrenceEndType === &quot;count&quot;
        ? recurrenceCount
        : undefined,
      mergeStrategy,
      modifiedStartStr,
      modifiedEndStr,
    );

    // Reset form
    handleClose();
  };

  const handleClose = () => {
    setStatus(&quot;available&quot;);
    setTitle(&quot;&quot;);
    setTitle(
      status === &quot;available&quot;
        ? &quot;Available&quot;
        : status === &quot;unavailable&quot;
          ? &quot;Unavailable&quot;
          : &quot;Tentative&quot;,
    );
    setIsRecurring(false);
    setRecurrencePattern(&quot;weekly&quot;);
    setRecurrenceEndType(&quot;date&quot;);
    setRecurrenceEndDate(&quot;&quot;);
    setRecurrenceCount(10);
    setConflicts([]);
    setHasConflicts(false);
    setMergeStrategy(undefined);
    onClose();
  };

  // Update title when status changes
  useEffect(() => {
    if (status === &quot;available&quot;) {
      setTitle(&quot;Available&quot;);
    } else if (status === &quot;unavailable&quot;) {
      setTitle(&quot;Unavailable&quot;);
    } else if (status === &quot;tentative&quot;) {
      setTitle(&quot;Tentative&quot;);
    }
  }, [status]);

  if (!isOpen || !selectInfo) return null;

  return (
    <div className=&quot;fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50&quot;>
      <div className=&quot;bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto&quot;>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Add Availability Block</h2>

        {/* Time Display */}
        <div className=&quot;mb-4 p-3 bg-gray-50 rounded&quot;>
          <div className=&quot;text-sm text-gray-600&quot;>{dayStr}</div>
          <div className=&quot;font-medium&quot;>
            {startTimeStr} - {endTimeStr}
          </div>
        </div>

        {/* Title Input */}
        <div className=&quot;mb-4&quot;>
          <label className=&quot;block text-sm font-medium mb-1&quot;>Title</label>
          <input
            type=&quot;text&quot;
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
            placeholder=&quot;Enter availability title&quot;
          />
        </div>

        {/* Status Selection */}
        <div className=&quot;mb-4&quot;>
          <label className=&quot;block text-sm font-medium mb-1&quot;>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
          >
            <option value=&quot;available&quot;>Available</option>
            <option value=&quot;unavailable&quot;>Unavailable</option>
            <option value=&quot;tentative&quot;>Tentative</option>
          </select>
        </div>

        {/* Recurring Options */}
        <div className=&quot;mb-4&quot;>
          <label className=&quot;flex items-center&quot;>
            <input
              type=&quot;checkbox&quot;
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className=&quot;mr-2&quot;
            />
            <span className=&quot;text-sm font-medium&quot;>Make this recurring</span>
          </label>
        </div>

        {isRecurring && (
          <div className=&quot;mb-4 p-3 bg-gray-50 rounded&quot;>
            <div className=&quot;mb-3&quot;>
              <label className=&quot;block text-sm font-medium mb-1&quot;>
                Repeat Pattern
              </label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
              >
                <option value=&quot;daily&quot;>Daily</option>
                <option value=&quot;weekly&quot;>Weekly</option>
                <option value=&quot;monthly&quot;>Monthly</option>
              </select>
            </div>

            <div className=&quot;mb-3&quot;>
              <label className=&quot;block text-sm font-medium mb-1&quot;>
                End Condition
              </label>
              <select
                value={recurrenceEndType}
                onChange={(e) => setRecurrenceEndType(e.target.value)}
                className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
              >
                <option value=&quot;date&quot;>End by date</option>
                <option value=&quot;count&quot;>End after number of occurrences</option>
              </select>
            </div>

            {recurrenceEndType === &quot;date&quot; && (
              <div>
                <label className=&quot;block text-sm font-medium mb-1&quot;>
                  End Date
                </label>
                <input
                  type=&quot;date&quot;
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
                />
              </div>
            )}

            {recurrenceEndType === &quot;count&quot; && (
              <div>
                <label className=&quot;block text-sm font-medium mb-1&quot;>
                  Number of Occurrences
                </label>
                <input
                  type=&quot;number&quot;
                  value={recurrenceCount}
                  onChange={(e) =>
                    setRecurrenceCount(parseInt(e.target.value) || 1)
                  }
                  min=&quot;1&quot;
                  max=&quot;100&quot;
                  className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent&quot;
                />
              </div>
            )}
          </div>
        )}

        {/* Conflict Detection Results */}
        {isCheckingConflicts && (
          <div className=&quot;mb-4 p-3 bg-blue-50 border border-blue-200 rounded&quot;>
            <div className=&quot;text-sm text-blue-600&quot;>
              Checking for conflicts...
            </div>
          </div>
        )}

        {hasConflicts && conflicts.length > 0 && (
          <div className=&quot;mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded&quot;>
            <div className=&quot;text-sm font-medium text-yellow-800 mb-2&quot;>
              Scheduling Conflicts Detected ({conflicts.length})
            </div>
            <div className=&quot;space-y-2 mb-3&quot;>
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div
                  key={index}
                  className=&quot;text-xs text-yellow-700 bg-yellow-100 p-2 rounded&quot;
                >
                  <div className=&quot;font-medium&quot;>
                    {conflict.existingBlock.title}
                  </div>
                  <div>
                    {format(
                      new Date(conflict.existingBlock.startDate),
                      &quot;MMM d, h:mm a&quot;,
                    )}{&quot; &quot;}
                    -
                    {format(new Date(conflict.existingBlock.endDate), &quot;h:mm a&quot;)}
                  </div>
                  <div className=&quot;capitalize&quot;>
                    Status: {conflict.existingBlock.status}
                  </div>
                </div>
              ))}
              {conflicts.length > 3 && (
                <div className=&quot;text-xs text-yellow-600&quot;>
                  ...and {conflicts.length - 3} more conflicts
                </div>
              )}
            </div>

            <div>
              <label className=&quot;block text-sm font-medium mb-1 text-yellow-800&quot;>
                Resolution Strategy
              </label>
              <select
                value={mergeStrategy || &quot;&quot;}
                onChange={(e) =>
                  setMergeStrategy(
                    e.target.value as &quot;merge&quot; | &quot;override&quot; | undefined,
                  )
                }
                className=&quot;w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent&quot;
              >
                <option value=&quot;&quot;>Choose resolution...</option>
                <option value=&quot;merge&quot;>Merge with existing blocks</option>
                <option value=&quot;override&quot;>Override existing blocks</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className=&quot;flex justify-end space-x-3&quot;>
          <button
            onClick={handleClose}
            className=&quot;px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors&quot;
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCheckingConflicts || (hasConflicts && !mergeStrategy)}
            className=&quot;px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors&quot;
          >
            {isCheckingConflicts ? &quot;Checking...&quot; : &quot;Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
