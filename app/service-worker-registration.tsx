'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Temporarily disable service worker to fix fetch issues
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
          console.log('[PWA] Service Worker unregistered:', registration.scope);
        }
      });
      
      return; // Exit early, don't register new SW
      
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('[PWA] New content available, refresh to update');
                  
                  // Optionally show update notification to user
                  if (window.confirm('New version available! Refresh to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
      
      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      
      // Set up offline/online listeners
      window.addEventListener('online', () => {
        console.log('[PWA] Back online');
        // Trigger sync if needed
        if ('sync' in navigator.serviceWorker.registration) {
          navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('sync-offline-requests');
          });
        }
      });
      
      window.addEventListener('offline', () => {
        console.log('[PWA] Gone offline');
      });
    }
  }, []);
  
  return null;
}

export default ServiceWorkerRegistration;