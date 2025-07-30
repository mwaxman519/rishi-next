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
          // Critical endpoints to preload for field workers
          const criticalEndpoints = [
            '/api/auth-service/session',
            '/api/bookings',
            '/api/locations',
            '/api/staff',
            '/api/inventory/kits',
            '/api/user-organization-preferences'
          ];

          const preloadPromises = criticalEndpoints.map(endpoint =>
            fetch(endpoint, { 
              method: 'GET',
              credentials: 'same-origin',
              headers: { 'X-Preload': 'true' }
            }).catch(error => {
              console.log(`Failed to preload ${endpoint}:`, error);
              return null;
            })
          );

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
        title: &quot;Back Online&quot;,
        description: &quot;Refreshing data and syncing changes...&quot;,
      });
    };

    const handleOffline = () => {
      toast({
        title: &quot;Offline Mode&quot;,
        description: &quot;Using cached data. Changes will sync when reconnected.&quot;,
        variant: &quot;destructive&quot;
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Component doesn&apos;t render anything visible - it&apos;s a data management utility
  return null;
}