&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import Link from &quot;next/link&quot;;

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
    language: &quot;english&quot;,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const newValue =
      type === &quot;checkbox&quot; ? (e.target as HTMLInputElement).checked : value;

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
    <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
      <header className=&quot;bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700&quot;>
        <div className=&quot;container mx-auto px-4 py-4 flex justify-between items-center&quot;>
          <h1 className=&quot;text-2xl font-bold text-gray-900 dark:text-white&quot;>
            Account Settings
          </h1>
          <div className=&quot;flex space-x-2&quot;>
            <Link
              href=&quot;/profile&quot;
              className=&quot;px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors&quot;
            >
              Back to Profile
            </Link>
            <Link
              href=&quot;/dashboard&quot;
              className=&quot;px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors&quot;
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className=&quot;container mx-auto px-4 py-8&quot;>
        <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow p-6&quot;>
          <h2 className=&quot;text-xl font-semibold mb-6 text-gray-800 dark:text-white&quot;>
            User Preferences
          </h2>

          {saved && (
            <div className=&quot;mb-6 p-3 bg-green-100 text-green-800 rounded&quot;>
              Settings saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className=&quot;space-y-6&quot;>
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
              {/* Account Section */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2&quot;>
                  Account Settings
                </h3>

                <div className=&quot;flex items-center justify-between&quot;>
                  <label
                    htmlFor=&quot;twoFactorAuth&quot;
                    className=&quot;text-gray-700 dark:text-gray-300&quot;
                  >
                    Two-factor Authentication
                  </label>
                  <div className=&quot;relative inline-block w-12 h-6 transition duration-200 ease-in-out&quot;>
                    <input
                      type=&quot;checkbox&quot;
                      id=&quot;twoFactorAuth&quot;
                      name=&quot;twoFactorAuth&quot;
                      checked={settings.twoFactorAuth}
                      onChange={handleChange}
                      className=&quot;opacity-0 w-0 h-0&quot;
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
                          ? &quot;bg-blue-600&quot;
                          : &quot;bg-gray-300 dark:bg-gray-600&quot;
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.twoFactorAuth ? &quot;left-7&quot; : &quot;left-1&quot;
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor=&quot;autoLogout&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Auto Logout (minutes)
                  </label>
                  <select
                    id=&quot;autoLogout&quot;
                    name=&quot;autoLogout&quot;
                    value={settings.autoLogout}
                    onChange={handleChange}
                    className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white&quot;
                  >
                    <option value=&quot;15&quot;>15 minutes</option>
                    <option value=&quot;30&quot;>30 minutes</option>
                    <option value=&quot;60&quot;>1 hour</option>
                    <option value=&quot;120&quot;>2 hours</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor=&quot;language&quot;
                    className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                  >
                    Language
                  </label>
                  <select
                    id=&quot;language&quot;
                    name=&quot;language&quot;
                    value={settings.language}
                    onChange={handleChange}
                    className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white&quot;
                  >
                    <option value=&quot;english&quot;>English</option>
                    <option value=&quot;spanish&quot;>Spanish</option>
                    <option value=&quot;french&quot;>French</option>
                  </select>
                </div>
              </div>

              {/* Appearance & Notifications */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium text-gray-700 dark:text-gray-300 border-b pb-2&quot;>
                  Appearance & Notifications
                </h3>

                <div className=&quot;flex items-center justify-between&quot;>
                  <label
                    htmlFor=&quot;darkMode&quot;
                    className=&quot;text-gray-700 dark:text-gray-300&quot;
                  >
                    Dark Mode
                  </label>
                  <div className=&quot;relative inline-block w-12 h-6 transition duration-200 ease-in-out&quot;>
                    <input
                      type=&quot;checkbox&quot;
                      id=&quot;darkMode&quot;
                      name=&quot;darkMode&quot;
                      checked={settings.darkMode}
                      onChange={handleChange}
                      className=&quot;opacity-0 w-0 h-0&quot;
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
                          ? &quot;bg-blue-600&quot;
                          : &quot;bg-gray-300 dark:bg-gray-600&quot;
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.darkMode ? &quot;left-7&quot; : &quot;left-1&quot;
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div className=&quot;flex items-center justify-between&quot;>
                  <label
                    htmlFor=&quot;notifications&quot;
                    className=&quot;text-gray-700 dark:text-gray-300&quot;
                  >
                    In-app Notifications
                  </label>
                  <div className=&quot;relative inline-block w-12 h-6 transition duration-200 ease-in-out&quot;>
                    <input
                      type=&quot;checkbox&quot;
                      id=&quot;notifications&quot;
                      name=&quot;notifications&quot;
                      checked={settings.notifications}
                      onChange={handleChange}
                      className=&quot;opacity-0 w-0 h-0&quot;
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
                          ? &quot;bg-blue-600&quot;
                          : &quot;bg-gray-300 dark:bg-gray-600&quot;
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.notifications ? &quot;left-7&quot; : &quot;left-1&quot;
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>

                <div className=&quot;flex items-center justify-between&quot;>
                  <label
                    htmlFor=&quot;emailUpdates&quot;
                    className=&quot;text-gray-700 dark:text-gray-300&quot;
                  >
                    Email Updates
                  </label>
                  <div className=&quot;relative inline-block w-12 h-6 transition duration-200 ease-in-out&quot;>
                    <input
                      type=&quot;checkbox&quot;
                      id=&quot;emailUpdates&quot;
                      name=&quot;emailUpdates&quot;
                      checked={settings.emailUpdates}
                      onChange={handleChange}
                      className=&quot;opacity-0 w-0 h-0&quot;
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
                          ? &quot;bg-blue-600&quot;
                          : &quot;bg-gray-300 dark:bg-gray-600&quot;
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                          settings.emailUpdates ? &quot;left-7&quot; : &quot;left-1&quot;
                        }`}
                      ></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className=&quot;pt-4 border-t border-gray-200 dark:border-gray-700&quot;>
              <div className=&quot;flex justify-end&quot;>
                <button
                  type=&quot;submit&quot;
                  className=&quot;px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors&quot;
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>

          <div className=&quot;mt-8 pt-6 border-t border-gray-200 dark:border-gray-700&quot;>
            <h3 className=&quot;text-lg font-medium text-gray-700 dark:text-gray-300 mb-4&quot;>
              Advanced Settings
            </h3>
            <p className=&quot;text-gray-600 dark:text-gray-400 mb-4&quot;>
              These settings are placeholders for future functionality. They
              will be implemented in a future update.
            </p>
            <div className=&quot;flex space-x-3&quot;>
              <button
                onClick={() =>
                  alert(
                    &quot;Change Password feature will be implemented in a future update&quot;,
                  )
                }
                className=&quot;px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors&quot;
              >
                Change Password
              </button>
              <button
                onClick={() =>
                  alert(
                    &quot;Export Data feature will be implemented in a future update&quot;,
                  )
                }
                className=&quot;px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors&quot;
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
