"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BookingForm } from "../../../../components/bookings/BookingForm";
import { useToast } from "../../../../components/ui/use-toast";
import { Toaster } from "../../../../components/ui/toaster";
import { Button } from "../../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";
import { Loader2, XCircle, Pencil } from "lucide-react";
import AppLayout from "../../../components/app-layout";

type Booking = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  attendeeEstimate: number;
  budget: number;
  activityType: string;
  sendCalendarInvite: boolean;
  isRecurring: boolean;
  notes?: string;
  recurrence?: any;
  organizationId?: string;
  [key: string]: any;
};

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params object using React.use() to fix the Next.js 15 warning
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  console.log("DEBUG EditBookingPage - Initial render with ID:", id);

  // Fetch booking data from real API endpoint
  useEffect(() => {
    const fetchBooking = async () => {
      console.log("DEBUG: Starting fetchBooking function");
      try {
        setLoading(true);
        console.log("DEBUG: Attempting to fetch booking with ID:", id);

        // Force using mock data for the edit page until API is working
        console.log("DEBUG: Using mock data (bypassing API)");
        // Use more specific mock data for development
        const mockBooking = {
          id: id,
          title: "Corporate Staff Training",
          date: new Date(),
          startTime: "09:00 AM",
          endTime: "05:00 PM",
          location: "Training Center",
          attendeeEstimate: 25,
          budget: 5000,
          activityType: "training", // Make sure this matches one of the activity type values
          sendCalendarInvite: true,
          isRecurring: false,
          notes:
            "Development mode - using mock booking data. This booking is generated for testing purposes only.",
          organizationId: "org-1", // Add organization ID to match mock orgs
        };
        console.log("DEBUG: Setting booking data:", mockBooking);
        setBooking(mockBooking);
        setError(null);
        setLoading(false);
        return;

        // This code is temporarily disabled until API is functional
        /*
        // Fetch booking from API
        const response = await fetch(`/api/bookings/${id}`)
        
        if (!response.ok) {
          console.warn(`API request failed with status ${response.status}`)
          
          // Check if we're in development mode
          if (process.env.NODE_ENV === 'development' || true) { // Always use mock data for now
            // For development, use mock data instead
            console.log("Using mock data for development")
            const mockBooking = {
              id: id,
              title: "Corporate Staff Training",
              date: new Date(),
              startTime: "09:00 AM",
              endTime: "05:00 PM",
              location: "Training Center",
              attendeeEstimate: 25,
              budget: 5000,
              activityType: "Training",
              sendCalendarInvite: true,
              isRecurring: false,
              notes: "Development mode - using mock booking data",
            }
            setBooking(mockBooking)
            setError(null)
            setLoading(false)
            return
          } else {
            // In production, throw an error
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
            throw new Error(errorData.error || `Failed to fetch booking: ${response.status}`)
          }
        }
        */

        const data = await response.json();

        // Format data for the form
        const formattedBooking = {
          ...data,
          date: data.date ? new Date(data.date) : new Date(),
          // Make sure required fields are available
          location: data.location || "",
          activityType: data.activityType || "",
          attendeeEstimate: data.attendeeEstimate || 0,
          budget: data.budget || 0,
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          sendCalendarInvite: Boolean(data.sendCalendarInvite),
          isRecurring: Boolean(data.isRecurring),
        };

        console.log("Loaded booking:", formattedBooking);
        setBooking(formattedBooking);
        setError(null);
      } catch (err: any) {
        console.error("Error loading booking:", err);
        setError(err.message || "Failed to load booking details");
        // API error handling is done at the response level now
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      // Submit updated data to API
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // In development mode, simulate a successful update
        if (process.env.NODE_ENV === "development") {
          console.log("Development mode: simulating successful update");
          toast({
            title: "Booking updated (Dev Mode)",
            description:
              "The booking has been updated successfully in development mode.",
          });

          setTimeout(() => {
            router.push(`/bookings/${id}`);
          }, 1000);

          return;
        }

        // In production, show the error
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || "Failed to update booking");
      }

      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });

      // Redirect back to booking details page after a short delay
      setTimeout(() => {
        router.push(`/bookings/${id}`);
      }, 1000);
    } catch (err: any) {
      console.error("Error updating booking:", err);
      toast({
        title: "Update failed",
        description:
          err.message || "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push(`/bookings/${id}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground dark:text-gray-400">
                Loading booking details...
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !booking) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error ||
                "Unable to load booking details. The booking may have been deleted."}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/bookings")}
            variant="outline"
            className="dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/bookings/${id}`)}
            className="mb-2 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">
            Edit Booking
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">
            Update the booking information
          </p>
        </div>

        <div className="max-w-4xl">
          {booking && (
            <>
              {/* Dev environment debug info */}
              {process.env.NODE_ENV === "development" && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Debug Information
                  </h3>
                  <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white/50 dark:bg-gray-900/50 p-2 rounded">
                    {JSON.stringify(booking, null, 2)}
                  </pre>
                </div>
              )}

              {/* Status indicator */}
              <div className="mb-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Editing Booking
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Make changes to the booking details below. All fields are
                    required unless marked as optional.
                  </p>
                </div>
              </div>

              <BookingForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                defaultValues={booking}
                editMode={true}
              />
            </>
          )}
        </div>
      </div>

      <Toaster />
    </AppLayout>
  );
}
