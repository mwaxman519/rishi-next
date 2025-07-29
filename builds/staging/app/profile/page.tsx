"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Extend the formData with fields that are not yet in the User type
  // These will be implemented in a future update
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      // Initialize form with user data
      // For now, we're only setting the full_name that exists in the User type
      // The other fields will be implemented in a future update
      setFormData({
        fullName: user.fullName || "",
        email: "", // Will be implemented in future
        phone: "", // Will be implemented in future
        bio: "", // Will be implemented in future
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

    alert("Profile update feature will be implemented in a future update");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <div className="flex space-x-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Your Profile
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.username || "N/A"}
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.fullName || "Not provided"}
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.role || "N/A"}
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.id || "N/A"}
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded md:col-span-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Status
                </h3>
                <p className="text-gray-900 dark:text-white">
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
