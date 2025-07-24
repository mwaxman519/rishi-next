"use client";

import React, { useEffect, useState } from "react";
import { initializeNavigation } from "./NavigationItems";
import {
  superAdminNavigation,
  fieldManagerNavigation,
} from "@shared/navigation-structure";

interface NavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Navigation Provider Component
 * This component initializes the navigation structure when the app loads
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize navigation structure on client-side only
    if (!initialized) {
      try {
        console.log("Initializing navigation structure...");
        initializeNavigation();
        console.log(
          "Navigation initialized successfully:",
          "Super Admin Navigation Items:",
          superAdminNavigation.length,
          "Field Manager Navigation Items:",
          fieldManagerNavigation.length,
        );

        // Inspect some items for debugging
        if (superAdminNavigation && superAdminNavigation.length > 0) {
          console.log(
            "First Super Admin item:",
            superAdminNavigation[0]?.label || "No label",
          );
        }
        if (fieldManagerNavigation && fieldManagerNavigation.length > 0) {
          console.log(
            "First Field Manager item:",
            fieldManagerNavigation[0]?.label || "No label",
          );
        }
      } catch (error) {
        console.error("Error initializing navigation:", error);
      }
      setInitialized(true);
    }
  }, [initialized]);

  return <>{children}</>;
}
