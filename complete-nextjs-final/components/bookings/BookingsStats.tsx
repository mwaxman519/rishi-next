"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Loader2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS } from "@shared/schema";

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
    queryKey: ["/api/bookings/stats"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch booking statistics");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
          className,
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32 mt-2" />
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
          <CardTitle className="text-sm font-medium">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-destructive mr-2" />
            <p className="text-muted-foreground text-sm">
              Failed to load booking statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: data.total,
      description: "All bookings in the system",
      icon: <ClipboardList className="h-5 w-5 text-muted-foreground" />,
      href: "/bookings",
    },
    {
      title: "Pending Approval",
      value: data.byStatus.pending,
      description: "Awaiting review",
      icon: <ClipboardCheck className="h-5 w-5 text-amber-500" />,
      href: `/bookings?status=${BOOKING_STATUS.PENDING}`,
    },
    {
      title: "Upcoming Bookings",
      value: data.upcoming,
      description: "Next 30 days",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      href: "/bookings",
    },
    {
      title: "Completed",
      value: data.byStatus.completed,
      description: "Successfully finished",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      href: `/bookings?status=${BOOKING_STATUS.COMPLETED}`,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {statCards.map((card, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <Link href={card.href} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
