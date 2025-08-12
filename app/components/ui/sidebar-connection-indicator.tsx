'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SidebarConnectionIndicatorProps {
  collapsed?: boolean;
}

export function SidebarConnectionIndicator({ collapsed = false }: SidebarConnectionIndicatorProps) {
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

  // Compact view for collapsed sidebar - just an icon with tooltip
  if (collapsed) {
    if (!isOnline) {
      return (
        <div 
          className="flex justify-center items-center p-2 bg-red-500/20 border border-red-500/30 rounded-md"
          title="Offline Mode"
        >
          <WifiOff className="w-4 h-4 text-red-500" />
        </div>
      );
    }

    if (pendingSync > 0) {
      return (
        <div 
          className="flex justify-center items-center p-2 bg-blue-500/20 border border-blue-500/30 rounded-md"
          title={`Syncing ${pendingSync} items...`}
        >
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      );
    }

    return (
      <div 
        className="flex justify-center items-center p-2 bg-green-500/20 border border-green-500/30 rounded-md"
        title="Online"
      >
        <Wifi className="w-4 h-4 text-green-500" />
      </div>
    );
  }

  // Full view for expanded sidebar
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-md">
        <WifiOff className="w-4 h-4 text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">Offline</span>
          {pendingSync > 0 && (
            <span className="block text-xs text-red-600 dark:text-red-400">
              {pendingSync} pending
            </span>
          )}
        </div>
      </div>
    );
  }

  if (pendingSync > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-md">
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Syncing</span>
          <span className="block text-xs text-blue-600 dark:text-blue-400">
            {pendingSync} items
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-md">
      <Wifi className="w-4 h-4 text-green-500 flex-shrink-0" />
      <span className="text-sm font-medium text-green-700 dark:text-green-300">Online</span>
    </div>
  );
}