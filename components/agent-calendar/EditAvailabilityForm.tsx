&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { AvailabilityDTO } from &quot;@/models/availability&quot;;
import { format, parse } from &quot;date-fns&quot;;

interface EditAvailabilityFormProps {
  availabilityBlock: AvailabilityDTO;
  onSuccess: () => void;
  onCancel: () => void;
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
    title: availabilityBlock.title || "&quot;,
    status: availabilityBlock.status || &quot;available&quot;,
    date: format(startDate, &quot;yyyy-MM-dd&quot;),
    startTime: format(startDate, &quot;HH:mm&quot;),
    endTime: format(endDate, &quot;HH:mm&quot;),
    isRecurring: availabilityBlock.isRecurring || false,
    dayOfWeek:
      availabilityBlock.dayOfWeek !== undefined
        ? availabilityBlock.dayOfWeek
        : startDate.getDay(),
    recurrencePattern: availabilityBlock.recurrencePattern || &quot;weekly&quot;,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === &quot;checkbox&quot;) {
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
      const dateObj = parse(formValues.date, &quot;yyyy-MM-dd&quot;, new Date());
      const [startHours, startMinutes] = formValues.startTime.split(&quot;:&quot;);
      const [endHours, endMinutes] = formValues.endTime.split(&quot;:&quot;);

      const startDate = new Date(dateObj);
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDate = new Date(dateObj);
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      // Check if end time is before start time
      if (endDate < startDate) {
        throw new Error(&quot;End time must be after start time&quot;);
      }

      // Check for conflicts with other availability blocks
      const conflictsResponse = await fetch(&quot;/api/availability/conflicts&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          userId: availabilityBlock.userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          excludeBlockId: availabilityBlock.id,
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
          method: &quot;PUT&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || &quot;Failed to update availability block&quot;,
        );
      }

      // Handle success
      onSuccess();
    } catch (err) {
      console.error(&quot;Error updating availability:&quot;, err);
      setError(err instanceof Error ? err.message : &quot;An error occurred&quot;);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=&quot;bg-white rounded-lg shadow p-6&quot;>
      <div className=&quot;flex justify-between items-center mb-4&quot;>
        <h3 className=&quot;text-lg font-bold&quot;>Edit Availability Block</h3>
        <button
          onClick={onCancel}
          className=&quot;text-gray-500 hover:text-gray-700&quot;
          aria-label=&quot;Close&quot;
        >
          <svg
            xmlns=&quot;http://www.w3.org/2000/svg&quot;
            className=&quot;h-5 w-5&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className=&quot;bg-red-100 text-red-800 p-3 rounded mb-4&quot;>{error}</div>
      )}

      <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
        <div>
          <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
            Title (Optional)
          </label>
          <input
            type=&quot;text&quot;
            name=&quot;title&quot;
            value={formValues.title}
            onChange={handleChange}
            className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
          />
        </div>

        <div>
          <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
            Date
          </label>
          <input
            type=&quot;date&quot;
            name=&quot;date&quot;
            value={formValues.date}
            onChange={handleChange}
            className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
            required
          />
        </div>

        <div className=&quot;grid grid-cols-2 gap-4&quot;>
          <div>
            <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
              Start Time
            </label>
            <input
              type=&quot;time&quot;
              name=&quot;startTime&quot;
              value={formValues.startTime}
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
              name=&quot;endTime&quot;
              value={formValues.endTime}
              onChange={handleChange}
              className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
              required
            />
          </div>
        </div>

        <div className=&quot;flex items-center&quot;>
          <input
            type=&quot;checkbox&quot;
            id=&quot;isRecurring&quot;
            name=&quot;isRecurring&quot;
            checked={formValues.isRecurring}
            onChange={handleChange}
            className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded&quot;
          />
          <label
            htmlFor=&quot;isRecurring&quot;
            className=&quot;ml-2 block text-sm text-gray-700&quot;
          >
            Recurring
          </label>
        </div>

        {formValues.isRecurring && (
          <div>
            <label className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;>
              Day of Week
            </label>
            <select
              name=&quot;dayOfWeek&quot;
              value={formValues.dayOfWeek}
              onChange={handleChange}
              className=&quot;w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500&quot;
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

        <div className=&quot;flex justify-end space-x-3 pt-4&quot;>
          <button
            type=&quot;button&quot;
            onClick={onCancel}
            className=&quot;px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500&quot;
          >
            Cancel
          </button>
          <button
            type=&quot;submit&quot;
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              isSubmitting ? &quot;opacity-75 cursor-not-allowed&quot; : &quot;&quot;
            }`}
          >
            {isSubmitting ? &quot;Saving...&quot; : &quot;Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
