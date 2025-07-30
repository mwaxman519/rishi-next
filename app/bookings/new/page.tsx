"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookingFormNew } from "../../../components/bookings/BookingFormNew";
import { SimpleBookingFormNew } from "../../../components/bookings/SimpleBookingFormNew";
import { useToast } from "../../../components/ui/use-toast";
import { Toaster } from "../../../components/ui/toaster";
import AppLayout from "../../components/app-layout";

export default function NewBookingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: any) => {
    // Here we would normally submit the data to an API
    console.log("Form submitted:", data);

    toast({
      title: "Booking request submitted",
      description: "Your booking request has been submitted successfully.",
    });

    // Redirect back to bookings list after a short delay
    setTimeout(() => {
      router.push("/bookings");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/bookings");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill out the form below to create a new booking request
          </p>
        </div>

        <div className="max-w-4xl space-y-8">
          <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              Debug: Simplified Form
            </h2>
            <p className="text-muted-foreground">
              Testing with a simplified form component to debug rendering issues
            </p>
            <SimpleBookingFormNew
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">New Booking Form</h2>
            <p className="text-muted-foreground mb-4">
              Updated booking form with improved initialization and validation
            </p>
            <BookingFormNew onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </div>

      <Toaster />
    </AppLayout>
  );
}
