# Calendar Architecture Documentation

## Overview

The calendar system in our Cannabis Workforce Management Platform is built using a layered architecture with:

1. **UI Components** - Built with React and FullCalendar
2. **API Layer** - REST endpoints for CRUD operations
3. **Service Layer** - Business logic and data handling
4. **Data Layer** - PostgreSQL with Drizzle ORM

This documentation explains how these layers interact to provide a seamless availability management experience.

## Component Architecture

### CalendarWrapper (app/components/agent-calendar/CalendarWrapper.tsx)

The `CalendarWrapper` serves as a container component that manages:

- **Component Lifecycle**: Controls when the calendar mounts/unmounts to prevent excessive re-renders
- **Error Handling**: Uses ErrorBoundary to catch and display user-friendly errors
- **Loading States**: Shows loading indicators during data fetching
- **Global API Throttling**: Prevents API flooding by throttling requests
- **Calendar Re-initialization**: Provides functionality to refresh the calendar when needed

```typescript
function CalendarWrapper({ userId, viewOnly = false, debug = false }: CalendarWrapperProps) {
  // State for component lifecycle management
  const [shouldRender, setShouldRender] = useState(false);
  const [instanceKey, setInstanceKey] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Global request throttling - passed down to AgentCalendar
  const globalApiThrottleRef = useRef<{
    lastRequestTime: number;
    isPending: boolean;
    requestQueue: Array<() => Promise<void>>;
    cache: Record<string, any>;
  }>({...});

  // Only render once userId is available
  useEffect(() => {
    // Implementation...
  }, [userId]);

  // Manual refresh function
  const refreshCalendar = useCallback(() => {
    // Implementation...
  }, []);
}
```

Key design features:

- Uses React.memo to prevent unnecessary re-renders
- Implements a ref-forwarding pattern to expose calendar API to parent components
- Handles theme changes and sidebar state automatically

### AgentCalendar (app/components/agent-calendar/AgentCalendar.tsx)

The core calendar component that:

- **Fetches Availability Data**: Makes API calls to retrieve blocks
- **Renders Calendar UI**: Displays availability blocks on the FullCalendar
- **Handles User Interactions**: Processes clicks and selections
- **Manages Modal Dialogs**: Controls create/edit/delete modal workflows
- **Implements Conflict Resolution**: Detects and resolves overlapping blocks

```typescript
export default function AgentCalendar({
  userId,
  startDate = new Date(),
  endDate = new Date(new Date().setDate(new Date().getDate() + 90)),
  viewOnly = false,
  onError,
  onLoadingChange,
  globalThrottle,
  debug = false,
  fullCalendarRef,
}: AgentCalendarProps) {
  // State management
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // Additional state...

  // API call to fetch availability data
  const fetchAvailability = async () => {
    // Implementation with caching, error handling...
  };

  // Date selection handler - when user selects empty time slot
  const handleDateSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      // Implementation...
    },
    [userId, setNewBlockStatus, setError],
  );

  // Event click handler - when user clicks on existing block
  const handleEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      // Implementation...
    },
    [userId, setError],
  );

  // Create block functionality
  const createAvailabilityBlock = async (
    formData,
    modifiedStartStr,
    modifiedEndStr,
  ) => {
    // Implementation with API calls, error handling...
  };

  // Delete block functionality
  const deleteBlock = async (blockId, deleteEntireSeries) => {
    // Implementation...
  };
}
```

### Modal Components

Several specialized modal components handle user interactions:

1. **AvailabilityModal** - For creating new availability blocks
2. **BlockDetailModal** - For viewing and editing existing blocks
3. **ConflictDialog** - For resolving overlapping availability blocks
4. **AlertDialog** - For displaying system messages and errors

## API Layer

The API layer consists of RESTful endpoints for availability management:

### GET /api/availability

Fetches availability blocks with filtering options.

**Query Parameters:**

