/**
 * Shared Database Schema and Types
 * This file contains all database table definitions and related types
 * used throughout the Rishi Platform application
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "internal_admin",
  "internal_field_manager",
  "brand_agent",
  "client_manager",
  "client_user",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "internal",
  "client",
  "partner",
]);

export const organizationTierEnum = pgEnum("organization_tier", [
  "tier_1",
  "tier_2",
  "tier_3",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "draft",
  "pending",
  "approved",
  "in_progress",
  "completed",
  "canceled",
]);

export const bookingPriorityEnum = pgEnum("booking_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const shiftStatusEnum = pgEnum("shift_status", [
  "draft",
  "open",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "assigned",
  "confirmed",
  "checked_in",
  "completed",
  "no_show",
]);

// Core Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  full_name: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
  profile_image: text("profile_image"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  primary_contact_id: uuid("primary_contact_id"),
  billing_address: jsonb("billing_address"),
  billing_email: text("billing_email"),
  billing_phone: text("billing_phone"),
  subscription_tier: text("subscription_tier"),
  subscription_status: text("subscription_status"),
  logo_url: text("logo_url"),
  website: text("website"),
  notes: text("notes"),
  tier: text("tier"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const userOrganizations = pgTable("user_organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  organization_id: uuid("organization_id").notNull(),
  role: text("role").notNull(),
  is_default: boolean("is_default"),
  created_at: timestamp("created_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  country: text("country").notNull().default("US"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  placeId: text("place_id"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityTypes = pgTable("activity_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  activityTypeId: uuid("activity_type_id").references(() => activityTypes.id),
  locationId: uuid("location_id").references(() => locations.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  status: text("status").notNull().default("draft"),
  budget: integer("budget"),
  attendeeEstimate: integer("attendee_estimate"),
  notes: text("notes"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  clientOrganizationId: uuid("client_organization_id")
    .notNull()
    .references(() => organizations.id),
  locationId: uuid("location_id").references(() => locations.id),
  activityTypeId: uuid("activity_type_id").references(() => activityTypes.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  budget: integer("budget"),
  attendeeEstimate: integer("attendee_estimate"),
  status: bookingStatusEnum("status").notNull().default("draft"),
  priority: bookingPriorityEnum("priority").notNull().default("medium"),
  notes: text("notes"),
  promotionTypeId: uuid("promotion_type_id"),
  kitTemplateId: uuid("kit_template_id"),
  staffCount: integer("staff_count"),
  requiresTraining: boolean("requires_training").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  approvedById: uuid("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedById: uuid("rejected_by_id").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  canceledAt: timestamp("canceled_at"),
  canceledById: uuid("canceled_by_id").references(() => users.id),
  cancelReason: text("cancel_reason"),
});

export const activityAssignments = pgTable("activity_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role"),
  status: text("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedById: uuid("assigned_by_id").references(() => users.id),
});

// Brand Agent Assignments table for bulk assignment operations
export const brandAgentAssignments = pgTable("brand_agent_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandAgentId: uuid("brand_agent_id")
    .notNull()
    .references(() => users.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  activityId: uuid("activity_id").references(() => activities.id),
  role: text("role"),
  status: text("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedById: uuid("assigned_by_id").references(() => users.id),
});

// System Events table for message sending
export const systemEvents = pgTable("system_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  userId: uuid("user_id").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// States table for location management
export const states = pgTable("states", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Brands table
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand locations (many-to-many)
export const brandLocations = pgTable("brand_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Availability Blocks table for scheduling
export const availabilityBlocks = pgTable("availability_blocks", {
  id: integer("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  title: text("title"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  day_of_week: integer("day_of_week"),
  is_recurring: boolean("is_recurring"),
  status: text("status"),
  recurring: boolean("recurring"),
  recurrence_pattern: text("recurrence_pattern"),
  recurrence_group: text("recurrence_group"),
  recurrence_end_type: text("recurrence_end_type"),
  recurrence_count: integer("recurrence_count"),
  recurrence_end_date: timestamp("recurrence_end_date"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationUsers = pgTable("organization_users", {
  id: integer("id").primaryKey(),
  organization_id: uuid("organization_id").notNull(),
  user_id: uuid("user_id").notNull(),
  role: text("role").notNull(),
  title: text("title"),
  department: text("department"),
  is_primary: boolean("is_primary"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationSettings = pgTable("organization_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id").notNull(),
  notification_email: text("notification_email"),
  timezone: text("timezone"),
  language: text("language"),
  date_format: text("date_format"),
  time_format: text("time_format"),
  billing_contact_name: text("billing_contact_name"),
  billing_contact_email: text("billing_contact_email"),
  billing_address: text("billing_address"),
  additional_settings: jsonb("additional_settings"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kit Templates - Equipment and material templates
export const kitTemplates = pgTable("kit_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  items: jsonb("items").notNull().default("[]"),
  organization_id: uuid("organization_id").references(() => organizations.id),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kits - Actual kit instances
export const kits = pgTable("kits", {
  id: uuid("id").primaryKey().defaultRandom(),
  template_id: uuid("template_id")
    .notNull()
    .references(() => kitTemplates.id),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  location_id: uuid("location_id").references(() => locations.id),
  assigned_to: uuid("assigned_to").references(() => users.id),
  organization_id: uuid("organization_id").references(() => organizations.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Constants
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  INTERNAL_ADMIN: "internal_admin",
  INTERNAL_FIELD_MANAGER: "internal_field_manager",
  BRAND_AGENT: "brand_agent",
  CLIENT_MANAGER: "client_manager",
  CLIENT_USER: "client_user",
} as const;

export const BOOKING_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;

export const BOOKING_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Insert Schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityTypeSchema = createInsertSchema(activityTypes).omit({
  id: true,
  createdAt: true,
});

export const insertActivityAssignmentSchema = createInsertSchema(
  activityAssignments,
).omit({
  id: true,
  assignedAt: true,
});

export const insertUserOrganizationSchema = createInsertSchema(
  userOrganizations,
).omit({
  id: true,
  created_at: true,
});

export const insertOrganizationUserSchema = createInsertSchema(
  organizationUsers,
).omit({
  id: true,
  created_at: true,
});

export const insertOrganizationSettingsSchema = createInsertSchema(
  organizationSettings,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitTemplateSchema = createInsertSchema(kitTemplates).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitSchema = createInsertSchema(kits).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Infer Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type ActivityType = typeof activityTypes.$inferSelect;
export type InsertActivityType = z.infer<typeof insertActivityTypeSchema>;

export type ActivityAssignment = typeof activityAssignments.$inferSelect;
export type InsertActivityAssignment = z.infer<
  typeof insertActivityAssignmentSchema
>;

export type UserOrganization = typeof userOrganizations.$inferSelect;
export type InsertUserOrganization = z.infer<
  typeof insertUserOrganizationSchema
>;

export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type InsertOrganizationUser = z.infer<
  typeof insertOrganizationUserSchema
>;

export type OrganizationSettings = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSettings = z.infer<
  typeof insertOrganizationSettingsSchema
>;

// Additional insert schemas for the new tables
export const insertBrandAgentAssignmentSchema = createInsertSchema(
  brandAgentAssignments,
).omit({
  id: true,
  assignedAt: true,
});

export const insertSystemEventSchema = createInsertSchema(systemEvents).omit({
  id: true,
  createdAt: true,
});

export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Additional infer types for the new tables
export type BrandAgentAssignment = typeof brandAgentAssignments.$inferSelect;
export type InsertBrandAgentAssignment = z.infer<
  typeof insertBrandAgentAssignmentSchema
>;

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = z.infer<typeof insertSystemEventSchema>;

export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

// Additional insert schemas for new tables
export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandLocationSchema = createInsertSchema(
  brandLocations,
).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilityBlockSchema = createInsertSchema(
  availabilityBlocks,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Additional infer types for new tables
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type BrandLocation = typeof brandLocations.$inferSelect;
export type InsertBrandLocation = z.infer<typeof insertBrandLocationSchema>;
export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;
export type InsertAvailabilityBlock = z.infer<
  typeof insertAvailabilityBlockSchema
>;

// Shifts Table - Enhanced event scheduling for workforce
export const shifts = pgTable("shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => systemEvents.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  locationId: uuid("location_id").references(() => locations.id),
  brandId: uuid("brand_id").references(() => brands.id),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  startDateTime: timestamp("start_datetime").notNull(),
  endDateTime: timestamp("end_datetime").notNull(),
  requiredAgents: integer("required_agents").default(1),
  status: shiftStatusEnum("status").default("draft"),
  requiredSkills: jsonb("required_skills"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
});

// Shift Assignments
export const shiftAssignments = pgTable("shift_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  shiftId: uuid("shift_id")
    .notNull()
    .references(() => shifts.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignmentStatus:
    assignmentStatusEnum("assignment_status").default("assigned"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: uuid("assigned_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  checkedInAt: timestamp("checked_in_at"),
  checkedOutAt: timestamp("checked_out_at"),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  notes: text("notes"),
});

// Insert schemas for shifts
export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

export const insertShiftAssignmentSchema = createInsertSchema(
  shiftAssignments,
).omit({
  id: true,
  assignedAt: true,
});

// Types for shifts
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = z.infer<typeof insertShiftAssignmentSchema>;

// Missing tables that are referenced in API routes
export const items = pgTable("items", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Note: bookingComments table does not exist in actual Neon database
// Using activities table structure for comments functionality
export const bookingComments = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type_id: uuid("type_id"),
  location_id: uuid("location_id"),
  organization_id: uuid("organization_id").notNull(),
  brand_id: uuid("brand_id"),
  created_by_id: uuid("created_by_id").notNull(),
  status: text("status").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Note: eventInstances table does not exist - using activities for event instances
export const eventInstances = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type_id: uuid("type_id"),
  location_id: uuid("location_id"),
  organization_id: uuid("organization_id").notNull(),
  status: text("status").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Note: promotionTypes table does not exist - using activity_types for promotions
export const promotionTypes = pgTable("activity_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  organization_id: uuid("organization_id"),
  is_system_defined: boolean("is_system_defined").notNull().default(false),
  metadata_schema: jsonb("metadata_schema"),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const userOrganizationPreferences = pgTable(
  "user_organization_preferences",
  {
    id: integer("id").primaryKey(),
    user_id: uuid("user_id").notNull(),
    organization_id: uuid("organization_id").notNull(),
    last_active: timestamp("last_active"),
    is_default: boolean("is_default"),
    theme: text("theme"),
    dashboard_layout: jsonb("dashboard_layout"),
    notification_settings: jsonb("notification_settings"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
);

export const permissions = pgTable("permissions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Note: Using activities table for events functionality (actual table exists)
export const events = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type_id: uuid("type_id"),
  location_id: uuid("location_id"),
  organization_id: uuid("organization_id").notNull(),
  brand_id: uuid("brand_id"),
  created_by_id: uuid("created_by_id").notNull(),
  status: text("status").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  all_day: boolean("all_day").notNull().default(false),
  recurrence_rule: text("recurrence_rule"),
  timezone: text("timezone").notNull(),
  metadata: jsonb("metadata"),
  requirements: jsonb("requirements"),
  budget: decimal("budget"),
  priority: text("priority"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas for missing tables
export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBookingCommentSchema = createInsertSchema(
  bookingComments,
).omit({
  id: true,
  created_at: true,
});

export const insertEventInstanceSchema = createInsertSchema(
  eventInstances,
).omit({
  id: true,
  created_at: true,
});

export const insertPromotionTypeSchema = createInsertSchema(
  promotionTypes,
).omit({
  id: true,
  created_at: true,
});

export const insertUserOrganizationPreferencesSchema = createInsertSchema(
  userOrganizationPreferences,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Add missing regions and organizationRegions tables
export const regions = pgTable("regions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  country: text("country").notNull().default("US"),
  state: text("state"),
  timezone: text("timezone"),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const organizationRegions = pgTable("organization_regions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  region_id: uuid("region_id")
    .notNull()
    .references(() => regions.id),
  is_primary: boolean("is_primary").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Add missing organizationBranding table
export const organizationBranding = pgTable("organization_branding", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  logo_url: text("logo_url"),
  primary_color: text("primary_color"),
  secondary_color: text("secondary_color"),
  accent_color: text("accent_color"),
  font_family: text("font_family"),
  custom_css: text("custom_css"),
  favicon_url: text("favicon_url"),
  brand_name: text("brand_name"),
  tagline: text("tagline"),
  website_url: text("website_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertOrganizationRegionSchema = createInsertSchema(
  organizationRegions,
).omit({
  id: true,
  created_at: true,
});

export const insertOrganizationBrandingSchema = createInsertSchema(
  organizationBranding,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types for missing tables
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type BookingComment = typeof bookingComments.$inferSelect;
export type InsertBookingComment = z.infer<typeof insertBookingCommentSchema>;
export type EventInstance = typeof eventInstances.$inferSelect;
export type InsertEventInstance = z.infer<typeof insertEventInstanceSchema>;
export type PromotionType = typeof promotionTypes.$inferSelect;
export type InsertPromotionType = z.infer<typeof insertPromotionTypeSchema>;
export type UserOrganizationPreferences =
  typeof userOrganizationPreferences.$inferSelect;
export type InsertUserOrganizationPreferences = z.infer<
  typeof insertUserOrganizationPreferencesSchema
>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// RBAC exports for auth-service compatibility
export const roles = {
  super_admin: "super_admin",
  internal_admin: "internal_admin",
  internal_field_manager: "internal_field_manager",
  brand_agent: "brand_agent",
  client_manager: "client_manager",
  client_user: "client_user",
} as const;

export const rolePermissions = {
  super_admin: [
    "create:users",
    "read:users",
    "update:users",
    "delete:users",
    "create:organizations",
    "read:organizations",
    "update:organizations",
    "delete:organizations",
    "create:locations",
    "read:locations",
    "update:locations",
    "delete:locations",
    "create:bookings",
    "read:bookings",
    "update:bookings",
    "delete:bookings",
    "manage:organizations",
    "approve:bookings",
    "reject:bookings",
  ],
  internal_admin: [
    "create:users",
    "read:users",
    "update:users",
    "read:organizations",
    "update:organizations",
    "create:locations",
    "read:locations",
    "update:locations",
    "create:bookings",
    "read:bookings",
    "update:bookings",
    "approve:bookings",
    "reject:bookings",
  ],
  internal_field_manager: [
    "read:users",
    "update:users",
    "read:organizations",
    "read:locations",
    "update:locations",
    "create:bookings",
    "read:bookings",
    "update:bookings",
  ],
  brand_agent: [
    "read:users",
    "read:organizations",
    "read:locations",
    "read:bookings",
    "update:bookings",
  ],
  client_manager: [
    "read:users",
    "read:organizations",
    "read:locations",
    "create:bookings",
    "read:bookings",
    "update:bookings",
  ],
  client_user: [
    "read:users",
    "read:organizations",
    "read:locations",
    "read:bookings",
  ],
} as const;

// Kit Template Types
export type KitTemplate = typeof kitTemplates.$inferSelect;
export type InsertKitTemplate = z.infer<typeof insertKitTemplateSchema>;

export type Kit = typeof kits.$inferSelect;
export type InsertKit = z.infer<typeof insertKitSchema>;

// Audit Logs table for tracking system changes
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes"),
  userId: uuid("user_id").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schema for audit logs
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types for audit logs
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Organization Invitations table
export const organizationInvitations = pgTable("organization_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schema for organization invitations
export const insertOrganizationInvitationSchema = createInsertSchema(
  organizationInvitations,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Organization Permissions table
export const organizationPermissions = pgTable("organization_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  permission: text("permission").notNull(),
  isGranted: boolean("is_granted").notNull().default(false),
  grantedByUserId: uuid("granted_by_user_id").references(() => users.id),
  grantedAt: timestamp("granted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schema for organization permissions
export const insertOrganizationPermissionSchema = createInsertSchema(
  organizationPermissions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for organization invitations and permissions
export type OrganizationInvitation =
  typeof organizationInvitations.$inferSelect;
export type InsertOrganizationInvitation = z.infer<
  typeof insertOrganizationInvitationSchema
>;
export type OrganizationPermission =
  typeof organizationPermissions.$inferSelect;
export type InsertOrganizationPermission = z.infer<
  typeof insertOrganizationPermissionSchema
>;

// Kit Component Inventory table
export const kitComponentInventory = pgTable("kit_component_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  kitId: uuid("kit_id")
    .notNull()
    .references(() => kits.id, { onDelete: "cascade" }),
  componentId: uuid("component_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  assignedQuantity: integer("assigned_quantity").notNull().default(0),
  availableQuantity: integer("available_quantity").notNull().default(1),
  condition: text("condition").default("good"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Kits table
export const activityKits = pgTable("activity_kits", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id").notNull(),
  kitTemplateId: uuid("kit_template_id").references(() => kitTemplates.id),
  kitInstanceId: uuid("kit_instance_id").references(() => kits.id),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  status: text("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  checkedOutAt: timestamp("checked_out_at"),
  checkedInAt: timestamp("checked_in_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent Skills table
export const agentSkills = pgTable("agent_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillName: text("skill_name").notNull(),
  skillLevel: text("skill_level").notNull().default("beginner"),
  certified: boolean("certified").notNull().default(false),
  certificationDate: timestamp("certification_date"),
  expiryDate: timestamp("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas for missing tables
export const insertKitComponentInventorySchema = createInsertSchema(
  kitComponentInventory,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityKitSchema = createInsertSchema(activityKits).omit({
  id: true,
  assignedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSkillSchema = createInsertSchema(agentSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for missing tables
export type KitComponentInventory = typeof kitComponentInventory.$inferSelect;
export type InsertKitComponentInventory = z.infer<
  typeof insertKitComponentInventorySchema
>;
export type ActivityKit = typeof activityKits.$inferSelect;
export type InsertActivityKit = z.infer<typeof insertActivityKitSchema>;
export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = z.infer<typeof insertAgentSkillSchema>;
