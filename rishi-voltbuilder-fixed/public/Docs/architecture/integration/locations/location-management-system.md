# Location Management System

## Overview

The Location Management System is a core component of the Rishi Workforce Management platform that enables users to create, view, manage, and search for locations where events and services take place. This document provides a comprehensive overview of the system's architecture, components, and implementation details.

## System Architecture

The Location Management System follows a modular architecture:

```
┌───────────────────────────────────────────────────────────┐
│                  Location Management System                │
│                                                           │
│  ┌─────────────────┐    ┌────────────────┐    ┌─────────┐ │
│  │  Map Interface  │    │  List Interface │    │ Search  │ │
│  └─────────────────┘    └────────────────┘    └─────────┘ │
│                                                           │
│  ┌─────────────────┐    ┌────────────────┐    ┌─────────┐ │
│  │ Location Detail │    │   Filtering    │    │  Stats   │ │
│  └─────────────────┘    └────────────────┘    └─────────┘ │
│                                                           │
│  ┌─────────────────┐    ┌────────────────┐               │
│  │  Admin Features │    │ Client Features│               │
│  └─────────────────┘    └────────────────┘               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Location Data Model

The system uses a comprehensive data model to represent locations:

```typescript
// Core location entity
interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  type: LocationType;
  description?: string;
  contactInfo?: ContactInfo;
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  metadata?: Record<string, any>;
}

// Status types
enum LocationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  INACTIVE = "inactive",
}

// Location types
enum LocationType {
  DISPENSARY = "dispensary",
  DISTRIBUTION_CENTER = "distribution_center",
  CORPORATE_OFFICE = "corporate_office",
  EVENT_VENUE = "event_venue",
  OTHER = "other",
}

// Contact information
interface ContactInfo {
  name?: string;
  phone?: string;
  email?: string;
  hours?: BusinessHours;
}

// Business hours
interface BusinessHours {
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
}

