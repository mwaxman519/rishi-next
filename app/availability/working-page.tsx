&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;

export default function WorkingAvailabilityPage() {
  const { user, loading: authLoading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  // Wait until auth is finished loading
  useEffect(() => {
    if (!authLoading) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (authLoading || !isLoaded) {
    return (
      <div className=&quot;p-6 flex justify-center items-center h-64&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500&quot;></div>
        <span className=&quot;ml-3 text-gray-600&quot;>Loading availability page...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className=&quot;p-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-6&quot;>Availability Management</h1>
        <div className=&quot;bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded&quot;>
          <div className=&quot;flex&quot;>
            <div className=&quot;flex-shrink-0&quot;>
              <svg
                className=&quot;h-5 w-5 text-yellow-400&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
                viewBox=&quot;0 0 20 20&quot;
                fill=&quot;currentColor&quot;
              >
                <path
                  fillRule=&quot;evenodd&quot;
                  d=&quot;M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z&quot;
                  clipRule=&quot;evenodd&quot;
                />
              </svg>
            </div>
            <div className=&quot;ml-3&quot;>
              <p className=&quot;text-sm text-yellow-700&quot;>
                Please sign in to view and manage your availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;p-6&quot;>
      <h1 className=&quot;text-2xl font-bold mb-6&quot;>Availability Management</h1>

      <div className=&quot;bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6&quot;>
        <div className=&quot;flex&quot;>
          <div className=&quot;flex-shrink-0&quot;>
            <svg
              className=&quot;h-5 w-5 text-blue-400&quot;
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
          </div>
          <div className=&quot;ml-3&quot;>
            <p className=&quot;text-sm text-blue-700&quot;>
              We're experiencing some technical issues with the calendar
              component. Our team is working to resolve this as quickly as
              possible.
            </p>
          </div>
        </div>
      </div>

      <div className=&quot;bg-white dark:bg-gray-800 shadow rounded-lg p-6&quot;>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Your Availability</h2>
        <p className=&quot;mb-4&quot;>
          While we fix the calendar, here&apos;s a list of your current availability
          blocks.
        </p>

        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6&quot;>
          <div className=&quot;border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow&quot;>
            <div className=&quot;flex justify-between items-start&quot;>
              <div>
                <h3 className=&quot;font-medium&quot;>Regular Shift</h3>
                <p className=&quot;text-sm text-gray-500 dark:text-gray-400 mt-1&quot;>
                  Mon-Fri • 9:00 AM - 5:00 PM
                </p>
              </div>
              <span className=&quot;px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full&quot;>
                Available
              </span>
            </div>
          </div>

          <div className=&quot;border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow&quot;>
            <div className=&quot;flex justify-between items-start&quot;>
              <div>
                <h3 className=&quot;font-medium&quot;>Lunch Break</h3>
                <p className=&quot;text-sm text-gray-500 dark:text-gray-400 mt-1&quot;>
                  Mon-Fri • 12:00 PM - 1:00 PM
                </p>
              </div>
              <span className=&quot;px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full&quot;>
                Unavailable
              </span>
            </div>
          </div>

          <div className=&quot;border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow&quot;>
            <div className=&quot;flex justify-between items-start&quot;>
              <div>
                <h3 className=&quot;font-medium&quot;>Weekend Availability</h3>
                <p className=&quot;text-sm text-gray-500 dark:text-gray-400 mt-1&quot;>
                  Sat-Sun • 10:00 AM - 4:00 PM
                </p>
              </div>
              <span className=&quot;px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full&quot;>
                Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
