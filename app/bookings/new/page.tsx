&quot;use client&quot;;

import React from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { BookingFormNew } from &quot;../../../components/bookings/BookingFormNew&quot;;
import { SimpleBookingFormNew } from &quot;../../../components/bookings/SimpleBookingFormNew&quot;;
import { useToast } from &quot;../../../components/ui/use-toast&quot;;
import { Toaster } from &quot;../../../components/ui/toaster&quot;;
import AppLayout from &quot;../../components/app-layout&quot;;

export default function NewBookingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: any) => {
    // Here we would normally submit the data to an API
    console.log(&quot;Form submitted:&quot;, data);

    toast({
      title: &quot;Booking request submitted&quot;,
      description: &quot;Your booking request has been submitted successfully.&quot;,
    });

    // Redirect back to bookings list after a short delay
    setTimeout(() => {
      router.push(&quot;/bookings&quot;);
    }, 1500);
  };

  const handleCancel = () => {
    router.push(&quot;/bookings&quot;);
  };

  return (
    <AppLayout>
      <div className=&quot;container mx-auto py-6&quot;>
        <div className=&quot;mb-6&quot;>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Create New Booking
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Fill out the form below to create a new booking request
          </p>
        </div>

        <div className=&quot;max-w-4xl space-y-8&quot;>
          <div className=&quot;pb-6 mb-6 border-b border-gray-200 dark:border-gray-700&quot;>
            <h2 className=&quot;text-xl font-semibold text-red-500 mb-2&quot;>
              Debug: Simplified Form
            </h2>
            <p className=&quot;text-muted-foreground&quot;>
              Testing with a simplified form component to debug rendering issues
            </p>
            <SimpleBookingFormNew
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>

          <div>
            <h2 className=&quot;text-xl font-semibold mb-2&quot;>New Booking Form</h2>
            <p className=&quot;text-muted-foreground mb-4&quot;>
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
