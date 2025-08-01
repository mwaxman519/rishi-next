'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          // Send message to service worker to sync pending requests
          if (registration.active) {
            registration.active.postMessage({ type: 'SYNC_WHEN_ONLINE' });
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker messages about pending sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'PENDING_SYNC_COUNT') {
          setPendingSync(event.data.count);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Offline Mode</span>
        {pendingSync > 0 && (
          <span className="bg-red-600 text-xs px-2 py-1 rounded-full">
            {pendingSync} pending
          </span>
        )}
      </div>
    );
  }

  if (pendingSync > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Syncing {pendingSync} items...</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 opacity-75">
      <Wifi className="w-4 h-4" />
      <span className="text-sm font-medium">Online</span>
    </div>
  );
}