&quot;use client&quot;;

import { useState, useMemo } from &quot;react&quot;;
import { format, isPast, isFuture } from &quot;date-fns&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import {
  Calendar,
  Clock,
  Edit,
  FileText,
  Filter,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash,
  Users,
} from &quot;lucide-react&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from &quot;@/components/ui/alert-dialog&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { Booking, BOOKING_STATUS, BOOKING_PRIORITY } from &quot;@shared/schema&quot;;

interface BookingsListProps {
  bookings: Booking[];
  organizations?: Record<string, { name: string; id: string }>;
  locations?: Record<string, { name: string; id: string }>;
  onNewBooking: () => void;
  onEditBooking: (bookingId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  isLoading?: boolean;
}

export function BookingsList({
  bookings,
  organizations = {},
  locations = {},
  onNewBooking,
  onEditBooking,
  onDeleteBooking,
  isLoading = false,
}: BookingsListProps) {
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(&quot;upcoming&quot;);

  // Booking to delete confirmation
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  // Filter bookings based on search term, status, and priority
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      const searchMatch =
        !searchTerm ||
        booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizations[booking.clientOrganizationId]?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = !selectedStatus || booking.status === selectedStatus;

      // Priority filter
      const priorityMatch =
        !selectedPriority || booking.priority === selectedPriority;

      return searchMatch && statusMatch && priorityMatch;
    });
  }, [bookings, searchTerm, selectedStatus, selectedPriority, organizations]);

  // Categorize bookings for tabs
  const categorizedBookings = useMemo(() => {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    const recurring: Booking[] = [];

    filteredBookings.forEach((booking) => {
      if (booking.isRecurring) {
        recurring.push(booking);
      }

      const endDate = new Date(booking.endDate);
      if (isPast(endDate)) {
        past.push(booking);
      } else {
        upcoming.push(booking);
      }
    });

    return {
      all: filteredBookings,
      upcoming,
      past,
      recurring,
    };
  }, [filteredBookings]);

  // Get bookings for the current tab
  const currentBookings = useMemo(() => {
    return categorizedBookings[selectedTab as keyof typeof categorizedBookings];
  }, [categorizedBookings, selectedTab]);

  // Sort bookings by start date, newest first for upcoming, oldest first for past
  const sortedBookings = useMemo(() => {
    return [...currentBookings].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      if (selectedTab === &quot;past&quot;) {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });
  }, [currentBookings, selectedTab]);

  // Handle booking deletion
  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
  };

  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      onDeleteBooking(bookingToDelete);
      setBookingToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setBookingToDelete(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm(&quot;&quot;);
    setSelectedStatus(null);
    setSelectedPriority(null);
  };

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header with actions */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h2 className=&quot;text-2xl font-semibold&quot;>Bookings</h2>
          <p className=&quot;text-muted-foreground&quot;>
            Manage your booking requests and events
          </p>
        </div>
        <Button onClick={onNewBooking}>
          <Plus className=&quot;mr-2 h-4 w-4&quot; /> New Booking
        </Button>
      </div>

      {/* Filters and search */}
      <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
        <div className=&quot;relative flex-grow&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search bookings...&quot;
            className=&quot;pl-8&quot;
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className=&quot;flex gap-2&quot;>
          <Select
            value={selectedStatus || &quot;&quot;}
            onValueChange={(value) => setSelectedStatus(value || null)}
          >
            <SelectTrigger className=&quot;w-[130px]&quot;>
              <SelectValue placeholder=&quot;Status&quot; />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;&quot;>All Statuses</SelectItem>
              <SelectItem value={BOOKING_STATUS.DRAFT}>Draft</SelectItem>
              <SelectItem value={BOOKING_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={BOOKING_STATUS.APPROVED}>Approved</SelectItem>
              <SelectItem value={BOOKING_STATUS.REJECTED}>Rejected</SelectItem>
              <SelectItem value={BOOKING_STATUS.CANCELED}>Canceled</SelectItem>
              <SelectItem value={BOOKING_STATUS.COMPLETED}>
                Completed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedPriority || &quot;&quot;}
            onValueChange={(value) => setSelectedPriority(value || null)}
          >
            <SelectTrigger className=&quot;w-[130px]&quot;>
              <SelectValue placeholder=&quot;Priority&quot; />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;&quot;>All Priorities</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.LOW}>Low</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.HIGH}>High</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedStatus || selectedPriority) && (
            <Button variant=&quot;outline&quot; onClick={clearFilters} size=&quot;icon&quot;>
              <RefreshCw className=&quot;h-4 w-4&quot; />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for different booking categories */}
      <Tabs
        defaultValue=&quot;upcoming&quot;
        value={selectedTab}
        onValueChange={setSelectedTab}
        className=&quot;w-full&quot;
      >
        <TabsList className=&quot;grid w-full grid-cols-4&quot;>
          <TabsTrigger value=&quot;all&quot;>
            All{&quot; &quot;}
            <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
              {categorizedBookings.all.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value=&quot;upcoming&quot;>
            Upcoming{&quot; &quot;}
            <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
              {categorizedBookings.upcoming.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value=&quot;past&quot;>
            Past{&quot; &quot;}
            <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
              {categorizedBookings.past.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value=&quot;recurring&quot;>
            Recurring{&quot; &quot;}
            <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
              {categorizedBookings.recurring.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content for tabs */}
        {[&quot;all&quot;, &quot;upcoming&quot;, &quot;past&quot;, &quot;recurring&quot;].map((tab) => (
          <TabsContent key={tab} value={tab} className=&quot;pt-4&quot;>
            {isLoading ? (
              <div className=&quot;h-96 flex items-center justify-center&quot;>
                <div className=&quot;text-center&quot;>
                  <div className=&quot;animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4&quot;></div>
                  <p className=&quot;text-muted-foreground&quot;>Loading bookings...</p>
                </div>
              </div>
            ) : sortedBookings.length === 0 ? (
              <EmptyState
                title={`No ${tab} bookings found`}
                description={
                  searchTerm || selectedStatus || selectedPriority
                    ? &quot;Try clearing your filters or search&quot;
                    : `You don&apos;t have any ${tab} bookings yet`
                }
                onNewBooking={onNewBooking}
              />
            ) : (
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
                {sortedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    organizationName={
                      organizations[booking.clientOrganizationId]?.name ||
                      &quot;Unknown Organization&quot;
                    }
                    locationName={
                      booking.locationId
                        ? locations[booking.locationId]?.name ||
                          &quot;Unknown Location&quot;
                        : undefined
                    }
                    onEdit={() => onEditBooking(booking.id)}
                    onDelete={() => handleDeleteClick(booking.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete booking confirmation dialog */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this booking and all associated
              events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className=&quot;bg-destructive text-destructive-foreground&quot;
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Empty state component when no bookings found
function EmptyState({
  title,
  description,
  onNewBooking,
}: {
  title: string;
  description: string;
  onNewBooking: () => void;
}) {
  return (
    <div className=&quot;flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8 text-center&quot;>
      <Calendar className=&quot;h-12 w-12 text-muted-foreground mb-4&quot; />
      <h3 className=&quot;text-lg font-medium&quot;>{title}</h3>
      <p className=&quot;text-sm text-muted-foreground mb-4&quot;>{description}</p>
      <Button onClick={onNewBooking}>
        <Plus className=&quot;mr-2 h-4 w-4&quot; /> New Booking
      </Button>
    </div>
  );
}

// Status badge with appropriate colors
function StatusBadge({ status }: { status: string }) {
  const getVariant = () => {
    switch (status) {
      case BOOKING_STATUS.DRAFT:
        return &quot;outline&quot;;
      case BOOKING_STATUS.PENDING:
        return &quot;secondary&quot;;
      case BOOKING_STATUS.APPROVED:
        return &quot;success&quot;;
      case BOOKING_STATUS.REJECTED:
        return &quot;destructive&quot;;
      case BOOKING_STATUS.CANCELED:
        return &quot;destructive&quot;;
      case BOOKING_STATUS.COMPLETED:
        return &quot;default&quot;;
      default:
        return &quot;outline&quot;;
    }
  };

  return (
    <Badge variant={getVariant() as any} className=&quot;capitalize&quot;>
      {status}
    </Badge>
  );
}

// Priority badge with appropriate colors
function PriorityBadge({ priority }: { priority: string }) {
  const getVariant = () => {
    switch (priority) {
      case BOOKING_PRIORITY.LOW:
        return &quot;outline&quot;;
      case BOOKING_PRIORITY.MEDIUM:
        return &quot;secondary&quot;;
      case BOOKING_PRIORITY.HIGH:
        return &quot;warning&quot;;
      case BOOKING_PRIORITY.URGENT:
        return &quot;destructive&quot;;
      default:
        return &quot;outline&quot;;
    }
  };

  return (
    <Badge variant={getVariant() as any} className=&quot;capitalize&quot;>
      {priority}
    </Badge>
  );
}

// Individual booking card component
function BookingCard({
  booking,
  organizationName,
  locationName,
  onEdit,
  onDelete,
}: {
  booking: Booking;
  organizationName: string;
  locationName?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Format dates for display
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  const isPastEvent = isPast(endDate);

  return (
    <Card
      className={cn(&quot;transition-all duration-200&quot;, isPastEvent && &quot;opacity-80&quot;)}
    >
      <CardHeader className=&quot;pb-2&quot;>
        <div className=&quot;flex justify-between items-start&quot;>
          <div className=&quot;space-y-1&quot;>
            <CardTitle className=&quot;line-clamp-1&quot;>{booking.title}</CardTitle>
            <CardDescription className=&quot;line-clamp-1&quot;>
              {organizationName}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant=&quot;ghost&quot;
                className=&quot;h-8 w-8 p-0&quot;
                aria-label=&quot;Open menu&quot;
              >
                <MoreHorizontal className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align=&quot;end&quot;>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className=&quot;mr-2 h-4 w-4&quot; /> Edit booking
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className=&quot;text-destructive focus:text-destructive&quot;
              >
                <Trash className=&quot;mr-2 h-4 w-4&quot; /> Delete booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className=&quot;space-y-3&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <StatusBadge status={booking.status} />
            {booking.isRecurring && (
              <Badge variant=&quot;outline&quot;>
                <RefreshCw className=&quot;mr-1 h-3 w-3&quot; /> Recurring
              </Badge>
            )}
          </div>

          <div className=&quot;grid grid-cols-1 gap-2 text-sm&quot;>
            <div className=&quot;flex items-center text-muted-foreground&quot;>
              <Calendar className=&quot;mr-2 h-4 w-4&quot; />
              {format(startDate, &quot;MMM d, yyyy&quot;)}
              {!isSameDay(startDate, endDate) &&
                ` - ${format(endDate, &quot;MMM d, yyyy&quot;)}`}
            </div>

            {booking.startTime && booking.endTime && (
              <div className=&quot;flex items-center text-muted-foreground&quot;>
                <Clock className=&quot;mr-2 h-4 w-4&quot; />
                {booking.startTime} - {booking.endTime}
              </div>
            )}

            {locationName && (
              <div className=&quot;flex items-center text-muted-foreground&quot;>
                <MapPin className=&quot;mr-2 h-4 w-4&quot; />
                {locationName}
              </div>
            )}

            {booking.staffCount > 0 && (
              <div className=&quot;flex items-center text-muted-foreground&quot;>
                <Users className=&quot;mr-2 h-4 w-4&quot; />
                {booking.staffCount} staff required
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className=&quot;pt-0 flex justify-between&quot;>
        <PriorityBadge priority={booking.priority} />
        <Button variant=&quot;ghost&quot; size=&quot;sm&quot; asChild>
          <Link href={`/bookings/${booking.id}`}>
            <FileText className=&quot;mr-2 h-4 w-4" /> View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
