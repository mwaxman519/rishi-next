"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookingFormFinal } from "../../../components/bookings/BookingFormFinal";
import { useToast } from "../../../components/ui/use-toast";
import { Toaster } from "../../../components/ui/toaster";
import { AppLayout } from "../../components/app-layout";

export default function CreateBookingPage() {
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
      <div className="container mx-auto py-6 bg-background dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Booking
          </h1>
        </div>

        <div className="max-w-4xl">
          <div className="bg-background dark:bg-gray-900 rounded-lg">
            <BookingFormFinal onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </div>

      <Toaster />
    </AppLayout>
  );
}
