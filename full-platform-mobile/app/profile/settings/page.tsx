"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    twoFactorAuth: false,
    autoLogout: 30,
    language: "english",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setSettings({
      ...settings,
      [name]: newValue,
    });

    // Reset saved state when any setting is changed
    if (saved) setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate saving settings
    setTimeout(() => {
      setSaved(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <div className="flex space-x-2">
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors"
            >
              Back to Profile
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
            User Preferences
          </h2>

          {saved && (
            <div className="mb-6 p-3 bg-green-100 text-green-800 rounded">
              Settings saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                  Account Settings
                </h3>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="twoFactorAuth"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Two-factor Authentication
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onChange={handleChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      onClick={() =>
                        setSettings({
                          ...settings,
                          twoFactorAuth: !settings.twoFactorAuth,
                        })
                      }
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                        settings.twoFactorAuth
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.twoFactorAuth ? "left-7" : "left-1"
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="autoLogout"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Auto Logout (minutes)
                  </label>
                  <select
                    id="autoLogout"
                    name="autoLogout"
                    value={settings.autoLogout}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>

              {/* Appearance & Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                  Appearance & Notifications
                </h3>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="darkMode"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Dark Mode
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="darkMode"
                      name="darkMode"
                      checked={settings.darkMode}
                      onChange={handleChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      onClick={() =>
                        setSettings({
                          ...settings,
                          darkMode: !settings.darkMode,
                        })
                      }
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                        settings.darkMode
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.darkMode ? "left-7" : "left-1"
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="notifications"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    In-app Notifications
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="notifications"
                      name="notifications"
                      checked={settings.notifications}
                      onChange={handleChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      onClick={() =>
                        setSettings({
                          ...settings,
                          notifications: !settings.notifications,
                        })
                      }
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                        settings.notifications
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.notifications ? "left-7" : "left-1"
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="emailUpdates"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email Updates
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="emailUpdates"
                      name="emailUpdates"
                      checked={settings.emailUpdates}
                      onChange={handleChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span
                      onClick={() =>
                        setSettings({
                          ...settings,
                          emailUpdates: !settings.emailUpdates,
                        })
                      }
                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                        settings.emailUpdates
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.emailUpdates ? "left-7" : "left-1"
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Advanced Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              These settings are placeholders for future functionality. They
              will be implemented in a future update.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  alert(
                    "Change Password feature will be implemented in a future update",
                  )
                }
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() =>
                  alert(
                    "Export Data feature will be implemented in a future update",
                  )
                }
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
