&quot;use client&quot;;

/**
 * Navigation Items with React Components
 * This file contains the actual navigation items with their React components
 */
import React from &quot;react&quot;;
import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;

// Import the navigation configuration from shared navigation structure
import {
  superAdminNavigation,
  internalAdminNavigation,
  fieldManagerNavigation,
  brandAgentNavigation,
  clientUserNavigation,
} from &quot;@shared/navigation-structure&quot;;

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
  console.log(&quot;Navigation initialization starting...&quot;);

  // Navigation is now defined directly in shared/navigation-structure.tsx
  console.log(
    &quot;Navigation structure already defined in shared/navigation-structure.tsx&quot;,
  );

  // Apply the processNavigationItems function to the existing navigation structures
  // This adds unique IDs and ensures href/path consistency to all navigation items
  console.log(&quot;Processing navigation items with unique IDs...&quot;);

  // Process each navigation array with its role prefix
  const processedSuperAdmin = processNavigationItems(
    superAdminNavigation,
    &quot;super-admin&quot;,
  );
  const processedInternalAdmin = processNavigationItems(
    internalAdminNavigation,
    &quot;internal-admin&quot;,
  );
  const processedFieldManager = processNavigationItems(
    fieldManagerNavigation,
    &quot;field-manager&quot;,
  );
  const processedBrandAgent = processNavigationItems(
    brandAgentNavigation,
    &quot;brand-agent&quot;,
  );
  const processedClientUser = processNavigationItems(
    clientUserNavigation,
    &quot;client-user&quot;,
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

  console.log(&quot;Navigation items processed successfully&quot;);
}
