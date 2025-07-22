"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationData {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  stateId: string;
  zipcode: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

interface ManualAddressEntryProps {
  onLocationSelect: (location: LocationData) => void;
  onToggleSearchMode: () => void;
}

// Create a schema for address validation
const addressSchema = z.object({
  name: z.string().optional(),
  address1: z.string().min(1, { message: "Address is required" }),
  address2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipcode: z
    .string()
    .min(5, { message: "ZIP code must be at least 5 characters" }),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function ManualAddressEntry({
  onLocationSelect,
  onToggleSearchMode,
}: ManualAddressEntryProps) {
  const [states, setStates] = useState<
    Array<{ id: string; name: string; abbreviation: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch states from the API
    fetch("/api/states")
      .then((response) => response.json())
      .then((data) => {
        if (data.states) {
          setStates(data.states);
        }
      })
      .catch((error) => {
        console.error("Error fetching states:", error);
      });
  }, []);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipcode: "",
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    setIsLoading(true);

    try {
      // Find the selected state to get its ID
      const selectedState = states.find(
        (state) => state.abbreviation === data.state,
      );

      const locationData: LocationData = {
        ...data,
        stateId: selectedState?.id || "",
      };

      // Try to geocode the address if possible
      try {
        const response = await fetch(
          `/api/locations/geocode?address=${encodeURIComponent(
            `${data.address1}, ${data.city}, ${data.state} ${data.zipcode}`,
          )}`,
        );

        const geocodeResult = await response.json();

        if (geocodeResult.lat && geocodeResult.lng) {
          locationData.latitude = geocodeResult.lat;
          locationData.longitude = geocodeResult.lng;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        // Continue without coordinates if geocoding fails
      }

      onLocationSelect(locationData);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Downtown Office" {...field} />
                </FormControl>
                <FormDescription>
                  Name or title for this location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Apt 4B, Suite 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.abbreviation}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onToggleSearchMode}
            >
              Try Search Instead
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
