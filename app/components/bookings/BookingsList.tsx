import { useState, useMemo } from "react";
import { format, isPast, isFuture } from "date-fns";
import { useRouter, Link } from "next/navigation";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Booking, BOOKING_STATUS, BOOKING_PRIORITY } from "@/shared/schema";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("upcoming");

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

      if (selectedTab === "past") {
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
    setSearchTerm("");
    setSelectedStatus(null);
    setSelectedPriority(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Bookings</h2>
          <p className="text-muted-foreground">
            Manage your booking requests and events
          </p>
        </div>
        <Button onClick={onNewBooking}>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={selectedStatus || ""}
            onValueChange={(value) => setSelectedStatus(value || null)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
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
            value={selectedPriority || ""}
            onValueChange={(value) => setSelectedPriority(value || null)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.LOW}>Low</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.HIGH}>High</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedStatus || selectedPriority) && (
            <Button variant="outline" onClick={clearFilters} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for different booking categories */}
      <Tabs
        defaultValue="upcoming"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All{" "}
            <Badge variant="outline" className="ml-2">
              {categorizedBookings.all.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming{" "}
            <Badge variant="outline" className="ml-2">
              {categorizedBookings.upcoming.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past{" "}
            <Badge variant="outline" className="ml-2">
              {categorizedBookings.past.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recurring">
            Recurring{" "}
            <Badge variant="outline" className="ml-2">
              {categorizedBookings.recurring.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content for tabs */}
        {["all", "upcoming", "past", "recurring"].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              </div>
            ) : sortedBookings.length === 0 ? (
              <EmptyState
                title={`No ${tab} bookings found`}
                description={
                  searchTerm || selectedStatus || selectedPriority
                    ? "Try clearing your filters or search"
                    : `You don't have any ${tab} bookings yet`
                }
                onNewBooking={onNewBooking}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    organizationName={
                      organizations[booking.clientOrganizationId]?.name ||
                      "Unknown Organization"
                    }
                    locationName={
                      booking.locationId
                        ? locations[booking.locationId]?.name ||
                          "Unknown Location"
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
              className="bg-destructive text-destructive-foreground"
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
    <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button onClick={onNewBooking}>
        <Plus className="mr-2 h-4 w-4" /> New Booking
      </Button>
    </div>
  );
}

// Status badge with appropriate colors
function StatusBadge({ status }: { status: string }) {
  const getVariant = () => {
    switch (status) {
      case BOOKING_STATUS.DRAFT:
        return "outline";
      case BOOKING_STATUS.PENDING:
        return "secondary";
      case BOOKING_STATUS.APPROVED:
        return "success";
      case BOOKING_STATUS.REJECTED:
        return "destructive";
      case BOOKING_STATUS.CANCELED:
        return "destructive";
      case BOOKING_STATUS.COMPLETED:
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant() as any} className="capitalize">
      {status}
    </Badge>
  );
}

// Priority badge with appropriate colors
function PriorityBadge({ priority }: { priority: string }) {
  const getVariant = () => {
    switch (priority) {
      case BOOKING_PRIORITY.LOW:
        return "outline";
      case BOOKING_PRIORITY.MEDIUM:
        return "secondary";
      case BOOKING_PRIORITY.HIGH:
        return "warning";
      case BOOKING_PRIORITY.URGENT:
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant() as any} className="capitalize">
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
      className={cn("transition-all duration-200", isPastEvent && "opacity-80")}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{booking.title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {organizationName}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Open menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit booking
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <StatusBadge status={booking.status} />
            {booking.isRecurring && (
              <Badge variant="outline">
                <RefreshCw className="mr-1 h-3 w-3" /> Recurring
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {format(startDate, "MMM d, yyyy")}
              {!isSameDay(startDate, endDate) &&
                ` - ${format(endDate, "MMM d, yyyy")}`}
            </div>

            {booking.startTime && booking.endTime && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                {booking.startTime} - {booking.endTime}
              </div>
            )}

            {locationName && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {locationName}
              </div>
            )}

            {booking.staffCount > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {booking.staffCount} staff required
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <PriorityBadge priority={booking.priority} />
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/bookings/${booking.id}`}>
            <FileText className="mr-2 h-4 w-4" /> View Details
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
