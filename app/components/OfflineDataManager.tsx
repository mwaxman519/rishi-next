'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function OfflineDataManager() {
  const [isPreloading, setIsPreloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Preload critical data when online for offline use
    const preloadCriticalData = async () => {
      if ('serviceWorker' in navigator && navigator.onLine) {
        setIsPreloading(true);

        try {
          // Preload critical data for offline use
          const preloadPromises = [
            fetch('/api/auth/me').catch(() => null),
            fetch('/api/staff').catch(() => null),
            fetch('/api/locations').catch(() => null),
            fetch('/api/bookings').catch(() => null),
            fetch('/api/inventory/kits').catch(() => null),
            fetch('/api/user-organization-preferences').catch(() => null),
          ];

          await Promise.all(preloadPromises);

          // Notify service worker that preload is complete
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
              registration.active.postMessage({ 
                type: 'PRELOAD_COMPLETE',
                timestamp: Date.now() 
              });
            }
          }

          console.log('Rishi Platform: Critical data preloaded for offline use');

        } catch (error) {
          console.error('Rishi Platform: Preload failed:', error);
        } finally {
          setIsPreloading(false);
        }
      }
    };

    // Preload on component mount and when coming back online
    preloadCriticalData();

    const handleOnline = () => {
      preloadCriticalData();
      toast({
        title: "Back Online",
        description: "Refreshing data and syncing changes...",
      });
    };

    const handleOffline = () => {
      toast({
        title: "Offline Mode",
        description: "Using cached data. Changes will sync when reconnected.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Component doesn't render anything visible - it's a data management utility
  return null;
}