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

    // Service worker registration removed - handled by ServiceWorkerRegistration component
    
    // Replit iframe compatibility
    if (window.location.hostname.includes('replit')) {
      console.log('Replit iframe compatibility enabled');
      
      // Force iframe-friendly behavior
      if (window.parent !== window) {
        console.log('Running in iframe context');
        // Remove any frame-busting code
        try {
          Object.defineProperty(window, 'top', {
            get: function() { return window; }
          });
        } catch (e) {}
      }
      
      const event = new CustomEvent('replit-hydration-complete');
      window.dispatchEvent(event);
    }
  }, []);

  return null; // This component doesn't render anything
}