- `userId` (required): The ID of the user whose availability to fetch
- `startDate` (optional): Start date for filtering (ISO format)
- `endDate` (optional): End date for filtering (ISO format)
- `status` (optional): Filter by availability status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "userId": 456,
      "title": "Available",
      "startDate": "2025-03-21T10:00:00Z",
      "endDate": "2025-03-21T12:00:00Z",
      "status": "available",
      "isRecurring": false,
      "recurrencePattern": null,
      "dayOfWeek": null,
      "recurrenceGroup": null,
      "recurrenceEndType": null,
      "recurrenceCount": null,
      "recurrenceEndDate": null,
      "createdAt": "2025-03-20T15:30:00Z",
      "updatedAt": "2025-03-20T15:30:00Z"
    }
  ]
}
```

### POST /api/availability

Creates a new availability block.

**Request Body:**

```json
{
  "userId": 456,
  "startDate": "2025-03-22T09:00:00Z",
  "endDate": "2025-03-22T11:00:00Z",
  "status": "available",
  "isRecurring": true,
  "recurrencePattern": "weekly",
  "dayOfWeek": 6,
  "recurrenceEndType": "count",
  "recurrenceCount": 10
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 124,
    "userId": 456,
    "title": "Available",
    "startDate": "2025-03-22T09:00:00Z",
    "endDate": "2025-03-22T11:00:00Z",
    "status": "available",
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "dayOfWeek": 6,
    "recurrenceGroup": "rec_abc123",
    "recurrenceEndType": "count",
    "recurrenceCount": 10,
    "recurrenceEndDate": null
  }
}
```

### DELETE /api/availability/:id

Deletes an availability block.

**Query Parameters:**

- `deleteSeries` (optional): If true, deletes all instances of a recurring block

## Database Schema

The availability blocks are stored in the `availability_blocks` table:

```typescript
export const availabilityBlocks = pgTable("availability_blocks", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").default("Available"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  status: text("status").default("available"), // available, unavailable, tentative
  recurring: boolean("recurring").default(false),
  recurrence_pattern: text("recurrence_pattern"), // weekly, biweekly, monthly
  recurrence_group: text("recurrence_group"), // Identifier to group related recurring blocks
  recurrence_end_type: text("recurrence_end_type"), // never, count, until
  recurrence_count: integer("recurrence_count"), // number of occurrences
  recurrence_end_date: timestamp("recurrence_end_date"), // end date for recurring events
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
```

## Additional Functionality

### Google Calendar Integration

The platform supports syncing unavailability from Google Calendar via:

1. **OAuth Authentication**: Connecting user's Google account
2. **Calendar Listing**: Selecting specific calendars to sync
3. **Event Import**: Importing events as unavailability blocks

Integration endpoints:

- `/api/google/auth/url` - Get OAuth URL
- `/api/google/auth/callback` - Process OAuth callback
- `/api/google/calendars` - List calendars
- `/api/google/sync` - Sync calendar events

## Best Practices

The calendar implementation follows these best practices:

1. **Separation of Concerns**:

   - UI components never directly access database
   - API layer handles validation
   - Service layer contains business logic

2. **Performance Optimization**:

   - Response caching (10-second cache for identical requests)
   - Request throttling to prevent API flooding
   - Data merging (adjacent blocks are merged for display)

3. **Error Handling**:

   - API errors return standard format
   - UI shows user-friendly error messages
   - Network failures gracefully handled

4. **Security**:
   - Input validation on all endpoints
   - User authorization checks
   - CSRF protection via cookies

## UI Features

The calendar UI provides:

1. **Week View**: Default view showing hourly slots
2. **Month View**: For broader planning
3. **Click & Drag**: To create new availability blocks
4. **One-Click Editing**: View and modify existing blocks
5. **Recurrence Support**: Create recurring availability patterns
6. **Visual Indicators**: Color-coding for different statuses

## Integration Points

This calendar system integrates with:

1. **Authentication System**: To identify users
2. **Role-Based Access Control**: To restrict actions
3. **Google Calendar API**: For external calendar syncing
4. **Notification System**: For alerts when changes affect bookings
