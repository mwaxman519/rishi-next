"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

interface AvailabilityFormProps {
  userId: number;
  onSuccess: () => void;
  className?: string;
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

type FormValues = {
  user_id: number;
  title: string;
  start_date: Date | string;
  end_date: Date | string;
  status: "available" | "unavailable" | "tentative";
  is_recurring: boolean;
  recurring: boolean;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export default function AvailabilityForm({
  userId,
  onSuccess,
  className = "",
}: AvailabilityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    user_id: userId,
    title: "Available",
    start_date: new Date(),
    end_date: new Date(),
    start_time: "09:00",
    end_time: "17:00",
    day_of_week: 1, // Monday
    is_recurring: false,
    recurring: true,
    status: "available",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "recurring") {
        setFormValues({
          ...formValues,
          recurring: checkbox.checked,
          is_recurring: checkbox.checked, // Keep both in sync
        });
      } else {
        setFormValues({
          ...formValues,
          [name]: checkbox.checked,
        });
      }
    } else if (name === "day_of_week") {
      setFormValues({
        ...formValues,
        [name]: value ? parseInt(value) : 1, // Default to Monday if value is undefined
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
      // Calculate the proper start and end dates based on the selected day of week
      const today = new Date();
      const currentDay = today.getDay();
      const selectedDay = formValues.day_of_week;

      // Calculate days to add to get to the selected day
      const daysToAdd = (selectedDay - currentDay + 7) % 7;

      const startDate = new Date(today);
      startDate.setDate(today.getDate() + daysToAdd);

      // Set the time from the form
      const [startHours, startMinutes] = formValues.start_time.split(":");
      if (startHours && startMinutes) {
        startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
      } else {
        startDate.setHours(9, 0, 0, 0); // Default to 9:00 AM if time is missing
      }

      const endDate = new Date(startDate);
      const [endHours, endMinutes] = formValues.end_time.split(":");
      if (endHours && endMinutes) {
        endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      } else {
        endDate.setHours(17, 0, 0, 0); // Default to 5:00 PM if time is missing
      }

      // Check for time conflicts before submitting
      const conflictsResponse = await fetch("/api/availability/conflicts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
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
        }. Do you still want to create it?`;

        if (!window.confirm(conflictMessage)) {
          // User canceled due to conflicts
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for API
      const availabilityData = {
        ...formValues,
        start_date: startDate.toISOString(),
        startDate: startDate.toISOString(),
        end_date: endDate.toISOString(),
        endDate: endDate.toISOString(),
        user_id: userId,
        userId: userId,
      };

      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availabilityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create availability block",
        );
      }

      // Reset form or show success
      onSuccess();
      setFormValues({
        ...formValues,
        start_time: "09:00",
        end_time: "17:00",
      });
    } catch (err) {
      console.error("Error creating availability:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4">Add Availability Block</h3>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week
          </label>
          <select
            name="day_of_week"
            value={formValues.day_of_week}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            required
          >
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              value={formValues.start_time}
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
              name="end_time"
              value={formValues.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="recurring"
            name="recurring"
            checked={formValues.recurring}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label
            htmlFor="recurring"
            className="ml-2 block text-sm text-gray-700"
          >
            Recurring weekly
          </label>
        </div>

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

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Saving..." : "Add Availability"}
        </button>
      </form>
    </div>
  );
}
