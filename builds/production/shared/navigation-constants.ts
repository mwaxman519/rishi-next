/**
 * Navigation constants for the Rishi application
 * This file defines the navigation structure and types used across the application
 */
import { ReactNode } from "react";

/**
 * Navigation item types - used to categorize navigation items
 */
export enum NAV_ITEM_TYPES {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  UTILITY = "utility",
  MOBILE = "mobile",
  FOOTER = "footer",
  SECTION = "section",
  LINK = "link",
}

/**
 * Navigation item priority - used to sort navigation items
 */
export type NavItemPriority = "high" | "medium" | "low";

/**
 * NavItem interface - represents a navigation item in the application
 */
export interface NavItem {
  label: string;
  path?: string;
  href?: string;
  icon?: string | ReactNode;
  type: NAV_ITEM_TYPES;
  permission?: string | null;
  priority?: NavItemPriority;
  children?: NavItem[];
  id?: string; // Unique identifier for React key prop
}

/**
 * Core Navigation Constants
 * These represent the primary navigation sections of the application
 */
export const CORE_NAV_SECTIONS = {
  DASHBOARD: "dashboard",
  AVAILABILITY: "availability",
  SCHEDULE: "schedule",
  EVENTS: "events",
  REQUESTS: "requests",
  PROFILE: "profile",
  DOCUMENTATION: "documentation",
  ADMIN: "admin",
};

/**
 * Role-Based Navigation Types
 * Used to categorize navigation items by user role
 */
export const NAV_TYPES = {
  SUPER_ADMIN: "super_admin",
  INTERNAL_ADMIN: "internal_admin",
  FIELD_MANAGER: "field_manager",
  BRAND_AGENT: "brand_agent",
  CLIENT_USER: "client_user",
};

/**
 * User Types - matches the userType field in the user object
 */
export const USER_TYPES = {
  RISHI_MANAGEMENT: "rishi_management",
  CLIENT_USER: "client_user",
  BRAND_AGENT: "brand_agent",
};
