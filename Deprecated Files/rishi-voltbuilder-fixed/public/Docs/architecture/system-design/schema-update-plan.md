# Schema Update Plan for Bookings-Events-Activities

Based on our revised understanding of the bookings, events, and activities relationships, we need to make the following schema updates to properly implement the model:

## Current Schema Structure

The current schema has the following entities:

1. **Bookings**

   - Represents client requests for brand activations
   - Contains fields like title, description, location, start/end date/time
   - Has a many-to-one relationship with organizations
   - Has a one-to-many relationship with events

2. **Events**

   - Represents specific occurrences of bookings
   - Contains fields like title, description, startDateTime, endDateTime, location
   - Has a many-to-one relationship with bookings
   - Currently lacks direct connection to activities

3. **Activities**
   - Represents promotional actions
   - Contains fields like title, description, type, location
   - Currently acts as a standalone entity without connection to events
   - Has assignments and kits relationships

## Required Schema Changes

### 1. Add EventID to Activities

The most critical missing piece is connecting activities to events. Each activity should be associated with a specific event:

```typescript
export const activities = pgTable("activities", {
  // existing fields...
  eventId: uuid("event_id").references(() => events.id), // Add this field
  // remaining fields...
});
```

### 2. Update Activity Relations

Add the relation from activities to events:

```typescript
export const activitiesRelations = relations(activities, ({ one, many }) => ({
  // existing relations...
  event: one(events, {
    fields: [activities.eventId],
    references: [events.id],
  }),
  // remaining relations...
}));
```

### 3. Update Event Relations

Add the relation from events to activities:

```typescript
export const eventsRelations = relations(events, ({ one, many }) => ({
  // existing relations...
  activities: many(activities),
  // remaining relations...
}));
```

### 4. Add Recurrence Pattern to Bookings

To support recurring bookings, we need to add recurrence pattern information:

```typescript
export const bookings = pgTable("bookings", {
  // existing fields...
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrencePattern: text("recurrence_pattern"), // Stores the recurrence rule (e.g., "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO")
  recurrenceEndDate: date("recurrence_end_date"), // Optional end date for recurring series
  // remaining fields...
});
```

### 5. Add Parent-Child Relationship in Events (Optional)

For better tracking of recurring events, we could add a parent-child relationship:

```typescript
export const events = pgTable("events", {
  // existing fields...
  seriesId: uuid("series_id").references(() => events.id), // Self-reference to the first event in a series
  isSeriesParent: boolean("is_series_parent").notNull().default(false),
  // remaining fields...
});
```

And update the relations:

```typescript
export const eventsRelations = relations(events, ({ one, many }) => ({
  // existing relations...
  parent: one(events, {
    fields: [events.seriesId],
    references: [events.id],
    relationName: "eventSeries",
  }),
  childEvents: many(events, { relationName: "eventSeries" }),
  // remaining relations...
}));
```

## Implementation Plan

1. Create a database migration to add the new fields without disrupting existing data
2. Update the Drizzle schemas in `shared/schema.ts` with the new fields and relations
3. Update any insert/select types and validation schemas
4. Modify the API endpoints to handle the new relationships
5. Update UI components to leverage the enhanced data model

## Impact on Existing Code

- API routes will need to be updated to handle the new relationships
- Booking creation will need to support generating multiple events for recurring patterns
- UI components will need to be enhanced to show the relationship between events and activities

## Next Steps

1. Implement the schema changes as part of the immediate phase development
2. Update the API routes to leverage the new relationships
3. Enhance the UI to properly display the connections between bookings, events, and activities
