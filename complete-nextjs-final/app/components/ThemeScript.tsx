"use client";

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // Apply theme immediately to prevent flash - client-side only
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // Fallback to light theme if localStorage is not available
      document.documentElement.classList.remove('dark');
    }

    // Register service worker for offline field worker support  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Rishi SW registered for offline field worker support');
          
          // Send message to service worker for initial setup
          if (registration.active) {
            registration.active.postMessage({ type: 'WORKER_READY' });
          }
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker installed, prompt for update
                if (confirm('New offline features available. Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => console.log('Rishi SW registration failed:', error));
    }
    
    // Replit iframe compatibility
    if (window.location.hostname.includes('replit')) {
      console.log('Replit iframe compatibility enabled');
      const event = new CustomEvent('replit-hydration-complete');
      window.dispatchEvent(event);
    }
  }, []);

  return null; // This component doesn't render anything
}