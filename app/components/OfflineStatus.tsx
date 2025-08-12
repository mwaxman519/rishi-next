/**
 * Temporary stub to prevent hydration errors
 * This file exists solely to prevent import errors during the transition
 * The actual functionality has been moved to SidebarConnectionIndicator
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react'; // Assuming these are available components

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);

    // Check initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything until client hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <>
      {showToast && (
        <div
          className={`fixed top-16 left-4 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Back online' : 'You are offline'}
          </span>
        </div>
      )}
    </>
  );
}