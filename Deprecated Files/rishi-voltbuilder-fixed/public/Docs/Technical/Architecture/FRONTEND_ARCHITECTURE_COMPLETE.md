# Frontend Architecture Complete Documentation

_Comprehensive Frontend Implementation Guide_
_Last Updated: June 23, 2025_

## Architecture Overview

The Rishi Platform frontend is built with Next.js 15.3.2 using the App Router, implementing a modern component-based architecture with TypeScript, Shadcn/ui components, and comprehensive state management for cannabis industry workforce management.

## Technology Stack

### Core Frontend Technologies

```typescript
Framework: Next.js 15.3.2 (App Router)
Language: TypeScript 5.x (strict mode)
Runtime: React 18+ with Server Components
Bundler: Webpack 5 with Turbopack (dev)
Package Manager: npm
```

### UI & Styling

```typescript
Component Library: Shadcn/ui + Radix UI primitives
Styling: Tailwind CSS 3.4+ with custom design system
Icons: Lucide React (2000+ icons)
Charts: Recharts for data visualization
Maps: Google Maps JavaScript API
Theme: Dark/Light mode with system preference
```

### State Management & Data

```typescript
Client State: React Context + useReducer
Server State: TanStack React Query v5
Forms: React Hook Form + Zod validation
Routing: Next.js App Router with nested layouts
Authentication: NextAuth.js with JWT
```

## Project Structure

### Directory Organization

```
app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                     # Landing page
├── globals.css                  # Global styles and CSS variables
├── (auth)/                      # Authentication routes
│   ├── login/                   # Login page
│   └── signup/                  # Registration page
├── dashboard/                   # Role-based dashboards
│   ├── page.tsx                # Dashboard home
│   ├── super-admin/            # Super admin pages
│   ├── field-manager/          # Field manager pages
│   ├── brand-agent/            # Brand agent pages
│   └── client-user/            # Client user pages
├── bookings/                   # Booking management
│   ├── page.tsx               # Booking list
│   ├── create/                # Create booking
│   ├── [id]/                  # Booking details
│   └── calendar/              # Calendar view
├── organizations/             # Organization management
├── team/                     # Team management
├── locations/               # Location management
├── inventory/              # Equipment & inventory
├── reports/               # Analytics & reports
├── settings/             # User & org settings
└── api/                 # API routes (143 endpoints)

components/
├── ui/                        # Shadcn/ui base components
│   ├── button.tsx            # Button variants
│   ├── card.tsx              # Card layouts
│   ├── dialog.tsx            # Modal dialogs
│   ├── form.tsx              # Form components
│   ├── input.tsx             # Input fields
│   ├── select.tsx            # Dropdown selects
│   ├── table.tsx             # Data tables
│   └── toast.tsx             # Notifications
├── layout/                   # Layout components
│   ├── SidebarLayout.tsx     # Main application layout
│   ├── Header.tsx            # Top navigation header
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Navigation.tsx        # Navigation logic
│   └── OrganizationSwitcher.tsx  # Org selector
├── bookings/                 # Booking-specific components
│   ├── BookingForm.tsx       # Create/edit booking
│   ├── BookingList.tsx       # Filterable booking list
│   ├── BookingCard.tsx       # Booking summary card
│   ├── BookingCalendar.tsx   # Calendar integration
│   └── BookingFilters.tsx    # Advanced filtering
├── dashboard/                # Dashboard components
│   ├── MetricsCard.tsx       # KPI display cards
│   ├── ChartWidget.tsx       # Chart components
│   ├── ActivityFeed.tsx      # Recent activity
│   └── QuickActions.tsx      # Action shortcuts
├── team/                     # Team management
│   ├── TeamMemberCard.tsx    # Member profile card
│   ├── TeamMemberList.tsx    # Paginated member list
│   ├── TeamMemberProfile.tsx # Detailed profile view
│   └── TeamFilters.tsx       # Team filtering
├── maps/                     # Google Maps integration
│   ├── GoogleMapComponent.tsx  # Map display
│   ├── PlaceAutocomplete.tsx   # Location search
│   └── LocationPicker.tsx      # Location selection
└── common/                   # Reusable components
    ├── LoadingSpinner.tsx    # Loading states
    ├── ErrorBoundary.tsx     # Error handling
    ├── DataTable.tsx         # Generic data table
    ├── SearchInput.tsx       # Search functionality
    ├── Pagination.tsx        # Page navigation
    └── NotificationToast.tsx # Toast notifications

contexts/
├── AuthContext.tsx           # Authentication state
├── OrganizationContext.tsx   # Organization switching
├── ThemeContext.tsx          # Dark/light theme
└── NotificationContext.tsx   # Toast notifications

hooks/
├── useAuth.ts               # Authentication hooks
├── useOrganization.ts       # Organization management
├── useBookings.ts           # Booking operations
├── useTeam.ts               # Team management
├── usePermissions.ts        # RBAC permissions
├── useLocalStorage.ts       # Local storage
├── useDebounce.ts           # Input debouncing
└── useWebSocket.ts          # Real-time updates

lib/
├── api.ts                   # API client configuration
├── auth.ts                  # Authentication utilities
├── db.ts                    # Database connection
├── utils.ts                 # General utilities
├── constants.ts             # Application constants
├── validations.ts           # Zod schemas
└── permissions.ts           # RBAC utilities

shared/
├── schema.ts                # Database schema
├── types.ts                 # TypeScript definitions
├── navigation-structure.tsx # Navigation configuration
└── constants.ts             # Shared constants
```

