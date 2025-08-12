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
        
        // Mark as Replit iframe for CSS targeting
        document.documentElement.setAttribute('data-replit-iframe', 'true');
        document.body.setAttribute('data-replit-iframe', 'true');
        document.documentElement.classList.add('replit-preview');
        document.body.classList.add('replit-preview');
        
        // Force body and html to be visible in iframe
        document.body.style.visibility = 'visible';
        document.body.style.display = 'block';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.minHeight = '100vh';
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        
        // Ensure the main app container is visible
        const ensureVisibility = () => {
          const containers = [
            document.querySelector('#__next'),
            document.querySelector('main'),
            document.querySelector('.main-content'),
            document.querySelector('[data-testid="app-container"]'),
            document.body.firstElementChild
          ].filter(Boolean);
          
          containers.forEach(container => {
            if (container instanceof HTMLElement) {
              container.style.visibility = 'visible';
              container.style.display = 'flex';
              container.style.flexDirection = 'column';
              container.style.width = '100%';
              container.style.minHeight = '100vh';
              container.style.opacity = '1';
              console.log('Container visibility forced:', container.tagName, container.className);
            }
          });
        };
        
        // Apply visibility fixes immediately and after brief delay
        ensureVisibility();
        setTimeout(ensureVisibility, 100);
        setTimeout(ensureVisibility, 500);
      }
      
      const event = new CustomEvent('replit-hydration-complete');
      window.dispatchEvent(event);
    }
  }, []);

  return null; // This component doesn't render anything
}