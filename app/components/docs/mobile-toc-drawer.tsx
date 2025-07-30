"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/client-utils";
import { InDocumentToc } from "./in-document-toc";

interface MobileTocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileTocDrawer({ isOpen, onClose }: MobileTocDrawerProps) {
  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("mobile-toc-overlay")) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close drawer when clicking a link
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] mobile-toc-overlay transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Drawer panel */}
      <div
        className={`
        absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-xl shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        max-h-[80vh] overflow-y-auto
      `}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
          <h2 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
            Table of Contents
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Close table of contents"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="p-4">
          <InDocumentToc />
        </div>

        {/* Safe area padding on mobile */}
        <div className="h-8 md:h-0"></div>
      </div>
    </div>
  );
}
