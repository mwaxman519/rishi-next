"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EventForm from "../components/EventForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CalendarPlus } from "lucide-react";

function EventCreateContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") || undefined;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/events">Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CalendarPlus className="h-6 w-6" />
            <div>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>
                Schedule a new event with location, staff, and resources
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
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
        <div className="container mx-auto py-6">
          <Skeleton className="w-full h-[800px]" />
        </div>
      }
    >
      <EventCreateContent />
    </Suspense>
  );
}

export default EventCreatePage;
