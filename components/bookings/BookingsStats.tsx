&quot;use client&quot;;

import React from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Loader2,
  XCircle,
} from &quot;lucide-react&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import Link from &quot;next/link&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { BOOKING_STATUS } from &quot;@shared/schema&quot;;

interface BookingStats {
  total: number;
  upcoming: number;
  byStatus: {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
    canceled: number;
    completed: number;
  };
}

interface BookingsStatsProps {
  className?: string;
}

export default function BookingsStats({ className }: BookingsStatsProps) {
  const { data, isLoading, isError } = useQuery<BookingStats>({
    queryKey: [&quot;/api/bookings/stats&quot;],
    queryFn: async () => {
      const response = await fetch(&quot;/api/bookings/stats&quot;);
      if (!response.ok) {
        throw new Error(&quot;Failed to fetch booking statistics&quot;);
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          &quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4&quot;,
          className,
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className=&quot;flex flex-row items-center justify-between pb-2 space-y-0&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                <Skeleton className=&quot;h-4 w-24&quot; />
              </CardTitle>
              <Skeleton className=&quot;h-4 w-4 rounded-full&quot; />
            </CardHeader>
            <CardContent>
              <Skeleton className=&quot;h-8 w-16&quot; />
              <Skeleton className=&quot;h-4 w-32 mt-2&quot; />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className=&quot;text-sm font-medium&quot;>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex items-center&quot;>
            <XCircle className=&quot;h-5 w-5 text-destructive mr-2&quot; />
            <p className=&quot;text-muted-foreground text-sm&quot;>
              Failed to load booking statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: &quot;Total Bookings&quot;,
      value: data.total,
      description: &quot;All bookings in the system&quot;,
      icon: <ClipboardList className=&quot;h-5 w-5 text-muted-foreground&quot; />,
      href: &quot;/bookings&quot;,
    },
    {
      title: &quot;Pending Approval&quot;,
      value: data.byStatus.pending,
      description: &quot;Awaiting review&quot;,
      icon: <ClipboardCheck className=&quot;h-5 w-5 text-amber-500&quot; />,
      href: `/bookings?status=${BOOKING_STATUS.PENDING}`,
    },
    {
      title: &quot;Upcoming Bookings&quot;,
      value: data.upcoming,
      description: &quot;Next 30 days&quot;,
      icon: <Calendar className=&quot;h-5 w-5 text-blue-500&quot; />,
      href: &quot;/bookings&quot;,
    },
    {
      title: &quot;Completed&quot;,
      value: data.byStatus.completed,
      description: &quot;Successfully finished&quot;,
      icon: <CheckCircle2 className=&quot;h-5 w-5 text-green-500&quot; />,
      href: `/bookings?status=${BOOKING_STATUS.COMPLETED}`,
    },
  ];

  return (
    <div
      className={cn(
        &quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4&quot;,
        className,
      )}
    >
      {statCards.map((card, index) => (
        <Card key={index} className=&quot;transition-all hover:shadow-md&quot;>
          <Link href={card.href} className=&quot;block h-full&quot;>
            <CardHeader className=&quot;flex flex-row items-center justify-between pb-2 space-y-0&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className=&quot;text-2xl font-bold&quot;>{card.value}</div>
              <p className=&quot;text-xs text-muted-foreground mt-1&quot;>
                {card.description}
              </p>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
