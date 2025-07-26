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

// Define the event_instances table
export const eventInstances = pgTable("event_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  locationId: uuid("location_id"),
  status: text("status").notNull().default("scheduled"),
  fieldManagerId: uuid("field_manager_id"),
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
  eventInstanceId: uuid("event_instance_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the staff_assignments table
export const staffAssignments = pgTable("staff_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id").notNull(),
  activityId: uuid("activity_id"),
  userId: uuid("user_id").notNull(),
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
  activityId: uuid("activity_id").notNull(),
  kitTemplateId: uuid("kit_template_id"),
  kitInstanceId: uuid("kit_instance_id"),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("needed"),
  checkedOutBy: uuid("checked_out_by"),
  checkedOutAt: timestamp("checked_out_at"),
  returnedBy: uuid("returned_by"),
  returnedAt: timestamp("returned_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the event_state_transitions table
export const eventStateTransitions = pgTable("event_state_transitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id").notNull(),
  fromState: text("from_state").notNull(),
  toState: text("to_state").notNull(),
  changedById: uuid("changed_by_id"),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the event_issues table
export const eventIssues = pgTable("event_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventInstanceId: uuid("event_instance_id").notNull(),
  activityId: uuid("activity_id"),
  reportedBy: uuid("reported_by").notNull(),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by"),
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
    booking: one(/* bookings table reference */),
    location: one(/* locations table reference */),
    fieldManager: one(/* users table reference */),
    teamMembers: many(eventTeamMembers),
    activities: many(/* activities table reference */),
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
    user: one(/* users table reference */),
  }),
);

// Staff assignments relations
export const staffAssignmentsRelations = relations(
  staffAssignments,
  ({ one }) => ({
    eventInstance: one(eventInstances, {
      fields: [staffAssignments.eventInstanceId],
      references: [eventInstances.id],
    }),
    activity: one(/* activities table reference */),
    user: one(/* users table reference */),
  }),
);

// Activity kits relations
export const activityKitsRelations = relations(activityKits, ({ one }) => ({
  activity: one(/* activities table reference */),
  kitTemplate: one(/* kit_templates table reference */),
  kitInstance: one(/* kit_instances table reference */),
  checkedOutByUser: one(/* users table reference */),
  returnedByUser: one(/* users table reference */),
}));

// Event state transitions relations
export const eventStateTransitionsRelations = relations(
  eventStateTransitions,
  ({ one }) => ({
    eventInstance: one(eventInstances, {
      fields: [eventStateTransitions.eventInstanceId],
      references: [eventInstances.id],
    }),
    changedBy: one(/* users table reference */),
  }),
);

// Event issues relations
export const eventIssuesRelations = relations(eventIssues, ({ one }) => ({
  eventInstance: one(eventInstances, {
    fields: [eventIssues.eventInstanceId],
    references: [eventInstances.id],
  }),
  activity: one(/* activities table reference */),
  reporter: one(/* users table reference */),
  resolver: one(/* users table reference */),
}));

// Zod Schemas for validation

// Event Instance schemas
export const insertEventInstanceSchema = createInsertSchema(eventInstances);
export const selectEventInstanceSchema = createSelectSchema(eventInstances);

export type EventInstance = z.infer<typeof selectEventInstanceSchema>;
export type InsertEventInstance = z.infer<typeof insertEventInstanceSchema>;

// Event Team Member schemas
export const insertEventTeamMemberSchema = createInsertSchema(eventTeamMembers);
export const selectEventTeamMemberSchema = createSelectSchema(eventTeamMembers);

export type EventTeamMember = z.infer<typeof selectEventTeamMemberSchema>;
export type InsertEventTeamMember = z.infer<typeof insertEventTeamMemberSchema>;

// Staff Assignment schemas
export const insertStaffAssignmentSchema = createInsertSchema(staffAssignments);
export const selectStaffAssignmentSchema = createSelectSchema(staffAssignments);

export type StaffAssignment = z.infer<typeof selectStaffAssignmentSchema>;
export type InsertStaffAssignment = z.infer<typeof insertStaffAssignmentSchema>;

// Activity Kit schemas
export const insertActivityKitSchema = createInsertSchema(activityKits);
export const selectActivityKitSchema = createSelectSchema(activityKits);

export type ActivityKit = z.infer<typeof selectActivityKitSchema>;
export type InsertActivityKit = z.infer<typeof insertActivityKitSchema>;

// Event State Transition schemas
export const insertEventStateTransitionSchema = createInsertSchema(
  eventStateTransitions,
);
export const selectEventStateTransitionSchema = createSelectSchema(
  eventStateTransitions,
);

export type EventStateTransition = z.infer<
  typeof selectEventStateTransitionSchema
>;
export type InsertEventStateTransition = z.infer<
  typeof insertEventStateTransitionSchema
>;

// Event Issue schemas
export const insertEventIssueSchema = createInsertSchema(eventIssues);
export const selectEventIssueSchema = createSelectSchema(eventIssues);

export type EventIssue = z.infer<typeof selectEventIssueSchema>;
export type InsertEventIssue = z.infer<typeof insertEventIssueSchema>;

// Extended schemas with additional validation
export const extendedInsertEventInstanceSchema = insertEventInstanceSchema
  .extend({
    date: z.coerce.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
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
      const start = new Date(`1970-01-01T${data.startTime}`);
      const end = new Date(`1970-01-01T${data.endTime}`);
      return end > start;
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