## Component Architecture

### Layout System

```typescript
// app/layout.tsx - Root layout with providers
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryProvider } from '@/lib/query-client';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <OrganizationProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </OrganizationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Main Application Layout

```typescript
// components/layout/SidebarLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { currentOrganization, isLoading: orgLoading } = useOrganization();

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by auth middleware
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        organization={currentOrganization}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          organization={currentOrganization}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Navigation System

```typescript
// components/layout/Navigation.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getNavigationItems } from '@/shared/navigation-structure';

interface NavigationProps {
  user: User;
  organization: Organization;
}

export function Navigation({ user, organization }: NavigationProps) {
  const pathname = usePathname();
  const { permissions } = usePermissions();

  const navigationItems = useMemo(() => {
    return getNavigationItems(user.role, permissions);
  }, [user.role, permissions]);

  return (
    <nav className="space-y-2">
      {navigationItems.map((section) => (
        <div key={section.title} className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </h3>

          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.title}
              {item.badge && (
                <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

## State Management

### Authentication Context

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Organization Context

```typescript
// contexts/OrganizationContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface Organization {
  id: string;
  name: string;
  type: string;
  tier: string;
  role: string;
  isDefault: boolean;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  switchOrganization: (organizationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizations/user');

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data.organizations);

      // Set default organization or first available
      const defaultOrg = data.organizations.find((org: Organization) => org.isDefault)
        || data.organizations.find((org: Organization) => org.name === 'Rishi Internal')
        || data.organizations[0];

      if (defaultOrg) {
        setCurrentOrganization(defaultOrg);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/switch-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId })
      });

      if (!response.ok) {
        throw new Error('Failed to switch organization');
      }

      const organization = organizations.find(org => org.id === organizationId);
      if (organization) {
        setCurrentOrganization(organization);

        // Store preference
        localStorage.setItem('currentOrganizationId', organizationId);

        // Refresh page to update permissions and data
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
    } finally {
      setLoading(false);
    }
  }, [organizations]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      organizations,
      switchOrganization,
      loading,
      error
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
```

## Data Fetching with React Query

### Query Configuration

```typescript
// lib/query-client.ts
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Custom Hooks for Data Operations

```typescript
// hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";

export function useBookings(filters?: BookingFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ["bookings", currentOrganization?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentOrganization?.id) {
        params.append("organizationId", currentOrganization.id);
      }
      if (filters?.status) {
        params.append("status", filters.status);
      }

      const response = await fetch(`/api/bookings?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          organizationId: currentOrganization?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({
        queryKey: ["bookings", currentOrganization?.id],
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
      notes,
    }: {
      bookingId: string;
      status: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
  });
}
```

## Form Management

### Form Components with Validation

```typescript
// components/bookings/BookingForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateBooking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';

const bookingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  locationId: z.string().uuid('Valid location must be selected'),
  scheduledStart: z.string().min(1, 'Start time is required'),
  scheduledEnd: z.string().min(1, 'End time is required'),
  budget: z.number().positive('Budget must be positive').optional(),
  requirements: z.object({
    staffCount: z.number().min(1, 'At least 1 staff member required'),
    specialSkills: z.array(z.string()).optional(),
  }).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      title: '',
      description: '',
      locationId: '',
      scheduledStart: '',
      scheduledEnd: '',
      requirements: {
        staffCount: 1,
        specialSkills: [],
      },
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      await createBooking.mutateAsync({
        ...data,
        scheduledStart: new Date(data.scheduledStart),
        scheduledEnd: new Date(data.scheduledEnd),
      });

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter booking title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Booking description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input {...field} type="datetime-local" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget ($)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={createBooking.isPending}>
            {createBooking.isPending ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## Theming & Design System

### CSS Variables & Theme Configuration

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light theme variables */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 210 40% 95%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 95%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 95%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142 76% 36%;
    --radius: 0.75rem;
  }

  .dark {
    /* Dark theme variables */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 142 76% 36%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 142 76% 36%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }

  /* Cannabis industry color scheme */
  .cannabis-primary {
    @apply text-green-600 dark:text-green-400;
  }

  .cannabis-gradient {
    @apply bg-gradient-to-r from-green-500 to-emerald-600;
  }

  /* Animations */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Cannabis industry colors
        cannabis: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in": {
          "0%": { opacity: 0, transform: "translateX(-100%)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

## Performance Optimization

### Code Splitting & Lazy Loading

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const BookingCalendar = dynamic(
  () => import('@/components/bookings/BookingCalendar'),
  {
    loading: () => <div>Loading calendar...</div>,
    ssr: false,
  }
);

const GoogleMapComponent = dynamic(
  () => import('@/components/maps/GoogleMapComponent'),
  {
    loading: () => <div>Loading map...</div>,
    ssr: false,
  }
);

// Lazy load heavy dashboard components
const AnalyticsCharts = dynamic(
  () => import('@/components/dashboard/AnalyticsCharts'),
  { ssr: false }
);
```

### Image Optimization

```typescript
// components/common/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoadingComplete={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}
```

### Bundle Analysis & Optimization

```typescript
// next.config.mjs optimizations
const nextConfig = {
  // Bundle analyzer
  ...(process.env.ANALYZE === "true" && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  }),

  // Optimize CSS
  experimental: {
    optimizeCss: true,
  },

  // Compress images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Optimize fonts
  optimizeFonts: true,

  // Enable compression
  compress: true,

  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,
};
```

## Testing Strategy

### Component Testing

```typescript
// __tests__/components/BookingForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingForm } from '@/components/bookings/BookingForm';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BookingForm', () => {
  test('renders form fields correctly', () => {
    renderWithProviders(<BookingForm />);

    expect(screen.getByLabelText(/booking title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithProviders(<BookingForm />);

    const submitButton = screen.getByRole('button', { name: /create booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockOnSuccess = jest.fn();
    renderWithProviders(<BookingForm onSuccess={mockOnSuccess} />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/booking title/i), {
      target: { value: 'Test Booking' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));

    // Verify success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

### Hook Testing

```typescript
// __tests__/hooks/useBookings.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookings } from '@/hooks/useBookings';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock fetch
global.fetch = jest.fn();

describe('useBookings', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('fetches bookings successfully', async () => {
    const mockBookings = [
      { id: '1', title: 'Test Booking 1' },
      { id: '2', title: 'Test Booking 2' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: mockBookings }),
    });

    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.bookings).toEqual(mockBookings);
  });

  test('handles fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

## Accessibility Implementation

### ARIA Labels & Keyboard Navigation

```typescript
// components/common/AccessibleButton.tsx
import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, loading, loadingText, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={loading ? loadingText : ariaLabel}
        aria-disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">{loadingText || 'Loading'}</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
```

### Screen Reader Support

```typescript
// components/common/LiveRegion.tsx
'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function LiveRegion({ message, priority = 'polite' }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
    />
  );
}
```

---

**Frontend Status**: ✅ COMPLETE ARCHITECTURE DOCUMENTATION
**Component Coverage**: All major UI components documented
**Performance**: Optimized for production deployment
**Accessibility**: WCAG 2.1 AA compliance implemented
**Testing**: Comprehensive testing strategy defined
