&quot;use client&quot;;

import React from &quot;react&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { CalendarIcon, X } from &quot;lucide-react&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { format } from &quot;date-fns&quot;;

const filterFormSchema = z.object({
  searchText: z.string().optional(),
  activityType: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  assignee: z.string().optional(),
  location: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

export default function BookingsFilter() {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      searchText: "&quot;,
      activityType: &quot;&quot;,
      status: &quot;&quot;,
      assignee: &quot;&quot;,
      location: &quot;&quot;,
    },
  });

  function onSubmit(data: FilterFormValues) {
    console.log(&quot;Filter values:&quot;, data);
    // Here you would typically call an API to fetch filtered results
  }

  function resetFilters() {
    form.reset({
      searchText: &quot;&quot;,
      activityType: &quot;&quot;,
      status: &quot;&quot;,
      dateFrom: undefined,
      dateTo: undefined,
      assignee: &quot;&quot;,
      location: &quot;&quot;,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-6&quot;>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
          {/* Search Text */}
          <FormField
            control={form.control}
            name=&quot;searchText&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input
                    placeholder=&quot;Search booking title...&quot;
                    {...field}
                    className=&quot;w-full&quot;
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Activity Type */}
          <FormField
            control={form.control}
            name=&quot;activityType&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select type&quot; />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=&quot;&quot;>All Types</SelectItem>
                    <SelectItem value=&quot;event&quot;>Event</SelectItem>
                    <SelectItem value=&quot;secret_shopping&quot;>
                      Secret Shopping
                    </SelectItem>
                    <SelectItem value=&quot;merchandising&quot;>Merchandising</SelectItem>
                    <SelectItem value=&quot;logistics&quot;>Logistics</SelectItem>
                    <SelectItem value=&quot;training&quot;>Training</SelectItem>
                    <SelectItem value=&quot;other&quot;>Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name=&quot;status&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select status&quot; />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=&quot;&quot;>All Statuses</SelectItem>
                    <SelectItem value=&quot;draft&quot;>Draft</SelectItem>
                    <SelectItem value=&quot;pending&quot;>Pending Approval</SelectItem>
                    <SelectItem value=&quot;approved&quot;>Approved</SelectItem>
                    <SelectItem value=&quot;in_progress&quot;>In Progress</SelectItem>
                    <SelectItem value=&quot;completed&quot;>Completed</SelectItem>
                    <SelectItem value=&quot;cancelled&quot;>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Date From */}
          <FormField
            control={form.control}
            name=&quot;dateFrom&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-col&quot;>
                <FormLabel>Date From</FormLabel>
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
                          <span>Select date</span>
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
                        date > new Date() || date < new Date(&quot;1900-01-01&quot;)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          {/* Date To */}
          <FormField
            control={form.control}
            name=&quot;dateTo&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-col&quot;>
                <FormLabel>Date To</FormLabel>
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
                          <span>Select date</span>
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
                        date <
                          (form.watch(&quot;dateFrom&quot;) || new Date(&quot;1900-01-01&quot;)) ||
                        date < new Date(&quot;1900-01-01&quot;)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name=&quot;location&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder=&quot;Filter by location...&quot;
                    {...field}
                    className=&quot;w-full&quot;
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className=&quot;flex gap-2 justify-end&quot;>
          <Button
            type=&quot;button&quot;
            variant=&quot;outline&quot;
            onClick={resetFilters}
            className=&quot;gap-1&quot;
          >
            <X className=&quot;h-4 w-4&quot; />
            Clear Filters
          </Button>
          <Button type=&quot;submit">Apply Filters</Button>
        </div>
      </form>
    </Form>
  );
}
