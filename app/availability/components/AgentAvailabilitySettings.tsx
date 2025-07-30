"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AgentAvailabilitySettingsProps {
  userId: number;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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
  monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  saturday: { enabled: false, startTime: "10:00", endTime: "15:00" },
  sunday: { enabled: false, startTime: "10:00", endTime: &quot;15:00 },
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
        console.error("Error fetching availability settings:", err);
        setError(
          "Failed to load your availability settings. Please try again.",
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
          [field]: field === &quot;enabled ? value.target.checked : value,
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

      setSuccessMessage("Your availability settings have been saved.");
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving availability settings:", err);
      setError("Failed to save your availability settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderDaySettings = (day: DayName, label: string) => {
    const daySchedule = settings[day];

    return (
      <div className="mb-6 pb-4 border-b border-gray-200 last:border-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`${day}-enabled`}
              checked={daySchedule.enabled}
              onChange={(e) => handleDayChange(day, "enabled", e)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`${day}-enabled`}
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          </div>
          <div className="text-xs text-gray-500">
            {daySchedule.enabled ? "Available" : "Unavailable"}
          </div>
        </div>

        {daySchedule.enabled && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${day}-start`}
                className="block text-xs font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
                type="time"
                id={`${day}-start`}
                value={daySchedule.startTime}
                onChange={(e) =>
                  handleDayChange(day, "startTime", e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor={`${day}-end`}
                className="block text-xs font-medium text-gray-700"
              >
                End Time
              </label>
              <input
                type="time"
                id={`${day}-end`}
                value={daySchedule.endTime}
                onChange={(e) =>
                  handleDayChange(day, "endTime", e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Weekly Schedule
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {renderDaySettings("monday" as DayName, "Monday")}
            {renderDaySettings("tuesday" as DayName, "Tuesday")}
            {renderDaySettings("wednesday" as DayName, "Wednesday")}
            {renderDaySettings("thursday" as DayName, "Thursday")}
            {renderDaySettings("friday" as DayName, "Friday")}
            {renderDaySettings("saturday" as DayName, "Saturday")}
            {renderDaySettings("sunday" as DayName, "Sunday")}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Session Settings
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="mb-4">
              <label
                htmlFor="bufferTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Buffer Between Sessions (minutes)
              </label>
              <input
                type="number"
                id="bufferTime"
                min="0"
                value={settings.bufferBetweenSessions}
                onChange={handleBufferChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Time needed between appointments for preparation or rest.
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="sessionDuration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Session Duration (minutes)
              </label>
              <input
                type="number"
                id="sessionDuration"
                min="15"
                step="15"
                value={settings.defaultSessionDuration}
                onChange={handleDurationChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Standard length for your sessions. Clients can request different
                durations.
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="maxSessions"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Maximum Sessions Per Day
              </label>
              <input
                type="number"
                id="maxSessions"
                min="1"
                value={settings.maxSessionsPerDay}
                onChange={handleMaxSessionsChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Limit the number of sessions you can have in a single day.
              </p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Upcoming Feature
              </h4>
              <p className=&quot;mt-1 text-xs text-yellow-700>
                Soon, you'll be able to set different availability for specific
                dates, like holidays or personal days off.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/agent/availability")}
          className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
            isSaving || !hasChanges ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : &quot;Save Settings}
        </button>
      </div>
    </div>
  );
}
