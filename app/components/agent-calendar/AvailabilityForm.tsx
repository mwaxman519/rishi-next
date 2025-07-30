&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { z } from &quot;zod&quot;;

interface AvailabilityFormProps {
  userId: number;
  onSuccess: () => void;
  className?: string;
}

const daysOfWeek = [
  { value: 0, label: &quot;Sunday&quot; },
  { value: 1, label: &quot;Monday&quot; },
  { value: 2, label: &quot;Tuesday&quot; },
  { value: 3, label: &quot;Wednesday&quot; },
  { value: 4, label: &quot;Thursday&quot; },
  { value: 5, label: &quot;Friday&quot; },
  { value: 6, label: &quot;Saturday&quot; },
];

type FormValues = {
  user_id: number;
  title: string;
  start_date: Date | string;
  end_date: Date | string;
  status: &quot;available&quot; | &quot;unavailable&quot; | &quot;tentative&quot;;
  is_recurring: boolean;
  recurring: boolean;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export default function AvailabilityForm({
  userId,
  onSuccess,
  className = "&quot;,
}: AvailabilityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    user_id: userId,
    title: &quot;Available&quot;,
    start_date: new Date(),
    end_date: new Date(),
    start_time: &quot;09:00&quot;,
    end_time: &quot;17:00&quot;,
    day_of_week: 1, // Monday
    is_recurring: false,
    recurring: true,
    status: &quot;available&quot;,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === &quot;checkbox&quot;) {
      const checkbox = e.target as HTMLInputElement;
      if (name === &quot;recurring&quot;) {
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
    } else if (name === &quot;day_of_week&quot;) {
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
      const [startHours, startMinutes] = formValues.start_time.split(&quot;:&quot;);
      if (startHours && startMinutes) {
        startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
      } else {
        startDate.setHours(9, 0, 0, 0); // Default to 9:00 AM if time is missing
      }

      const endDate = new Date(startDate);
      const [endHours, endMinutes] = formValues.end_time.split(&quot;:&quot;);
      if (endHours && endMinutes) {
        endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      } else {
        endDate.setHours(17, 0, 0, 0); // Default to 5:00 PM if time is missing
      }

      // Check for time conflicts before submitting
      const conflictsResponse = await fetch(&quot;/api/availability/conflicts&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          userId: userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!conflictsResponse.ok) {
        throw new Error(&quot;Failed to check for availability conflicts&quot;);
      }

      const conflictsData = await conflictsResponse.json();

      // If there are conflicts, alert the user and ask for confirmation
      if (conflictsData.hasConflicts && conflictsData.conflicts?.length > 0) {
        const conflictCount = conflictsData.conflicts.length;
        const conflictMessage = `This availability block conflicts with ${conflictCount} existing block${
          conflictCount > 1 ? &quot;s&quot; : &quot;&quot;
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

      const response = await fetch(&quot;/api/availability&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(availabilityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || &quot;No error details available&quot;,
        );
      }

      // Reset form or show success
      onSuccess();
      setFormValues({
        ...formValues,
        start_time: &quot;09:00&quot;,
        end_time: &quot;17:00&quot;,
      });
    } catch (err) {
      console.error(&quot;Error creating availability:&quot;, err);
      setError(err instanceof Error ? err.message : &quot;An error occurred&quot;);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className=&quot;text-lg font-bold mb-4&quot;>Add Availability Block</h3>

      {error && (
        <div className=&quot;bg-red-100 text-red-800 p-3 rounded mb-4&quot;>{error}</div>
      )}

      <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
        <div>
          <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
            Day of Week
          </label>
          <select
            name=&quot;day_of_week&quot;
            value={formValues.day_of_week}
            onChange={handleChange}
            className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
            required
          >
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className=&quot;grid grid-cols-2 gap-4&quot;>
          <div>
            <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
              Start Time
            </label>
            <input
              type=&quot;time&quot;
              name=&quot;start_time&quot;
              value={formValues.start_time}
              onChange={handleChange}
              className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
              required
            />
          </div>
          <div>
            <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
              End Time
            </label>
            <input
              type=&quot;time&quot;
              name=&quot;end_time&quot;
              value={formValues.end_time}
              onChange={handleChange}
              className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
              required
            />
          </div>
        </div>

        <div className=&quot;flex items-center&quot;>
          <input
            type=&quot;checkbox&quot;
            id=&quot;recurring&quot;
            name=&quot;recurring&quot;
            checked={formValues.recurring}
            onChange={handleChange}
            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded&quot;
          />
          <label
            htmlFor=&quot;recurring&quot;
            className=&quot;ml-2 block text-sm text-gray-700&quot;
          >
            Recurring weekly
          </label>
        </div>

        <div>
          <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
            Status
          </label>
          <select
            name=&quot;status&quot;
            value={formValues.status}
            onChange={handleChange}
            className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
            required
          >
            <option value=&quot;available&quot;>Available</option>
            <option value=&quot;unavailable&quot;>Unavailable</option>
            <option value=&quot;tentative&quot;>Tentative</option>
          </select>
        </div>

        <button
          type=&quot;submit&quot;
          disabled={isSubmitting}
          className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
            isSubmitting ? &quot;opacity-75 cursor-not-allowed&quot; : &quot;&quot;
          }`}
        >
          {isSubmitting ? &quot;Saving...&quot; : &quot;Add Availability"}
        </button>
      </form>
    </div>
  );
}
