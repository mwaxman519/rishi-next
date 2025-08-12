"use client";

import { useEffect } from 'react';

export default function IframeVisibilityFix() {
  useEffect(() => {
    // Only run in Replit iframe context
    if (window.location.hostname.includes('replit') && window.parent !== window) {
      console.log('Applying iframe visibility fixes for Replit preview...');
      
      // Mark as Replit iframe for CSS targeting
      document.documentElement.setAttribute('data-replit-iframe', 'true');
      document.body.setAttribute('data-replit-iframe', 'true');
      document.documentElement.classList.add('replit-preview');
      document.body.classList.add('replit-preview', 'iframe-mode', 'replit-mode');
      
      // Force body and html to be visible in iframe
      const applyStyles = () => {
        // HTML and body
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        document.body.style.visibility = 'visible';
        document.body.style.display = 'block';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Find and force all containers to be visible
        const containers = [
          document.querySelector('#__next'),
          document.querySelector('main'),
          document.querySelector('.main-content'),
          document.querySelector('[data-testid="app-container"]'),
          document.body.firstElementChild
        ].filter(Boolean);
        
        containers.forEach((container, index) => {
          if (container instanceof HTMLElement) {
            container.style.visibility = 'visible';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.width = '100%';
            container.style.minHeight = '100vh';
            container.style.opacity = '1';
            container.style.position = 'relative';
            container.classList.add('iframe-mode');
            
            console.log(`Container ${index} visibility forced:`, {
              tag: container.tagName,
              className: container.className,
              id: container.id
            });
          }
        });
        
        // Special handling for main content in iframe
        const mainContent = document.querySelector('.main-content');
        if (mainContent instanceof HTMLElement) {
          mainContent.style.marginLeft = '0';
          mainContent.style.width = '100%';
          mainContent.style.display = 'flex';
          mainContent.style.flexDirection = 'column';
          mainContent.classList.add('iframe-mode');
          console.log('Main content adjusted for iframe');
        }
        
        // Force any hidden elements to be visible
        document.querySelectorAll('*').forEach(el => {
          if (el instanceof HTMLElement) {
            const computed = window.getComputedStyle(el);
            if (computed.display === 'none' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
              console.log('Found hidden element, making visible:', el.tagName, el.className);
              el.style.display = 'block';
            }
          }
        });
      };
      
      // Apply styles immediately and with delays
      applyStyles();
      setTimeout(applyStyles, 100);
      setTimeout(applyStyles, 500);
      setTimeout(applyStyles, 1000);
      
      // Add mutation observer to catch dynamically added elements
      const observer = new MutationObserver(() => {
        applyStyles();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Cleanup observer on unmount
      return () => observer.disconnect();
    }
  }, []);

  return null;
}