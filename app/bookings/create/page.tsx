&quot;use client&quot;;

import React from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { BookingFormFinal } from &quot;../../../components/bookings/BookingFormFinal&quot;;
import { useToast } from &quot;../../../components/ui/use-toast&quot;;
import { Toaster } from &quot;../../../components/ui/toaster&quot;;
import { AppLayout } from &quot;../../components/app-layout&quot;;

export default function CreateBookingPage() {
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
      <div className=&quot;container mx-auto py-6 bg-background dark:bg-gray-900&quot;>
        <div className=&quot;mb-6&quot;>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Create New Booking
          </h1>
        </div>

        <div className=&quot;max-w-4xl&quot;>
          <div className=&quot;bg-background dark:bg-gray-900 rounded-lg&quot;>
            <BookingFormFinal onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </div>

      <Toaster />
    </AppLayout>
  );
}
