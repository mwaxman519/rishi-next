"use client";

import React, { useState, useEffect } from "react";
import { AvailabilityDTO } from "@/models/availability";
import { format, parse } from "date-fns";

interface EditAvailabilityFormProps {
  availabilityBlock: AvailabilityDTO;
  onSuccess: () => void;
  onCancel: () => void;
}

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function EditAvailabilityForm({
  availabilityBlock,
  onSuccess,
  onCancel,
}: EditAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format dates for form fields
  const startDate = new Date(availabilityBlock.startDate);
  const endDate = new Date(availabilityBlock.endDate);

  const [formValues, setFormValues] = useState({
    title: availabilityBlock.title || null,
    status: availabilityBlock.status || null,
    date: format(startDate, "yyyy-MM-dd"),
    startTime: format(startDate, "HH:mm"),
    endTime: format(endDate, "HH:mm"),
    isRecurring: availabilityBlock.isRecurring || false,
    dayOfWeek:
      availabilityBlock.dayOfWeek !== undefined
        ? availabilityBlock.dayOfWeek
        : startDate.getDay(),
    recurrencePattern: availabilityBlock.recurrencePattern || null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormValues({
        ...formValues,
        [name]: checkbox.checked,
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse the form values back into a date
      const dateObj = parse(formValues.date, "yyyy-MM-dd", new Date());
      const [startHours, startMinutes] = formValues.startTime.split(":");
      const [endHours, endMinutes] = formValues.endTime.split(":");

      const startDate = new Date(dateObj);
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDate = new Date(dateObj);
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      // Check if end time is before start time
      if (endDate < startDate) {
        throw new Error("End time must be after start time");
      }

      // Check for conflicts with other availability blocks
      const conflictsResponse = await fetch("/api/availability/conflicts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: availabilityBlock.userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          excludeBlockId: availabilityBlock.id,
        }),
      });

      if (!conflictsResponse.ok) {
        throw new Error("Failed to check for availability conflicts");
      }

      const conflictsData = await conflictsResponse.json();

      // If there are conflicts, alert the user and ask for confirmation
      if (conflictsData.hasConflicts && conflictsData.conflicts?.length > 0) {
        const conflictCount = conflictsData.conflicts.length;
        const conflictMessage = `This availability block conflicts with ${conflictCount} existing block${
          conflictCount > 1 ? "s" : ""
        }. Do you still want to update it?`;

        if (!window.confirm(conflictMessage)) {
          // User canceled due to conflicts
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for API
      const updateData = {
        title: formValues.title,
        status: formValues.status,
        startDate: startDate.toISOString(),
        start_date: startDate.toISOString(),
        endDate: endDate.toISOString(),
        end_date: endDate.toISOString(),
        isRecurring: formValues.isRecurring,
        is_recurring: formValues.isRecurring,
        recurring: formValues.isRecurring,
        dayOfWeek: formValues.isRecurring
          ? parseInt(formValues.dayOfWeek.toString())
          : undefined,
        day_of_week: formValues.isRecurring
          ? parseInt(formValues.dayOfWeek.toString())
          : undefined,
        recurrencePattern: formValues.isRecurring
          ? formValues.recurrencePattern
          : undefined,
        recurrence_pattern: formValues.isRecurring
          ? formValues.recurrencePattern
          : undefined,
      };

      // Send update request
      const response = await fetch(
        `/api/availability/${availabilityBlock.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "No error details available",
        );
      }

      // Handle success
      onSuccess();
    } catch (err) {
      console.error("Error updating availability:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Edit Availability Block</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (Optional)
          </label>
          <input
            type="text"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formValues.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={formValues.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={formValues.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formValues.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isRecurring"
            className="ml-2 block text-sm text-gray-700"
          >
            Recurring
          </label>
        </div>

        {formValues.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week
            </label>
            <select
              name="dayOfWeek"
              value={formValues.dayOfWeek}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required={formValues.isRecurring}
            >
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formValues.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="tentative">Tentative</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
