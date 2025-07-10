import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  decimal,
  date,
  time,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { bookings } from "./schema"; // Import existing schema
import { users } from "./schema";
import { locations } from "./schema";
import { kitTemplates } from "./schema";

// Define kitInstances table reference (since it might not be explicitly exported)
const kitInstances = {
  id: { name: "id" }, // Minimal reference needed for relations
};

// Define the event_instances table
export const eventInstances = pgTable("event_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  status: text("status").notNull().default("scheduled"),
  fieldManagerId: uuid("field_manager_id").references(() => users.id),
  preparationStatus: text("preparation_status"),
  checkInRequired: boolean("check_in_required").default(true),
  notes: text("notes"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the event_team_members table
export const eventTeamMembers = pgTable("event_team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id")
    .notNull()
    .references(() => eventInstances.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the activities table (if not already defined in schema.ts)
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id").references(
    () => eventInstances.id,
  ),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull().default("planned"),
  instructions: text("instructions"),
  preparationStatus: text("preparation_status"),
  executionStatus: text("execution_status"),
  completionNotes: text("completion_notes"),
  duration: integer("duration"), // in minutes
  targetMetrics: jsonb("target_metrics"),
  actualMetrics: jsonb("actual_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the staff_assignments table
export const staffAssignments = pgTable("staff_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id")
    .notNull()
    .references(() => eventInstances.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id").references(() => activities.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(),
  status: text("status").notNull().default("assigned"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  locationAtCheckIn: jsonb("location_at_check_in"),
  locationAtCheckOut: jsonb("location_at_check_out"),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the activity_kits table
export const activityKits = pgTable("activity_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  kitTemplateId: uuid("kit_template_id").references(() => kitTemplates.id),
  kitInstanceId: uuid("kit_instance_id").references(() => kitInstances.id),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("needed"),
  checkedOutBy: uuid("checked_out_by").references(() => users.id),
  checkedOutAt: timestamp("checked_out_at"),
  returnedBy: uuid("returned_by").references(() => users.id),
  returnedAt: timestamp("returned_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the event_state_transitions table
export const eventStateTransitions = pgTable("event_state_transitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id")
    .notNull()
    .references(() => eventInstances.id, { onDelete: "cascade" }),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  changedById: uuid("changed_by_id").references(() => users.id),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the event_issues table
export const eventIssues = pgTable("event_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id")
    .notNull()
    .references(() => eventInstances.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id").references(() => activities.id, {
    onDelete: "set null",
  }),
  reportedBy: uuid("reported_by")
    .notNull()
    .references(() => users.id),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  photoUrls: text("photo_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relationships

// Event instances relations
export const eventInstancesRelations = relations(
  eventInstances,
  ({ one, many }) => ({
    booking: one(bookings, {
      fields: [eventInstances.bookingId],
      references: [bookings.id],
    }),
    location: one(locations, {
      fields: [eventInstances.locationId],
      references: [locations.id],
    }),
    fieldManager: one(users, {
      fields: [eventInstances.fieldManagerId],
      references: [users.id],
    }),
    teamMembers: many(eventTeamMembers),
    activities: many(activities),
    staffAssignments: many(staffAssignments),
    stateTransitions: many(eventStateTransitions),
    issues: many(eventIssues),
  }),
);

// Event team members relations
export const eventTeamMembersRelations = relations(
  eventTeamMembers,
  ({ one }) => ({
    eventInstance: one(eventInstances, {
      fields: [eventTeamMembers.eventInstanceId],
      references: [eventInstances.id],
    }),
    user: one(users, {
      fields: [eventTeamMembers.userId],
      references: [users.id],
    }),
  }),
);

// Activities relations
export const activitiesRelations = relations(activities, ({ one, many }) => ({
  eventInstance: one(eventInstances, {
    fields: [activities.eventInstanceId],
    references: [eventInstances.id],
  }),
  kits: many(activityKits),
  staffAssignments: many(staffAssignments),
  issues: many(eventIssues),
}));

// Staff assignments relations
export const staffAssignmentsRelations = relations(
  staffAssignments,
  ({ one }) => ({
    eventInstance: one(eventInstances, {
      fields: [staffAssignments.eventInstanceId],
      references: [eventInstances.id],
    }),
    activity: one(activities, {
      fields: [staffAssignments.activityId],
      references: [activities.id],
    }),
    user: one(users, {
      fields: [staffAssignments.userId],
      references: [users.id],
    }),
  }),
);

// Activity kits relations
export const activityKitsRelations = relations(activityKits, ({ one }) => ({
  activity: one(activities, {
    fields: [activityKits.activityId],
    references: [activities.id],
  }),
  kitTemplate: one(kitTemplates, {
    fields: [activityKits.kitTemplateId],
    references: [kitTemplates.id],
  }),
  kitInstance: one(kitInstances, {
    fields: [activityKits.kitInstanceId],
    references: [kitInstances.id],
  }),
  checkedOutByUser: one(users, {
    fields: [activityKits.checkedOutBy],
    references: [users.id],
  }),
  returnedByUser: one(users, {
    fields: [activityKits.returnedBy],
    references: [users.id],
  }),
}));

// Event state transitions relations
export const eventStateTransitionsRelations = relations(
  eventStateTransitions,
  ({ one }) => ({
    eventInstance: one(eventInstances, {
      fields: [eventStateTransitions.eventInstanceId],
      references: [eventInstances.id],
    }),
    changedBy: one(users, {
      fields: [eventStateTransitions.changedById],
      references: [users.id],
    }),
  }),
);

// Event issues relations
export const eventIssuesRelations = relations(eventIssues, ({ one }) => ({
  eventInstance: one(eventInstances, {
    fields: [eventIssues.eventInstanceId],
    references: [eventInstances.id],
  }),
  activity: one(activities, {
    fields: [eventIssues.activityId],
    references: [activities.id],
  }),
  reporter: one(users, {
    fields: [eventIssues.reportedBy],
    references: [users.id],
  }),
  resolver: one(users, {
    fields: [eventIssues.resolvedBy],
    references: [users.id],
  }),
}));

// Zod Schemas for validation

// Event Instance schemas
export const insertEventInstanceSchema = createInsertSchema(eventInstances);
export const selectEventInstanceSchema = createSelectSchema(eventInstances);

export type EventInstance = typeof eventInstances.$inferSelect;
export type InsertEventInstance = typeof eventInstances.$inferInsert;

// Event Team Member schemas
export const insertEventTeamMemberSchema = createInsertSchema(eventTeamMembers);
export const selectEventTeamMemberSchema = createSelectSchema(eventTeamMembers);

export type EventTeamMember = typeof eventTeamMembers.$inferSelect;
export type InsertEventTeamMember = typeof eventTeamMembers.$inferInsert;

// Activities schemas (if not already defined)
export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// Staff Assignment schemas
export const insertStaffAssignmentSchema = createInsertSchema(staffAssignments);
export const selectStaffAssignmentSchema = createSelectSchema(staffAssignments);

export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = typeof staffAssignments.$inferInsert;

// Activity Kit schemas
export const insertActivityKitSchema = createInsertSchema(activityKits);
export const selectActivityKitSchema = createSelectSchema(activityKits);

export type ActivityKit = typeof activityKits.$inferSelect;
export type InsertActivityKit = typeof activityKits.$inferInsert;

// Event State Transition schemas
export const insertEventStateTransitionSchema = createInsertSchema(
  eventStateTransitions,
);
export const selectEventStateTransitionSchema = createSelectSchema(
  eventStateTransitions,
);

export type EventStateTransition = typeof eventStateTransitions.$inferSelect;
export type InsertEventStateTransition =
  typeof eventStateTransitions.$inferInsert;

// Event Issue schemas
export const insertEventIssueSchema = createInsertSchema(eventIssues);
export const selectEventIssueSchema = createSelectSchema(eventIssues);

export type EventIssue = typeof eventIssues.$inferSelect;
export type InsertEventIssue = typeof eventIssues.$inferInsert;

// Extended schemas with additional validation
export const extendedInsertEventInstanceSchema = insertEventInstanceSchema
  .extend({
    status: z.enum([
      "scheduled",
      "preparation",
      "in_progress",
      "completed",
      "cancelled",
      "issue_reported",
      "post_processing",
    ]),
  })
  .refine(
    (data) => {
      // Custom validation to ensure end time is after start time
      if (data.startTime && data.endTime) {
        const start = new Date(`1970-01-01T${data.startTime}`);
        const end = new Date(`1970-01-01T${data.endTime}`);
        return end > start;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const extendedInsertStaffAssignmentSchema =
  insertStaffAssignmentSchema.extend({
    status: z.enum([
      "assigned",
      "offered",
      "accepted",
      "rejected",
      "checked_in",
      "checked_out",
      "no_show",
      "cancelled",
    ]),
  });
