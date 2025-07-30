import { Suspense } from &quot;react&quot;;
import { notFound } from &quot;next/navigation&quot;;
import { db } from &quot;@/db&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { bookings, organizations, users } from &quot;@shared/schema&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { ArrowLeft } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import BookingApproval from &quot;../../../components/bookings/BookingApproval&quot;;
import BookingManagement from &quot;../../../components/bookings/BookingManagement&quot;;

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fetches the booking data from the database
 */
async function getBookingData(bookingId: string) {
  const bookingWithClient = await db
    .select({
      booking: bookings,
      client: organizations,
    })
    .from(bookings)
    .leftJoin(
      organizations,
      eq(bookings.clientOrganizationId, organizations.id),
    )
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!bookingWithClient.length) {
    return null;
  }

  // Get field managers for event assignment
  const fieldManagers = await db
    .select({
      id: users.id,
      name: users.fullName,
      username: users.username,
    })
    .from(users)
    .where(eq(users.role, &quot;internal_field_manager&quot;));

  return {
    ...bookingWithClient[0],
    fieldManagers: fieldManagers.map((manager) => ({
      id: manager.id,
      name: manager.name || manager.username,
    })),
  };
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
    clientName: client?.name || &quot;Unknown Client&quot;,
    location: &quot;Location Name&quot;, // This would come from a join with locations
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    isRecurring: booking.isRecurring,
    recurrencePattern: booking.recurrencePattern,
    staffCount: booking.staffCount || 1,
    specialRequirements: booking.notes || undefined,
  };

  return (
    <div className=&quot;container mx-auto py-4 space-y-6&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <div className=&quot;flex items-center&quot;>
          <Button variant=&quot;ghost&quot; size=&quot;icon&quot; asChild className=&quot;mr-2&quot;>
            <Link href=&quot;/bookings&quot;>
              <ArrowLeft className=&quot;h-5 w-5&quot; />
            </Link>
          </Button>
          <h1 className=&quot;text-2xl font-bold&quot;>{booking.title}</h1>
        </div>
        <div className=&quot;flex items-center gap-2&quot;>
          <span className=&quot;text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full&quot;>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>

      <Tabs defaultValue=&quot;details&quot; className=&quot;w-full&quot;>
        <TabsList>
          <TabsTrigger value=&quot;details&quot;>Details</TabsTrigger>
          <TabsTrigger value=&quot;events&quot;>Events</TabsTrigger>
          <TabsTrigger value=&quot;comments&quot;>Comments</TabsTrigger>
          <TabsTrigger value=&quot;history&quot;>History</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;details&quot; className=&quot;py-4&quot;>
          {booking.status === &quot;pending&quot; && (
            <div className=&quot;mb-6&quot;>
              <BookingApproval
                booking={bookingDetails}
                onApproved={() => {}} // This would refresh the page in a client component
                onRejected={() => {}}
              />
            </div>
          )}

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6 mt-6&quot;>
            <div className=&quot;space-y-4&quot;>
              <h2 className=&quot;text-xl font-semibold border-b pb-2&quot;>
                Booking Information
              </h2>
              <div className=&quot;grid grid-cols-2 gap-4&quot;>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Client
                  </p>
                  <p>{client?.name || &quot;Unknown Client&quot;}</p>
                </div>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Status
                  </p>
                  <p>
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Start Date
                  </p>
                  <p>{booking.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    End Date
                  </p>
                  <p>{booking.endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Recurring
                  </p>
                  <p>{booking.isRecurring ? &quot;Yes&quot; : &quot;No&quot;}</p>
                </div>
                <div>
                  <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Staff Count
                  </p>
                  <p>{booking.staffCount || 1}</p>
                </div>
              </div>
            </div>

            <div className=&quot;space-y-4&quot;>
              <h2 className=&quot;text-xl font-semibold border-b pb-2&quot;>
                Additional Details
              </h2>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Description
                </p>
                <p className=&quot;mt-1&quot;>
                  {booking.description || &quot;No description provided.&quot;}
                </p>
              </div>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Notes
                </p>
                <p className=&quot;mt-1&quot;>{booking.notes || &quot;No notes provided.&quot;}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value=&quot;events&quot; className=&quot;py-4&quot;>
          <Suspense fallback={<Skeleton className=&quot;h-64 w-full&quot; />}>
            <BookingManagement bookingId={booking.id} managers={fieldManagers} />
          </Suspense>
        </TabsContent>

        <TabsContent value=&quot;comments&quot; className=&quot;py-4&quot;>
          <div className=&quot;text-center p-8 border rounded-md bg-muted/30&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              No comments available for this booking.
            </p>
          </div>
        </TabsContent>

        <TabsContent value=&quot;history&quot; className=&quot;py-4&quot;>
          <div className=&quot;text-center p-8 border rounded-md bg-muted/30&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Booking history will be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
