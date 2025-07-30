&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import { X } from &quot;lucide-react&quot;;
import { cn } from &quot;@/components/../lib/client-utils&quot;;
import { InDocumentToc } from &quot;./in-document-toc&quot;;

interface MobileTocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileTocDrawer({ isOpen, onClose }: MobileTocDrawerProps) {
  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(&quot;mobile-toc-overlay&quot;)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener(&quot;click&quot;, handleClickOutside);
    }

    return () => {
      document.removeEventListener(&quot;click&quot;, handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close drawer when clicking a link
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] mobile-toc-overlay transition-opacity duration-300 ${
        isOpen ? &quot;opacity-100&quot; : &quot;opacity-0 pointer-events-none&quot;
      }`}
    >
      <div className=&quot;absolute inset-0 bg-black/50&quot;></div>

      {/* Drawer panel */}
      <div
        className={`
        absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-xl shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? &quot;translate-y-0&quot; : &quot;translate-y-full&quot;}
        max-h-[80vh] overflow-y-auto
      `}
      >
        {/* Drawer header */}
        <div className=&quot;sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm&quot;>
          <h2 className=&quot;text-lg font-medium bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent&quot;>
            Table of Contents
          </h2>
          <button
            onClick={onClose}
            className=&quot;p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400&quot;
            aria-label=&quot;Close table of contents&quot;
          >
            <X className=&quot;h-5 w-5&quot; />
          </button>
        </div>

        {/* Drawer content */}
        <div className=&quot;p-4&quot;>
          <InDocumentToc />
        </div>

        {/* Safe area padding on mobile */}
        <div className=&quot;h-8 md:h-0&quot;></div>
      </div>
    </div>
  );
}
