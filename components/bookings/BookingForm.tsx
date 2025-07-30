&quot;use client&quot;;

import React from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;@/components/ui/popover&quot;;
import { CalendarIcon } from &quot;lucide-react&quot;;
import { format } from &quot;date-fns&quot;;
import { cn } from &quot;@/lib/utils&quot;;

const bookingSchema = z.object({
  title: z.string().min(1, &quot;Title is required&quot;),
  date: z.date(),
  startTime: z.string().min(1, &quot;Start time is required&quot;),
  endTime: z.string().min(1, &quot;End time is required&quot;),
  location: z.string().min(1, &quot;Location is required&quot;),
  attendeeEstimate: z.number().min(1, &quot;Attendee estimate must be at least 1&quot;),
  budget: z.number().min(0, &quot;Budget must be non-negative&quot;),
  activityType: z.string().min(1, &quot;Activity type is required&quot;),
  sendCalendarInvite: z.boolean(),
  isRecurring: z.boolean(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<BookingFormData>;
  editMode?: boolean;
}

export function BookingForm({
  onSubmit,
  onCancel,
  defaultValues,
  editMode = false,
}: BookingFormProps) {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      title: "&quot;,
      date: new Date(),
      startTime: &quot;&quot;,
      endTime: &quot;&quot;,
      location: &quot;&quot;,
      attendeeEstimate: 1,
      budget: 0,
      activityType: &quot;&quot;,
      sendCalendarInvite: false,
      isRecurring: false,
      notes: &quot;&quot;,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-6&quot;>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <FormField
            control={form.control}
            name=&quot;title&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;Enter booking title&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;activityType&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select activity type&quot; />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=&quot;demo&quot;>Product Demo</SelectItem>
                    <SelectItem value=&quot;training&quot;>Staff Training</SelectItem>
                    <SelectItem value=&quot;event&quot;>Special Event</SelectItem>
                    <SelectItem value=&quot;consultation&quot;>Consultation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;date&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-col&quot;>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={&quot;outline&quot;}
                        className={cn(
                          &quot;w-full pl-3 text-left font-normal&quot;,
                          !field.value && &quot;text-muted-foreground&quot;,
                        )}
                      >
                        {field.value ? (
                          format(field.value, &quot;PPP&quot;)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className=&quot;ml-auto h-4 w-4 opacity-50&quot; />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;start&quot;>
                    <Calendar
                      mode=&quot;single&quot;
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date(&quot;1900-01-01&quot;)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;location&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;Enter location&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;startTime&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type=&quot;time&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;endTime&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type=&quot;time&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;attendeeEstimate&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendee Estimate</FormLabel>
                <FormControl>
                  <Input
                    type=&quot;number&quot;
                    placeholder=&quot;Number of attendees&quot;
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;budget&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget ($)</FormLabel>
                <FormControl>
                  <Input
                    type=&quot;number&quot;
                    placeholder=&quot;Budget amount&quot;
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name=&quot;notes&quot;
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=&quot;Additional notes or requirements&quot;
                  className=&quot;resize-none&quot;
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className=&quot;flex items-center space-x-6&quot;>
          <FormField
            control={form.control}
            name=&quot;sendCalendarInvite&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-4&quot;>
                <div className=&quot;space-y-0.5&quot;>
                  <FormLabel className=&quot;text-base&quot;>
                    Send Calendar Invite
                  </FormLabel>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Send calendar invitations to attendees
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;isRecurring&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-4&quot;>
                <div className=&quot;space-y-0.5&quot;>
                  <FormLabel className=&quot;text-base&quot;>Recurring Booking</FormLabel>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Set up recurring schedule
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className=&quot;flex gap-4&quot;>
          <Button type=&quot;submit&quot; className=&quot;flex-1&quot;>
            {editMode ? &quot;Update Booking&quot; : &quot;Create Booking&quot;}
          </Button>
          <Button
            type=&quot;button&quot;
            variant=&quot;outline&quot;
            onClick={onCancel}
            className=&quot;flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
