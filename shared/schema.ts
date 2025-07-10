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

// Constants for use in API routes
export const BOOKING_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;

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
  type: text("type"),
  address1: text("address1"),
  address2: text("address2"),
  city: text("city").notNull(),
  state_id: uuid("state_id"),
  zipcode: text("zipcode"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),
  notes: text("notes"),
  status: text("status"),
  requested_by: uuid("requested_by"),
  reviewed_by: uuid("reviewed_by"),
  review_date: timestamp("review_date"),
  geo_lat: decimal("geo_lat"),
  geo_lng: decimal("geo_lng"),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
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

// Inventory Items - Items available for replenishment
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  unit_of_measure: varchar("unit_of_measure", { length: 50 }).notNull().default("each"),
  cost_per_unit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  supplier_info: text("supplier_info"),
  is_consumable: boolean("is_consumable").notNull().default(true),
  minimum_stock_level: integer("minimum_stock_level").default(0),
  maximum_stock_level: integer("maximum_stock_level").default(1000),
  current_stock: integer("current_stock").notNull().default(0),
  available_stock: integer("available_stock").notNull().default(0),
  reserved_stock: integer("reserved_stock").notNull().default(0),
  reorder_point: integer("reorder_point").default(10),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kit Templates - Predetermined by Rishi + client for specific brands/regions
