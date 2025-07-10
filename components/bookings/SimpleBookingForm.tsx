"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { FormProvider } from "react-hook-form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

// Simplified booking form schema
const simpleBookingFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
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
      title: "",
      description: "",
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
  console.log("DEBUG SimpleBookingForm - Form state:", {
    values: form.getValues(),
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b dark:border-gray-800">
        <h1 className="text-2xl font-bold dark:text-white">
          New Booking (Simplified)
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">
          Create a new booking with basic information
        </p>
      </div>

      <div className="p-6">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Booking"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