interface TimeRange {
  open: string; // HH:MM format
  close: string; // HH:MM format
}
```

### 2. Map Interface

The Map Interface provides an interactive Google Maps-based visualization of locations:

- **Features**:

  - Custom markers with status-based styling
  - Interactive InfoWindows with location details
  - Clustering for areas with many locations
  - Map controls for zoom, pan, and view options
  - Filtering capabilities integrated with the map

- **Implementation**:
  - Uses Google Maps JavaScript API
  - Custom styling for the map interface
  - Responsive design for different screen sizes
  - Performance optimizations for large numbers of markers

### 3. List Interface

The List Interface provides a tabular view of locations with advanced features:

- **Features**:

  - Sortable and filterable columns
  - Pagination for large datasets
  - Quick action buttons for common operations
  - Status indicators with color coding
  - Bulk selection and operations

- **Implementation**:
  - Uses virtualized lists for performance
  - Server-side pagination for large datasets
  - Client-side filtering for responsive UX
  - Keyboard navigation support

### 4. Filtering System

The system includes a powerful filtering mechanism:

- **Filter Types**:

  - State/Province filters
  - City filters
  - Status filters
  - Type filters
  - Date range filters
  - Custom attribute filters

- **Implementation**:
  - Compact horizontal filter bar design
  - Visual feedback for active filters
  - Filter combinations with AND/OR logic
  - Saved filter presets for frequent queries

### 5. Location Detail View

The Location Detail view provides comprehensive information about a location:

- **Features**:

  - Full location information display
  - Map with precise location
  - Status history and approval workflow
  - Associated events and bookings
  - Edit and management options
  - Media gallery for location photos

- **Implementation**:
  - Tabbed interface for organizing information
  - Responsive layout for different screen sizes
  - Permission-based display of sensitive information
  - Real-time updates via WebSocket

### 6. Admin Features

Administrative features for location management:

- **Features**:

  - Location approval workflow
  - Bulk location management
  - Location audit history
  - Advanced filtering and search
  - Location analytics and reporting

- **Implementation**:
  - Role-based access control
  - Multi-step approval process
  - Audit logging for all changes
  - Analytics dashboard with key metrics

### 7. Client Features

Client-focused features for location interaction:

- **Features**:

  - Simplified location viewing
  - Saved favorite locations
  - Location requests
  - Simplified filtering and search
  - Integration with booking system

- **Implementation**:
  - Streamlined interface for common tasks
  - Personalized location preferences
  - Simplified map interaction
  - Integration with booking workflow

## Implementation Details

### Technology Stack

- **Frontend**:

  - React components for UI elements
  - Google Maps JavaScript API for mapping
  - TanStack Query for data fetching and caching
  - React Hook Form for form handling
  - Tailwind CSS for styling

- **Backend**:
  - Next.js API routes for data endpoints
  - Drizzle ORM for database interactions
  - PostgreSQL for data storage
  - Geocoding API for address validation
  - Event-driven architecture for updates

### Key Files and Components

- `/app/locations/page.tsx`: Main locations page
- `/app/locations/[id]/page.tsx`: Location detail page
- `/app/locations/add/page.tsx`: Add location page
- `/components/locations/LocationMap.tsx`: Map component
- `/components/locations/LocationList.tsx`: List component
- `/components/locations/LocationFilters.tsx`: Filtering component
- `/components/locations/LocationDetail.tsx`: Detail view component
- `/app/api/locations/*`: API endpoints for location data
- `/app/services/locations/*`: Location service implementations

### Data Flow

1. **Location Creation**:

   - User enters location details in form
   - Address is validated and geocoded
   - Location is created with PENDING status
   - Event is published for location creation
   - Notification sent to approvers

2. **Location Listing**:

   - User navigates to locations page
   - Client fetches location data with filters
   - Data is rendered in map or list view
   - User can interact with locations

3. **Location Approval**:
   - Admin reviews pending locations
   - Location details are validated
   - Admin approves or rejects location
   - Event is published for status change
   - Notification sent to relevant users

## User Interfaces

### Map View

The Map View provides a spatial visualization of locations:

- Interactive Google Map with custom styling
- Markers color-coded by location status
- Marker clustering for dense areas
- Custom InfoWindows with key information and action buttons
- Map controls for zoom, pan, and view options
- Filter controls integrated with the map

### List View

The List View provides a tabular representation of locations:

- Responsive data table with key location information
- Sortable and filterable columns
- Status indicators with color coding
- Quick action buttons for common operations
- Pagination for large datasets
- Bulk selection options

### Filter Bar

The Filter Bar enables users to refine location results:

- Compact horizontal design
- Filter groups with visual separators
- State, city, status, and type filters
- Date range filters for creation/approval dates
- Save and load filter presets
- Clear filters button

### Statistics Display

The Statistics Display provides at-a-glance metrics:

- Horizontal format with visual separators
- Count of total locations
- Breakdown by status (Approved, Pending, Rejected)
- Color-coded for easy interpretation
- Interactive elements for detailed views

## Mobile Responsiveness

The Location Management System is fully responsive across devices:

- **Mobile View**:

  - Stack layout for map and list
  - Simplified controls for touch interaction
  - Collapsible filters and information panels
  - Optimized marker size and clustering
  - Performance optimizations for mobile devices

- **Tablet View**:

  - Adaptive layout based on orientation
  - Sidebar navigation for filters and details
  - Touch-friendly controls and buttons
  - Responsive information displays

- **Desktop View**:
  - Full-featured interface with all controls
  - Side-by-side map and list options
  - Advanced filtering and bulk operations
  - Keyboard navigation and shortcuts

## Permissions and Access Control

The system implements role-based access control:

- **Super Admins**:

  - Full access to all location features
  - Approval rights for all locations
  - Access to analytics and reporting
  - System configuration capabilities

- **Organization Admins**:

  - Management of locations within their organization
  - Approval rights for their organization's locations
  - Access to organization-specific analytics

- **Field Managers**:

  - View and edit locations in their regions
  - Request new locations
  - Limited approval capabilities

- **Standard Users**:
  - View approved locations
  - Request new locations
  - Save favorite locations

## Integration Points

The Location Management System integrates with several other components:

- **Booking System**: Locations are used as venues for bookings and events
- **Staff Management**: Locations are assigned to staff for work
- **Client Management**: Locations are associated with client organizations
- **Reporting System**: Location data is used in analytics and reports
- **Notification System**: Location events trigger notifications

## Current Status and Future Enhancements

### Implementation Status

The Location Management System is fully implemented with all core features:

- ✅ Map interface with Google Maps integration
- ✅ List interface with filtering and sorting
- ✅ Location detail view with comprehensive information
- ✅ Location creation and editing
- ✅ Approval workflow
- ✅ Mobile-responsive design
- ✅ Integration with event system
- ✅ Role-based access control

### Future Enhancements

Planned enhancements for future releases:

1. **Enhanced Analytics**:

   - Location heatmaps for activity density
   - Performance metrics by location
   - Predictive analytics for location planning

2. **Advanced Search**:

   - Full-text search across all location data
   - Radius-based search for proximity
   - Natural language query support

3. **Media Management**:

   - Enhanced photo gallery for locations
   - 360° virtual tours integration
   - Video support for location showcases

4. **Integration Enhancements**:
   - Calendar integration for location availability
   - External directory synchronization
   - Advanced mapping services integration
