"use client";

/**
 * Navigation Items with React Components
 * This file contains the actual navigation items with their React components
 */
import React from "react";
import { NavItem, NAV_ITEM_TYPES } from "@/shared/navigation-constants";
import { v4 as uuidv4 } from "uuid";

// Import the navigation configuration from shared navigation structure
import {
  superAdminNavigation,
  internalAdminNavigation,
  fieldManagerNavigation,
  brandAgentNavigation,
  clientUserNavigation,
} from "@/shared/navigation-structure";

// Helper function to ensure all navigation items have href property and unique IDs
function processNavigationItems(
  items: NavItem[],
  rolePrefix: string,
): NavItem[] {
  return items.map((item, index) => {
    // Create a new object with all original properties
    const processedItem: NavItem = { ...item };

    // Set href property from path for backward compatibility
    if (item.path && !item.href) {
      processedItem.href = item.path;
    } else if (item.href && !item.path) {
      processedItem.path = item.href;
    }

    // Generate a unique ID that includes role and path information to prevent duplicates
    // Role prefix + path (or label if no path) + random UUID part
    const pathPart =
      processedItem.path || processedItem.href || processedItem.label;
    processedItem.id = `${rolePrefix}-${pathPart}-${uuidv4()}`;

    // Process children recursively if they exist
    if (item.children && item.children.length > 0) {
      processedItem.children = processNavigationItems(
        item.children,
        `${rolePrefix}-${item.label}`,
      );
    }

    return processedItem;
  });
}

// Function to initialize navigation at runtime
export function initializeNavigation() {
  console.log("Navigation initialization starting...");

  // Navigation is now defined directly in shared/navigation-structure.tsx
  console.log(
    "Navigation structure already defined in shared/navigation-structure.tsx",
  );

  // Apply the processNavigationItems function to the existing navigation structures
  // This adds unique IDs and ensures href/path consistency to all navigation items
  console.log("Processing navigation items with unique IDs...");

  // Process each navigation array with its role prefix
  const processedSuperAdmin = processNavigationItems(
    superAdminNavigation,
    "super-admin",
  );
  const processedInternalAdmin = processNavigationItems(
    internalAdminNavigation,
    "internal-admin",
  );
  const processedFieldManager = processNavigationItems(
    fieldManagerNavigation,
    "field-manager",
  );
  const processedBrandAgent = processNavigationItems(
    brandAgentNavigation,
    "brand-agent",
  );
  const processedClientUser = processNavigationItems(
    clientUserNavigation,
    "client-user",
  );

  // Clear the original arrays
  superAdminNavigation.length = 0;
  internalAdminNavigation.length = 0;
  fieldManagerNavigation.length = 0;
  brandAgentNavigation.length = 0;
  clientUserNavigation.length = 0;

  // Add the processed items back
  superAdminNavigation.push(...processedSuperAdmin);
  internalAdminNavigation.push(...processedInternalAdmin);
  fieldManagerNavigation.push(...processedFieldManager);
  brandAgentNavigation.push(...processedBrandAgent);
  clientUserNavigation.push(...processedClientUser);

  console.log("Navigation items processed successfully");
}
