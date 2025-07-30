&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

interface AgentAvailabilitySettingsProps {
  userId: number;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

type DayName =
  | &quot;monday&quot;
  | &quot;tuesday&quot;
  | &quot;wednesday&quot;
  | &quot;thursday&quot;
  | &quot;friday&quot;
  | &quot;saturday&quot;
  | &quot;sunday&quot;;

interface WorkingHoursSettings {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  bufferBetweenSessions: number; // in minutes
  defaultSessionDuration: number; // in minutes
  maxSessionsPerDay: number;
  [key: string]: DaySchedule | number; // Index signature to allow day access by string
}

const DEFAULT_SETTINGS: WorkingHoursSettings = {
  monday: { enabled: true, startTime: &quot;09:00&quot;, endTime: &quot;17:00&quot; },
  tuesday: { enabled: true, startTime: &quot;09:00&quot;, endTime: &quot;17:00&quot; },
  wednesday: { enabled: true, startTime: &quot;09:00&quot;, endTime: &quot;17:00&quot; },
  thursday: { enabled: true, startTime: &quot;09:00&quot;, endTime: &quot;17:00&quot; },
  friday: { enabled: true, startTime: &quot;09:00&quot;, endTime: &quot;17:00&quot; },
  saturday: { enabled: false, startTime: &quot;10:00&quot;, endTime: &quot;15:00&quot; },
  sunday: { enabled: false, startTime: &quot;10:00&quot;, endTime: &quot;15:00&quot; },
  bufferBetweenSessions: 15,
  defaultSessionDuration: 60,
  maxSessionsPerDay: 8,
};

export default function AgentAvailabilitySettings({
  userId,
}: AgentAvailabilitySettingsProps) {
  const router = useRouter();
  const [settings, setSettings] =
    useState<WorkingHoursSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would fetch from an API endpoint
        // For now, we'll use local storage to simulate persistence
        const savedSettings = localStorage.getItem(
          `user_${userId}_availability_settings`,
        );

        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        console.error(&quot;Error fetching availability settings:&quot;, err);
        setError(
          &quot;Failed to load your availability settings. Please try again.&quot;,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  // Track changes to enable/disable the save button
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const handleDayChange = (
    day: DayName,
    field: keyof DaySchedule,
    value: any,
  ) => {
    setSettings((prev) => {
      const daySettings = prev[day];
      return {
        ...prev,
        [day]: {
          ...daySettings,
          [field]: field === &quot;enabled&quot; ? value.target.checked : value,
        },
      };
    });
  };

  const handleBufferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setSettings((prev) => ({
        ...prev,
        bufferBetweenSessions: value,
      }));
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSettings((prev) => ({
        ...prev,
        defaultSessionDuration: value,
      }));
    }
  };

