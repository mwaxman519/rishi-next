&quot;use client&quot;;

import { useSearchParams } from &quot;next/navigation&quot;;
import { Suspense } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import EventForm from &quot;../components/EventForm&quot;;
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from &quot;@/components/ui/breadcrumb&quot;;
import { CalendarPlus } from &quot;lucide-react&quot;;

function EventCreateContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get(&quot;organizationId&quot;) || undefined;

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <Breadcrumb className=&quot;mb-6&quot;>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/dashboard&quot;>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/events&quot;>Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className=&quot;flex items-center space-x-2&quot;>
            <CalendarPlus className=&quot;h-6 w-6&quot; />
            <div>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>
                Schedule a new event with location, staff, and resources
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className=&quot;w-full h-[600px]&quot; />}>
            <EventForm organizationId={organizationId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function EventCreatePage() {
  return (
    <Suspense
      fallback={
        <div className=&quot;container mx-auto py-6&quot;>
          <Skeleton className=&quot;w-full h-[800px]&quot; />
        </div>
      }
    >
      <EventCreateContent />
    </Suspense>
  );
}

export default EventCreatePage;
