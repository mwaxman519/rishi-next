&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;
import Link from &quot;next/link&quot;;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Extend the formData with fields that are not yet in the User type
  // These will be implemented in a future update
  const [formData, setFormData] = useState({
    fullName: "&quot;,
    email: &quot;&quot;,
    phone: &quot;&quot;,
    bio: &quot;&quot;,
  });

  useEffect(() => {
    if (user) {
      // Initialize form with user data
      // For now, we&apos;re only setting the full_name that exists in the User type
      // The other fields will be implemented in a future update
      setFormData({
        fullName: user.fullName || &quot;&quot;,
        email: &quot;&quot;, // Will be implemented in future
        phone: &quot;&quot;, // Will be implemented in future
        bio: &quot;&quot;, // Will be implemented in future
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For now, just toggle edit mode back
    // In a real implementation, this would submit to an API
    setIsEditing(false);

    alert(&quot;Profile update feature will be implemented in a future update&quot;);
  };

  return (
    <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
      <header className=&quot;bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700&quot;>
        <div className=&quot;container mx-auto px-4 py-4 flex justify-between items-center&quot;>
          <h1 className=&quot;text-2xl font-bold text-gray-900 dark:text-white&quot;>
            Profile
          </h1>
          <div className=&quot;flex space-x-2&quot;>
            <Link
              href=&quot;/dashboard&quot;
              className=&quot;px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors&quot;
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className=&quot;container mx-auto px-4 py-8&quot;>
        <div className=&quot;bg-white dark:bg-gray-800 rounded-lg shadow p-6&quot;>
          <div className=&quot;flex justify-between items-center mb-6&quot;>
            <h2 className=&quot;text-xl font-semibold text-gray-800 dark:text-white&quot;>
              Your Profile
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className=&quot;px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors&quot;
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
              <div>
                <label
                  htmlFor=&quot;fullName&quot;
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                >
                  Full Name
                </label>
                <input
                  type=&quot;text&quot;
                  id=&quot;fullName&quot;
                  name=&quot;fullName&quot;
                  value={formData.fullName}
                  onChange={handleChange}
                  className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white&quot;
                />
              </div>

              <div>
                <label
                  htmlFor=&quot;email&quot;
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                >
                  Email
                </label>
                <input
                  type=&quot;email&quot;
                  id=&quot;email&quot;
                  name=&quot;email&quot;
                  value={formData.email}
                  onChange={handleChange}
                  className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white&quot;
                />
              </div>

              <div>
                <label
                  htmlFor=&quot;phone&quot;
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                >
                  Phone
                </label>
                <input
                  type=&quot;tel&quot;
                  id=&quot;phone&quot;
                  name=&quot;phone&quot;
                  value={formData.phone}
                  onChange={handleChange}
                  className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white&quot;
                />
              </div>

              <div>
                <label
                  htmlFor=&quot;bio&quot;
                  className=&quot;block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1&quot;
                >
                  Bio
                </label>
                <textarea
                  id=&quot;bio&quot;
                  name=&quot;bio&quot;
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className=&quot;w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white&quot;
                />
              </div>

              <div className=&quot;flex space-x-3&quot;>
                <button
                  type=&quot;submit&quot;
                  className=&quot;px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors&quot;
                >
                  Save Changes
                </button>
                <button
                  type=&quot;button&quot;
                  onClick={() => setIsEditing(false)}
                  className=&quot;px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors&quot;
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
              <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded&quot;>
                <h3 className=&quot;font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                  Username
                </h3>
                <p className=&quot;text-gray-900 dark:text-white&quot;>
                  {user?.username || &quot;N/A&quot;}
                </p>
              </div>

              <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded&quot;>
                <h3 className=&quot;font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                  Full Name
                </h3>
                <p className=&quot;text-gray-900 dark:text-white&quot;>
                  {user?.fullName || &quot;Not provided&quot;}
                </p>
              </div>

              <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded&quot;>
                <h3 className=&quot;font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                  Role
                </h3>
                <p className=&quot;text-gray-900 dark:text-white&quot;>
                  {user?.role || &quot;N/A&quot;}
                </p>
              </div>

              <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded&quot;>
                <h3 className=&quot;font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                  User ID
                </h3>
                <p className=&quot;text-gray-900 dark:text-white&quot;>
                  {user?.id || &quot;N/A&quot;}
                </p>
              </div>

              <div className=&quot;p-4 border border-gray-200 dark:border-gray-700 rounded md:col-span-2&quot;>
                <h3 className=&quot;font-medium text-gray-700 dark:text-gray-300 mb-2&quot;>
                  Profile Status
                </h3>
                <p className=&quot;text-gray-900 dark:text-white">
                  This is a profile placeholder. In a future update, users will
                  be able to edit their profiles.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