export const kitTemplates = pgTable("kit_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  client_organization_id: uuid("client_organization_id")
    .notNull()
    .references(() => organizations.id),
  brand_id: uuid("brand_id").references(() => brands.id),
  target_regions: text("target_regions").array(), // States/regions this template serves
  template_type: varchar("template_type", { length: 50 }).notNull().default("standard"),
  estimated_value: decimal("estimated_value", { precision: 10, scale: 2 }),
  setup_instructions: text("setup_instructions"),
  breakdown_instructions: text("breakdown_instructions"),
  usage_notes: text("usage_notes"),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  approved_by: uuid("approved_by").references(() => users.id),
  approved_at: timestamp("approved_at"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kit Template Items - Items that should be in each kit template
export const kitTemplateItems = pgTable("kit_template_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  kit_template_id: uuid("kit_template_id")
    .notNull()
    .references(() => kitTemplates.id, { onDelete: "cascade" }),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id),
  quantity_required: integer("quantity_required").notNull().default(1),
  is_critical: boolean("is_critical").notNull().default(false),
  usage_instructions: text("usage_instructions"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kit Instances - Physical instances of templates in service
export const kitInstances = pgTable("kit_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  kit_template_id: uuid("kit_template_id")
    .notNull()
    .references(() => kitTemplates.id),
  instance_name: varchar("instance_name", { length: 255 }).notNull(),
  serial_number: varchar("serial_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, in_use, maintenance, needs_replenishment
  current_location: varchar("current_location", { length: 255 }),
  assigned_to: uuid("assigned_to").references(() => users.id),
  assigned_at: timestamp("assigned_at"),
  region: varchar("region", { length: 100 }),
  condition: varchar("condition", { length: 50 }).notNull().default("good"), // good, fair, poor, damaged
  last_inventory_check: timestamp("last_inventory_check"),
  next_replenishment_due: timestamp("next_replenishment_due"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Kit Instance Items - Current items within each kit instance with quantities
export const kitInstanceItems = pgTable("kit_instance_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  kit_instance_id: uuid("kit_instance_id")
    .notNull()
    .references(() => kitInstances.id, { onDelete: "cascade" }),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id),
  current_quantity: integer("current_quantity").notNull().default(0),
  original_quantity: integer("original_quantity").notNull().default(0),
  minimum_quantity: integer("minimum_quantity").notNull().default(0),
  consumed_quantity: integer("consumed_quantity").notNull().default(0),
  condition: varchar("condition", { length: 50 }).notNull().default("good"),
  expiration_date: timestamp("expiration_date"),
  last_restocked: timestamp("last_restocked"),
  needs_replenishment: boolean("needs_replenishment").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Consumption Tracking - Track what gets consumed during bookings
export const consumptionLogs = pgTable("consumption_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  kit_instance_id: uuid("kit_instance_id")
    .notNull()
    .references(() => kitInstances.id),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id),
  booking_id: uuid("booking_id").references(() => bookings.id),
  quantity_consumed: integer("quantity_consumed").notNull(),
  consumption_date: timestamp("consumption_date").notNull().defaultNow(),
  consumed_by: uuid("consumed_by").references(() => users.id),
  reason: text("reason"),
  location: varchar("location", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Replenishment Requests - Track requests to replenish kit instances
export const replenishmentRequests = pgTable("replenishment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  kit_instance_id: uuid("kit_instance_id")
    .notNull()
    .references(() => kitInstances.id),
  requested_by: uuid("requested_by")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, in_progress, completed, canceled
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // low, medium, high, urgent
  due_date: timestamp("due_date"),
  approved_by: uuid("approved_by").references(() => users.id),
  approved_at: timestamp("approved_at"),
  completed_by: uuid("completed_by").references(() => users.id),
  completed_at: timestamp("completed_at"),
  total_estimated_cost: decimal("total_estimated_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Replenishment Request Items - Specific items to replenish
export const replenishmentRequestItems = pgTable("replenishment_request_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  replenishment_request_id: uuid("replenishment_request_id")
    .notNull()
    .references(() => replenishmentRequests.id, { onDelete: "cascade" }),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id),
  quantity_requested: integer("quantity_requested").notNull(),
  quantity_approved: integer("quantity_approved").default(0),
  quantity_supplied: integer("quantity_supplied").default(0),
  unit_cost: decimal("unit_cost", { precision: 10, scale: 2 }),
  total_cost: decimal("total_cost", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  tracking_number: varchar("tracking_number", { length: 100 }),
  delivered_at: timestamp("delivered_at"),
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

export const BOOKING_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Role permissions constants
export const roles = [
  "super_admin",
  "internal_admin", 
  "internal_field_manager",
  "brand_agent",
  "client_manager",
  "client_user",
] as const;

export const rolePermissions = {
  super_admin: ["*"],
  internal_admin: ["create:*", "read:*", "update:*", "delete:*"],
  internal_field_manager: ["create:bookings", "read:*", "update:bookings", "update:staff"],
  brand_agent: ["read:bookings", "read:staff", "update:profile"],
  client_manager: ["create:bookings", "read:bookings", "update:bookings", "read:staff"],
  client_user: ["read:bookings", "read:staff", "update:profile"],
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

// New inventory/kit insert schemas
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitTemplateSchema = createInsertSchema(kitTemplates).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitTemplateItemSchema = createInsertSchema(kitTemplateItems).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitInstanceSchema = createInsertSchema(kitInstances).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertKitInstanceItemSchema = createInsertSchema(kitInstanceItems).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertConsumptionLogSchema = createInsertSchema(consumptionLogs).omit({
  id: true,
  created_at: true,
  consumption_date: true,
});

export const insertReplenishmentRequestSchema = createInsertSchema(replenishmentRequests).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertReplenishmentRequestItemSchema = createInsertSchema(replenishmentRequestItems).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Type exports for new inventory/kit system
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof insertInventoryItemSchema._type;

export type KitTemplate = typeof kitTemplates.$inferSelect;
export type InsertKitTemplate = typeof insertKitTemplateSchema._type;

export type KitTemplateItem = typeof kitTemplateItems.$inferSelect;
export type InsertKitTemplateItem = typeof insertKitTemplateItemSchema._type;

export type KitInstance = typeof kitInstances.$inferSelect;
export type InsertKitInstance = typeof insertKitInstanceSchema._type;

export type KitInstanceItem = typeof kitInstanceItems.$inferSelect;
export type InsertKitInstanceItem = typeof insertKitInstanceItemSchema._type;

export type ConsumptionLog = typeof consumptionLogs.$inferSelect;
export type InsertConsumptionLog = typeof insertConsumptionLogSchema._type;

export type ReplenishmentRequest = typeof replenishmentRequests.$inferSelect;
export type InsertReplenishmentRequest = typeof insertReplenishmentRequestSchema._type;

export type ReplenishmentRequestItem = typeof replenishmentRequestItems.$inferSelect;
export type InsertReplenishmentRequestItem = typeof insertReplenishmentRequestItemSchema._type;

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
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
export type Region = typeof regions.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type OrganizationRegion = typeof organizationRegions.$inferSelect;
export type InsertOrganizationRegion = z.infer<typeof insertOrganizationRegionSchema>;
export type OrganizationBranding = typeof organizationBranding.$inferSelect;
export type InsertOrganizationBranding = z.infer<typeof insertOrganizationBrandingSchema>;

// Tasks table for task management
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  assignedBy: uuid("assigned_by").references(() => users.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Permissions table for RBAC
export const userPermissions = pgTable("user_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  permission: text("permission").notNull(),
  resource: text("resource"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  grantedBy: uuid("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas for new tables
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

// RBAC exports for auth-service compatibility (removed duplicate exports - using versions defined earlier)

// Kit Template Types
export type KitTemplate = typeof kitTemplates.$inferSelect;

// Kit types will be handled by KitInstance and KitTemplate

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