  const handleMaxSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSettings((prev) => ({
        ...prev,
        maxSessionsPerDay: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // In a real implementation, we would POST to an API endpoint
      // For now, we'll use local storage to simulate persistence
      localStorage.setItem(
        `user_${userId}_availability_settings`,
        JSON.stringify(settings),
      );

      // Add a delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccessMessage(&quot;Your availability settings have been saved.&quot;);
      setHasChanges(false);
    } catch (err) {
      console.error(&quot;Error saving availability settings:&quot;, err);
      setError(&quot;Failed to save your availability settings. Please try again.&quot;);
    } finally {
      setIsSaving(false);
    }
  };

  const renderDaySettings = (day: DayName, label: string) => {
    const daySchedule = settings[day];

    return (
      <div className=&quot;mb-6 pb-4 border-b border-gray-200 last:border-0&quot;>
        <div className=&quot;flex justify-between items-center mb-2&quot;>
          <div className=&quot;flex items-center&quot;>
            <input
              type=&quot;checkbox&quot;
              id={`${day}-enabled`}
              checked={daySchedule.enabled}
              onChange={(e) => handleDayChange(day, &quot;enabled&quot;, e)}
              className=&quot;h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded&quot;
            />
            <label
              htmlFor={`${day}-enabled`}
              className=&quot;ml-2 block text-sm font-medium text-gray-700&quot;
            >
              {label}
            </label>
          </div>
          <div className=&quot;text-xs text-gray-500&quot;>
            {daySchedule.enabled ? &quot;Available&quot; : &quot;Unavailable&quot;}
          </div>
        </div>

        {daySchedule.enabled && (
          <div className=&quot;mt-3 grid grid-cols-2 gap-4&quot;>
            <div>
              <label
                htmlFor={`${day}-start`}
                className=&quot;block text-xs font-medium text-gray-700&quot;
              >
                Start Time
              </label>
              <input
                type=&quot;time&quot;
                id={`${day}-start`}
                value={daySchedule.startTime}
                onChange={(e) =>
                  handleDayChange(day, &quot;startTime&quot;, e.target.value)
                }
                className=&quot;mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm&quot;
              />
            </div>
            <div>
              <label
                htmlFor={`${day}-end`}
                className=&quot;block text-xs font-medium text-gray-700&quot;
              >
                End Time
              </label>
              <input
                type=&quot;time&quot;
                id={`${day}-end`}
                value={daySchedule.endTime}
                onChange={(e) =>
                  handleDayChange(day, &quot;endTime&quot;, e.target.value)
                }
                className=&quot;mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm&quot;
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className=&quot;flex justify-center py-12&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500&quot;></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className=&quot;mb-4 bg-red-50 border-l-4 border-red-400 p-4&quot;>
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
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className=&quot;mb-4 bg-green-50 border-l-4 border-green-400 p-4&quot;>
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
              <p className=&quot;text-sm text-green-700&quot;>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-8&quot;>
        <div>
          <h3 className=&quot;text-lg font-medium text-gray-900 mb-4&quot;>
            Weekly Schedule
          </h3>
          <div className=&quot;bg-gray-50 p-4 rounded-lg border border-gray-200&quot;>
            {renderDaySettings(&quot;monday&quot; as DayName, &quot;Monday&quot;)}
            {renderDaySettings(&quot;tuesday&quot; as DayName, &quot;Tuesday&quot;)}
            {renderDaySettings(&quot;wednesday&quot; as DayName, &quot;Wednesday&quot;)}
            {renderDaySettings(&quot;thursday&quot; as DayName, &quot;Thursday&quot;)}
            {renderDaySettings(&quot;friday&quot; as DayName, &quot;Friday&quot;)}
            {renderDaySettings(&quot;saturday&quot; as DayName, &quot;Saturday&quot;)}
            {renderDaySettings(&quot;sunday&quot; as DayName, &quot;Sunday&quot;)}
          </div>
        </div>

        <div>
          <h3 className=&quot;text-lg font-medium text-gray-900 mb-4&quot;>
            Session Settings
          </h3>
          <div className=&quot;bg-gray-50 p-4 rounded-lg border border-gray-200&quot;>
            <div className=&quot;mb-4&quot;>
              <label
                htmlFor=&quot;bufferTime&quot;
                className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;
              >
                Buffer Between Sessions (minutes)
              </label>
              <input
                type=&quot;number&quot;
                id=&quot;bufferTime&quot;
                min=&quot;0&quot;
                value={settings.bufferBetweenSessions}
                onChange={handleBufferChange}
                className=&quot;w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm&quot;
              />
              <p className=&quot;mt-1 text-xs text-gray-500&quot;>
                Time needed between appointments for preparation or rest.
              </p>
            </div>

            <div className=&quot;mb-4&quot;>
              <label
                htmlFor=&quot;sessionDuration&quot;
                className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;
              >
                Default Session Duration (minutes)
              </label>
              <input
                type=&quot;number&quot;
                id=&quot;sessionDuration&quot;
                min=&quot;15&quot;
                step=&quot;15&quot;
                value={settings.defaultSessionDuration}
                onChange={handleDurationChange}
                className=&quot;w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm&quot;
              />
              <p className=&quot;mt-1 text-xs text-gray-500&quot;>
                Standard length for your sessions. Clients can request different
                durations.
              </p>
            </div>

            <div className=&quot;mb-4&quot;>
              <label
                htmlFor=&quot;maxSessions&quot;
                className=&quot;block text-sm font-medium text-gray-700 mb-1&quot;
              >
                Maximum Sessions Per Day
              </label>
              <input
                type=&quot;number&quot;
                id=&quot;maxSessions&quot;
                min=&quot;1&quot;
                value={settings.maxSessionsPerDay}
                onChange={handleMaxSessionsChange}
                className=&quot;w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm&quot;
              />
              <p className=&quot;mt-1 text-xs text-gray-500&quot;>
                Limit the number of sessions you can have in a single day.
              </p>
            </div>

            <div className=&quot;mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200&quot;>
              <h4 className=&quot;text-sm font-medium text-yellow-800 flex items-center&quot;>
                <svg
                  className=&quot;mr-2 h-5 w-5 text-yellow-400&quot;
                  xmlns=&quot;http://www.w3.org/2000/svg&quot;
                  viewBox=&quot;0 0 20 20&quot;
                  fill=&quot;currentColor&quot;
                >
                  <path
                    fillRule=&quot;evenodd&quot;
                    d=&quot;M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z&quot;
                    clipRule=&quot;evenodd&quot;
                  />
                </svg>
                Upcoming Feature
              </h4>
              <p className=&quot;mt-1 text-xs text-yellow-700&quot;>
                Soon, you'll be able to set different availability for specific
                dates, like holidays or personal days off.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=&quot;mt-8 flex justify-end&quot;>
        <button
          type=&quot;button&quot;
          onClick={() => router.push(&quot;/agent/availability&quot;)}
          className=&quot;mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500&quot;
        >
          Cancel
        </button>
        <button
          type=&quot;button&quot;
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
            isSaving || !hasChanges ? &quot;opacity-50 cursor-not-allowed&quot; : "&quot;
          }`}
        >
          {isSaving ? &quot;Saving...&quot; : &quot;Save Settings"}
        </button>
      </div>
    </div>
  );
}
