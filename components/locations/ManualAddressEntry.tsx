&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;

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
  address1: z.string().min(1, { message: &quot;Address is required&quot; }),
  address2: z.string().optional(),
  city: z.string().min(1, { message: &quot;City is required&quot; }),
  state: z.string().min(1, { message: &quot;State is required&quot; }),
  zipcode: z
    .string()
    .min(5, { message: &quot;ZIP code must be at least 5 characters&quot; }),
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
    fetch(&quot;/api/states&quot;)
      .then((response) => response.json())
      .then((data) => {
        if (data.states) {
          setStates(data.states);
        }
      })
      .catch((error) => {
        console.error(&quot;Error fetching states:&quot;, error);
      });
  }, []);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "&quot;,
      address1: &quot;&quot;,
      address2: &quot;&quot;,
      city: &quot;&quot;,
      state: &quot;&quot;,
      zipcode: &quot;&quot;,
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
        stateId: selectedState?.id || &quot;&quot;,
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
        console.error(&quot;Geocoding error:&quot;, error);
        // Continue without coordinates if geocoding fails
      }

      onLocationSelect(locationData);
    } catch (error) {
      console.error(&quot;Error in form submission:&quot;, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;space-y-4&quot;>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-4&quot;>
          <FormField
            control={form.control}
            name=&quot;name&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;e.g., Downtown Office&quot; {...field} />
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
            name=&quot;address1&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;e.g., 123 Main St&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;address2&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;e.g., Apt 4B, Suite 100&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=&quot;grid grid-cols-2 gap-4&quot;>
            <FormField
              control={form.control}
              name=&quot;city&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;e.g., New York&quot; {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;state&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select state&quot; />
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
            name=&quot;zipcode&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;e.g., 10001&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=&quot;flex space-x-2&quot;>
            <Button type=&quot;submit&quot; disabled={isLoading}>
              {isLoading ? &quot;Submitting...&quot; : &quot;Submit Address&quot;}
            </Button>
            <Button
              type=&quot;button&quot;
              variant=&quot;outline"
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
