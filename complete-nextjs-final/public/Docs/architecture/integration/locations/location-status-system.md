---
title: Location Status System
description: Technical documentation for the simplified location status system in the Rishi platform
lastUpdated: 2025-05-20
---

# Location Status System

## Overview

The Location Status System manages the lifecycle states of locations within the Rishi platform. This document describes the simplified status approach implemented in the platform, how it's implemented in the database schema, and how it's presented in the user interface.

## Status Values

The location status system uses a single `status` field with clear, discrete values:

| Status     | Description                                                   | UI Representation  |
| ---------- | ------------------------------------------------------------- | ------------------ |
| `pending`  | Location has been submitted but not yet reviewed              | Orange/amber badge |
| `approved` | Location has been reviewed and approved for use               | Green badge        |
| `rejected` | Location has been reviewed and denied                         | Red badge          |
| `inactive` | Location that was previously approved but is no longer in use | Gray badge         |

## Implementation Details

### Database Schema

In the database schema (`shared/schema.ts`), locations are defined with a status field:

```typescript
export const locations = pgTable("locations", {
  // ... other fields
  status: text("status").notNull().default("pending"),
  // ... other fields
});
```

### Status Transitions

The following transitions are valid in the system:

- `pending` → `approved` (Administrator approval)
- `pending` → `rejected` (Administrator rejection)
- `approved` → `inactive` (Deactivation)
- `inactive` → `approved` (Reactivation)
- `rejected` → `pending` (Re-submission)

### Legacy Status Values

Prior to the simplification, the system used both a `status` field and an `active` boolean field:

| Status     | Active  | Meaning               |
| ---------- | ------- | --------------------- |
| `pending`  | `false` | Awaiting review       |
| `approved` | `true`  | Approved and active   |
| `approved` | `false` | Approved but inactive |
| `rejected` | `false` | Rejected              |

This dual-field approach was simplified to use only the `status` field, with locations previously marked as `approved` with `active: true` now showing simply as `approved`, and those with `active: false` now showing as `inactive`.

## User Interface Integration

### Status Badge Display

The status is displayed consistently across the application with color-coded badges:

```tsx
<span
  className={`badge 
  ${status === "approved" ? "bg-green-700/20 text-green-400" : ""} 
  ${status === "pending" ? "bg-amber-700/20 text-amber-400" : ""} 
  ${status === "rejected" ? "bg-red-700/20 text-red-400" : ""}
  ${status === "inactive" ? "bg-gray-700/20 text-gray-400" : ""}
`}
>
  {status}
</span>
```

### Map Marker Integration

On maps, the status is represented by color-coded markers:

- `pending`: Amber/orange
- `approved`: Green
- `rejected`: Red
- `inactive`: Gray

### Status Filtering

The application includes filters to show locations by status:

- Filter by specific status values
- Counter badges showing totals for each status
- Quick toggle filters in map and list views

## Event System Integration

The status system is integrated with the application's event bus:

- `location.status.updated` events are published when status changes
- Subscribers can react to status changes (e.g., notifications, analytics)

## Approval Workflow

The standard approval workflow follows these steps:

1. User submits a new location (status: `pending`)
2. Administrator reviews the location
3. Administrator approves or rejects the location
4. System updates the status and publishes related events
5. User is notified of the status change

## Bulk Operations

The system supports bulk operations for administrators:

- Bulk approve selected pending locations
- Bulk reject selected pending locations
- Bulk deactivate selected approved locations

## Future Enhancements

- Implement status change history tracking
- Add status change reason/notes field
- Support scheduled status changes (e.g., temporary inactivation)
- Extended workflow states for specific use cases
- Customizable approval workflows by organization
