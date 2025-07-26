# Rishi Workforce Management - Booking System

## Overview

The booking system is a critical component of the Rishi Workforce Management platform, allowing clients to create and manage bookings for events and services. The system supports both single events and recurring series, with each event having specific date/time windows and multiple activities.

This documentation covers the technical implementation, architecture decisions, and integration points for the booking system.

## System Architecture

The booking system follows our microservices-within-Next.js architecture pattern, with a clear separation of concerns:

1. **Frontend Components** (`/components/bookings/*`): UI components for booking creation and management
2. **API Routes** (`/app/api/bookings/*`): RESTful endpoints for booking CRUD operations
3. **Event Bus Integration** (`/app/events/booking-events.ts`): Event-driven communication for booking-related events
4. **Database Access** (via Drizzle ORM): Data persistence and querying
5. **Shared Types** (`/shared/schema.ts`): Type definitions used across both frontend and backend

### Event-Driven Architecture

The booking system leverages our event-driven architecture for several key workflows:

1. When a booking is created, a `booking.created` event is emitted
2. When a booking with a new location is submitted, a `location.requested` event is triggered
3. When a booking is approved/rejected, corresponding events notify relevant parties

This event-driven approach ensures loose coupling between components and enables asynchronous processing.

## Booking Form Implementation

The booking form (`BookingFormFinal.tsx`) is a complex, multi-section form that handles:

1. Event title generation
2. Date and time selection
3. Location selection (with typeahead search)
4. Recurring event configuration
5. Calendar invite generation
6. Activity selection and configuration
7. Client association

### Key Technical Features

#### Real-time Title Generation

The form auto-generates the event title based on other form fields and updates it in real-time as changes are made:

```tsx
// Updates the title whenever dependent fields change
useEffect(() => {
  const clientName = selectedClient?.name || "";
  const locationName = selectedLocation?.name || "";
  const formattedDate = date ? format(date, "MMM d, yyyy") : "";

  // Generate title based on available information
  const generatedTitle = [clientName, locationName, formattedDate]
    .filter(Boolean)
    .join(" - ");

  // Only update if fields have values and title should be auto-generated
  if (generatedTitle && autoGenerateTitle) {
    form.setValue("title", generatedTitle);
  }
}, [selectedClient, selectedLocation, date, autoGenerateTitle]);
```

#### Enhanced Date Picker

We've implemented a custom-styled React DatePicker component that:

1. Provides consistent styling in both light and dark modes
2. Offers improved mobile support
3. Features subtle animations and interactive elements
4. Maintains proper alignment and sizing across all elements

The date picker is integrated within a Popover component for better accessibility and user experience.

#### Time Selection

The time selection component has been redesigned to:

1. Use 12-hour format with AM/PM indicators
2. Display 3-letter timezone abbreviations (EDT, PST, etc.)
3. Offer 30-minute increment options (00:00-23:30)
4. Provide clear visual indicators for selection

#### Recurring Events

The recurring event functionality allows users to:

1. Set frequency (daily, weekly, monthly)
2. Specify number of occurrences
3. Preview the recurring series dates
4. Configure exceptions to the pattern

#### Location Selection and Integration

The location selection component integrates with our location management microservice:

1. Type-ahead search of existing locations
2. Ability to request new locations
3. Google Maps integration for location visualization
4. Status indication (approved, pending, rejected)

## Integration with Other Systems

### Location Management System

The booking system integrates with the location management system via:

1. Shared location DTOs in the schema
2. Event-driven communication for location approval workflows
3. Real-time status updates via WebSocket connections

```typescript
// Example of location event subscription
locationEventBus.subscribe("location.approved", (location) => {
  // Update any pending bookings with this location
  bookingService.updatePendingBookingsWithLocation(location);
});
```

### User Management and RBAC

The booking system implements role-based access controls:

1. Admins can view and manage all bookings
2. Field Managers can handle logistics and staff allocation
3. Clients can only see and manage their own bookings

## Data Model

The core booking data model includes:

```typescript
interface Booking {
  id: string; // UUID format
  title: string;
  clientId: string;
  locationId: string;
  date: Date;
  startTime: string;
  endTime: string;
  timezone: string;
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  activities: Activity[];
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface RecurringConfig {
  frequency: "daily" | "weekly" | "monthly";
  occurrences: number;
  endDate?: Date;
  exceptions?: Date[];
}

interface Activity {
  id: string;
  bookingId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  staffRequired: number;
}

enum BookingStatus {
  Draft = "draft",
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Canceled = "canceled",
  Completed = "completed",
}
```

## Technical Implementation Details

### Form Validation

The booking form uses Zod schemas for robust validation:

```typescript
const bookingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  locationId: z.string().uuid("Please select a valid location"),
  // Additional fields...
});
```

### Client-Side State Management

We use React Query for efficient data fetching and caching:

```typescript
// Example of fetching available locations
const { data: locations, isLoading } = useQuery({
  queryKey: ["/api/locations"],
  queryFn: getQueryFn(),
});

// Example of creating a new booking
const createBookingMutation = useMutation({
  mutationFn: async (booking: BookingData) => {
    const res = await apiRequest("POST", "/api/bookings", booking);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    router.push("/bookings");
  },
});
```

### Server-Side Implementation

The booking API routes handle the business logic:

```typescript
// POST /api/bookings
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  try {
    // Validate booking data
    const bookingData = bookingSchema.parse(body);

    // Create booking in database
    const booking = await db
      .insert(bookings)
      .values({
        ...bookingData,
        id: crypto.randomUUID(),
        createdBy: session.user.id,
        status: bookingData.draft ? "draft" : "pending",
      })
      .returning();

    // Emit booking created event
    eventBus.emit("booking.created", booking);

    return Response.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

## Performance Optimizations

Several optimizations have been implemented:

1. **Memoization**: Components and expensive calculations are memoized to reduce rerenders
2. **Lazy Loading**: Large components are loaded lazily to improve initial load time
3. **Chunked API Responses**: For large data sets, we implement pagination and chunking
4. **Optimistic Updates**: UI updates optimistically before server confirmation for better UX

## Testing Strategy

The booking system includes:

1. **Unit Tests**: Testing individual components and functions
2. **Integration Tests**: Testing interactions between components
3. **E2E Tests**: Full workflow tests from booking creation to completion

## Accessibility Considerations

The booking form implements various accessibility features:

1. Proper ARIA labels and roles
2. Keyboard navigation support
3. Focus management
4. Screen reader optimizations
5. Color contrast compliance

## Mobile Responsiveness

The booking system is designed with a mobile-first approach:

1. Responsive layouts that adapt to screen size
2. Touch-friendly interactive elements
3. Simplified views for small screens
4. Performance optimizations for mobile devices
