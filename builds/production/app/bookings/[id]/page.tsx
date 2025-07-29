import { Suspense } from "react";
import { notFound } from "next/navigation";
// Remove database imports for build-time compatibility
// // import { db } from "@/db";
// // import { eq, and } from "drizzle-orm";
// import { bookings, organizations, users } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingApproval from "../../../components/bookings/BookingApproval";
import BookingManagement from "../../../components/bookings/BookingManagement";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fetches the booking data via API call (mobile-compatible)
 */
async function getBookingData(bookingId: string) {
  // For mobile build compatibility, return placeholder data
  if (process.env.NEXT_PUBLIC_BUILD_TYPE === 'mobile-server') {
    return {
      booking: {
        id: bookingId,
        title: 'Sample Booking',
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(),
      },
      client: {
        name: 'Sample Client'
      },
      fieldManagers: []
    };
  }
  
  // In runtime, this would make API calls
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;
  const bookingData = await getBookingData(id);

  if (!bookingData) {
    notFound();
  }

  const { booking, client, fieldManagers } = bookingData;

  // Format booking data for display
  const bookingDetails = {
    id: booking.id,
    title: booking.title,
    clientName: client?.name || "Unknown Client",
    location: "Location Name", // This would come from a join with locations
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    isRecurring: booking.isRecurring,
    recurrencePattern: booking.recurrencePattern,
    staffCount: booking.staffCount || 1,
    specialRequirements: booking.notes || undefined,
  };

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/bookings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{booking.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="py-4">
          {booking.status === "pending" && (
            <div className="mb-6">
              <BookingApproval
                booking={bookingDetails}
                onApproved={() => {}} // This would refresh the page in a client component
                onRejected={() => {}}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Booking Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Client
                  </p>
                  <p>{client?.name || "Unknown Client"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p>
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </p>
                  <p>{booking.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <p>{booking.endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recurring
                  </p>
                  <p>{booking.isRecurring ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Staff Count
                  </p>
                  <p>{booking.staffCount || 1}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Additional Details
              </h2>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1">
                  {booking.description || "No description provided."}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1">{booking.notes || "No notes provided."}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="py-4">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <BookingManagement bookingId={booking.id} managers={fieldManagers} />
          </Suspense>
        </TabsContent>

        <TabsContent value="comments" className="py-4">
          <div className="text-center p-8 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">
              No comments available for this booking.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="py-4">
          <div className="text-center p-8 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">
              Booking history will be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
