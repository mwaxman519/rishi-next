"use client";

import React, { useState, useEffect } from "react";
import { DateSelectArg } from "@fullcalendar/core";
import { format } from "date-fns";

interface AvailabilityConflict {
  existingBlock: {
    id: number;
    title: string;
    startDate: string | Date;
    endDate: string | Date;
    status: "available" | "unavailable" | "tentative";
    isRecurring: boolean;
  };
  conflictType: "overlap" | "adjacent" | "contained";
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
    mergeStrategy?: "merge" | "override",
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
  const [startTimeStr, setStartTimeStr] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("");
  const [dayStr, setDayStr] = useState("");

  // Initialize dates when selectInfo changes
  useEffect(() => {
    if (selectInfo) {
      const start = new Date(selectInfo.startStr);
      const end = new Date(selectInfo.endStr);

      setStartDate(start);
      setEndDate(end);
      setStartTimeStr(format(start, "HH:mm"));
      setEndTimeStr(format(end, "HH:mm"));
      setDayStr(format(start, "EEEE, MMMM d, yyyy"));
    }
  }, [selectInfo]);

  // Form state
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("available");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("weekly");
  const [recurrenceEndType, setRecurrenceEndType] = useState("date");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceCount, setRecurrenceCount] = useState(10);

  // Conflict detection
  const [conflicts, setConflicts] = useState<AvailabilityConflict[]>([]);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<
    "merge" | "override" | undefined
  >(undefined);

  // Use userId from props or fallback to default UUID
  const [userId, setUserId] = useState<string | number>(
    propUserId || "00000000-0000-0000-0000-000000000001",
  );

  // Update userId when prop changes
  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
      console.log("Using provided userId from prop:", propUserId);
    } else {
      // Use default UUID for mock user
      const defaultUserId = "00000000-0000-0000-0000-000000000001";
      setUserId(defaultUserId);
      console.log("Using default userId:", defaultUserId);
    }
  }, [propUserId]);

  // Set default end date (3 months from now) when modal opens
  useEffect(() => {
    if (isOpen && selectInfo) {
      const defaultEndDate = new Date(selectInfo.startStr);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
      const endDateStr = defaultEndDate.toISOString().split("T")[0];
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
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
            setMergeStrategy("merge");
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
      console.error("Error checking conflicts:", error);
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
      alert("Please enter a title for this availability block.");
      return;
    }

    // Check if we need merge strategy for conflicts
    if (hasConflicts && !mergeStrategy) {
      alert("Please choose how to handle the scheduling conflicts.");
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
      isRecurring && recurrenceEndType === "date"
        ? recurrenceEndDate
        : undefined,
      isRecurring && recurrenceEndType === "count"
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
    setStatus("available");
    setTitle("");
    setTitle(
      status === "available"
        ? "Available"
        : status === "unavailable"
          ? "Unavailable"
          : "Tentative",
    );
    setIsRecurring(false);
    setRecurrencePattern("weekly");
    setRecurrenceEndType("date");
    setRecurrenceEndDate("");
    setRecurrenceCount(10);
    setConflicts([]);
    setHasConflicts(false);
    setMergeStrategy(undefined);
    onClose();
  };

  // Update title when status changes
  useEffect(() => {
    if (status === "available") {
      setTitle("Available");
    } else if (status === "unavailable") {
      setTitle("Unavailable");
    } else if (status === "tentative") {
      setTitle("Tentative");
    }
  }, [status]);

  if (!isOpen || !selectInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Availability Block</h2>

        {/* Time Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">{dayStr}</div>
          <div className="font-medium">
            {startTimeStr} - {endTimeStr}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter availability title"
          />
        </div>

        {/* Status Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="tentative">Tentative</option>
          </select>
        </div>

        {/* Recurring Options */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium">Make this recurring</span>
          </label>
        </div>

        {isRecurring && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Repeat Pattern
              </label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                End Condition
              </label>
              <select
                value={recurrenceEndType}
                onChange={(e) => setRecurrenceEndType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">End by date</option>
                <option value="count">End after number of occurrences</option>
              </select>
            </div>

            {recurrenceEndType === "date" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {recurrenceEndType === "count" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Occurrences
                </label>
                <input
                  type="number"
                  value={recurrenceCount}
                  onChange={(e) =>
                    setRecurrenceCount(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max="100"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Conflict Detection Results */}
        {isCheckingConflicts && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm text-blue-600">
              Checking for conflicts...
            </div>
          </div>
        )}

        {hasConflicts && conflicts.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-sm font-medium text-yellow-800 mb-2">
              Scheduling Conflicts Detected ({conflicts.length})
            </div>
            <div className="space-y-2 mb-3">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div
                  key={index}
                  className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded"
                >
                  <div className="font-medium">
                    {conflict.existingBlock.title}
                  </div>
                  <div>
                    {format(
                      new Date(conflict.existingBlock.startDate),
                      "MMM d, h:mm a",
                    )}{" "}
                    -
                    {format(new Date(conflict.existingBlock.endDate), "h:mm a")}
                  </div>
                  <div className="capitalize">
                    Status: {conflict.existingBlock.status}
                  </div>
                </div>
              ))}
              {conflicts.length > 3 && (
                <div className="text-xs text-yellow-600">
                  ...and {conflicts.length - 3} more conflicts
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-800">
                Resolution Strategy
              </label>
              <select
                value={mergeStrategy || ""}
                onChange={(e) =>
                  setMergeStrategy(
                    e.target.value as "merge" | "override" | undefined,
                  )
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Choose resolution...</option>
                <option value="merge">Merge with existing blocks</option>
                <option value="override">Override existing blocks</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCheckingConflicts || (hasConflicts && !mergeStrategy)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCheckingConflicts ? "Checking..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
