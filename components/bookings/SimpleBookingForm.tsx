&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { z } from &quot;zod&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { FormProvider } from &quot;react-hook-form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Loader2 } from &quot;lucide-react&quot;;

// Simplified booking form schema
const simpleBookingFormSchema = z.object({
  title: z.string().min(3, { message: &quot;Title must be at least 3 characters&quot; }),
  description: z.string().optional(),
});

type SimpleBookingFormValues = z.infer<typeof simpleBookingFormSchema>;

interface SimpleBookingFormProps {
  onSubmit: (data: SimpleBookingFormValues) => void;
  onCancel: () => void;
}

export function SimpleBookingForm({
  onSubmit,
  onCancel,
}: SimpleBookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Define form
  const form = useForm<SimpleBookingFormValues>({
    resolver: zodResolver(simpleBookingFormSchema),
    defaultValues: {
      title: "&quot;,
      description: &quot;&quot;,
    },
  });

  // Handle form submission
  const handleSubmit = (data: SimpleBookingFormValues) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(data);
    }, 1000);
  };

  // Check that form is working properly by logging values
  console.log(&quot;DEBUG SimpleBookingForm - Form state:&quot;, {
    values: form.getValues(),
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
  });

  return (
    <div className=&quot;bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm&quot;>
      <div className=&quot;p-6 border-b dark:border-gray-800&quot;>
        <h1 className=&quot;text-2xl font-bold dark:text-white&quot;>
          New Booking (Simplified)
        </h1>
        <p className=&quot;text-muted-foreground dark:text-gray-400 mt-1&quot;>
          Create a new booking with basic information
        </p>
      </div>

      <div className=&quot;p-6&quot;>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className=&quot;space-y-6&quot;
          >
            <FormField
              control={form.control}
              name=&quot;title&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;Enter event title&quot; {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;description&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Enter event description&quot;
                      className=&quot;min-h-[100px]&quot;
                      {...field}
                      value={field.value || &quot;&quot;}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=&quot;flex justify-between pt-4&quot;>
              <Button type=&quot;button&quot; variant=&quot;outline&quot; onClick={onCancel}>
                Cancel
              </Button>

              <Button type=&quot;submit&quot; disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    Submitting...
                  </>
                ) : (
                  &quot;Submit Booking"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
