/**
 * Unified Navigation Structure
 * This file defines the core navigation structure for all user roles
 * following information architecture best practices.
 */
import { ReactNode } from "react";
import { NavItem, NAV_ITEM_TYPES } from "./navigation-constants";

// Create navigation arrays
export const superAdminNavigation: NavItem[] = [];
export const internalAdminNavigation: NavItem[] = [];
export const fieldManagerNavigation: NavItem[] = [];
export const brandAgentNavigation: NavItem[] = [];
export const clientUserNavigation: NavItem[] = [];

/**
 * Function to get navigation structure based on user role
 */
export function getNavigationForRole(role: string): NavItem[] {
  switch (role) {
    case "super_admin":
      return superAdminNavigation;
    case "internal_admin":
      return internalAdminNavigation;
    case "internal_field_manager":
      return fieldManagerNavigation;
    case "brand_agent":
      return brandAgentNavigation;
    case "client_user":
    case "client_manager":
      return clientUserNavigation;
    default:
      return fieldManagerNavigation; // Default to field manager view
  }
}

/**
 * Function to get Platform Administration navigation section
 */
export function getPlatformAdminNav(): NavItem[] {
  return superAdminNavigation.filter(
    (item) => item.label === "Platform Administration",
  );
}

// No need to re-export these as they're already exported above
