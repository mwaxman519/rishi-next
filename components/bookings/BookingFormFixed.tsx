&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useForm, FormProvider } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { format } from &quot;date-fns&quot;;
import { Loader2, CalendarIcon, Clock } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;@/components/ui/popover&quot;;

// Minimal form schema for the example
const bookingFormSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringCount: z.number().optional(),
  sendInvites: z.boolean().default(false),
  inviteEmails: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  onCancel: () => void;
}

export function BookingFormFixed({ onSubmit, onCancel }: BookingFormProps) {
  const [activeTab, setActiveTab] = useState(&quot;details&quot;);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: &quot;09:00&quot;,
      endTime: &quot;17:00&quot;,
      isRecurring: false,
      recurringFrequency: &quot;weekly&quot;,
      recurringCount: 4,
      sendInvites: false,
      inviteEmails: "&quot;,
    },
  });

  const handleSubmit = (data: BookingFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit(data);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className=&quot;bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm&quot;>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className=&quot;w-full&quot;
          >
            <div className=&quot;border-b&quot;>
              <div className=&quot;px-6&quot;>
                <TabsList className=&quot;grid grid-cols-2 mt-4 bg-transparent&quot;>
                  <TabsTrigger
                    value=&quot;details&quot;
                    className=&quot;data-[state=active]:border-b-2 data-[state=active]:border-primary&quot;
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger
                    value=&quot;options&quot;
                    className=&quot;data-[state=active]:border-b-2 data-[state=active]:border-primary&quot;
                  >
                    Options
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className=&quot;p-6&quot;>
              <TabsContent value=&quot;details&quot; className=&quot;mt-0 space-y-6&quot;>
                <div className=&quot;grid grid-cols-1 gap-6&quot;>
                  {/* Date Field */}
                  <div className=&quot;space-y-2&quot;>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=&quot;outline&quot;
                          className={cn(
                            &quot;w-full justify-start text-left font-normal&quot;,
                            !form.getValues(&quot;date&quot;) && &quot;text-muted-foreground&quot;,
                          )}
                        >
                          <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
                          {form.getValues(&quot;date&quot;) ? (
                            format(form.getValues(&quot;date&quot;), &quot;PPP&quot;)
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-auto p-0&quot;>
                        <Calendar
                          mode=&quot;single&quot;
                          selected={form.getValues(&quot;date&quot;)}
                          onSelect={(date) =>
                            form.setValue(&quot;date&quot;, date as Date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className=&quot;grid grid-cols-2 gap-6&quot;>
                    {/* Start Time */}
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;startTime&quot;>Start Time</Label>
                      <div className=&quot;relative&quot;>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant=&quot;outline&quot;
                              className=&quot;w-full justify-start text-left font-normal flex items-center gap-2&quot;
                            >
                              <Clock className=&quot;h-4 w-4&quot; />
                              <span>
                                {form.watch(&quot;startTime&quot;) || &quot;Select start time&quot;}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className=&quot;w-auto p-4&quot;>
                            <div className=&quot;space-y-4&quot;>
                              <div>
                                <Label htmlFor=&quot;custom-start-time&quot;>Time</Label>
                                <Input
                                  id=&quot;custom-start-time&quot;
                                  type=&quot;time&quot;
                                  value={form.watch(&quot;startTime&quot;)}
                                  onChange={(e) =>
                                    form.setValue(&quot;startTime&quot;, e.target.value)
                                  }
                                  className=&quot;mt-1 w-full&quot;
                                />
                              </div>
                              <div className=&quot;grid grid-cols-4 gap-2&quot;>
                                {[
                                  &quot;09:00&quot;,
                                  &quot;10:00&quot;,
                                  &quot;12:00&quot;,
                                  &quot;13:00&quot;,
                                  &quot;14:00&quot;,
                                  &quot;15:00&quot;,
                                  &quot;16:00&quot;,
                                  &quot;17:00&quot;,
                                ].map((time) => (
                                  <Button
                                    key={time}
                                    variant=&quot;outline&quot;
                                    size=&quot;sm&quot;
                                    className={cn(
                                      form.watch(&quot;startTime&quot;) === time &&
                                        &quot;bg-primary text-primary-foreground&quot;,
                                    )}
                                    onClick={() => {
                                      form.setValue(&quot;startTime&quot;, time);
                                    }}
                                    type=&quot;button&quot;
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* End Time */}
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;endTime&quot;>End Time</Label>
                      <div className=&quot;relative&quot;>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant=&quot;outline&quot;
                              className=&quot;w-full justify-start text-left font-normal flex items-center gap-2&quot;
                            >
                              <Clock className=&quot;h-4 w-4&quot; />
                              <span>
                                {form.watch(&quot;endTime&quot;) || &quot;Select end time&quot;}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className=&quot;w-auto p-4&quot;>
                            <div className=&quot;space-y-4&quot;>
                              <div>
                                <Label htmlFor=&quot;custom-end-time&quot;>Time</Label>
                                <Input
                                  id=&quot;custom-end-time&quot;
                                  type=&quot;time&quot;
                                  value={form.watch(&quot;endTime&quot;)}
                                  onChange={(e) =>
                                    form.setValue(&quot;endTime&quot;, e.target.value)
                                  }
                                  className=&quot;mt-1 w-full&quot;
                                />
                              </div>
                              <div className=&quot;grid grid-cols-4 gap-2&quot;>
                                {[
                                  &quot;10:00&quot;,
                                  &quot;11:00&quot;,
                                  &quot;13:00&quot;,
                                  &quot;14:00&quot;,
                                  &quot;15:00&quot;,
                                  &quot;16:00&quot;,
                                  &quot;17:00&quot;,
                                  &quot;18:00&quot;,
                                ].map((time) => (
                                  <Button
                                    key={time}
                                    variant=&quot;outline&quot;
                                    size=&quot;sm&quot;
                                    className={cn(
                                      form.watch(&quot;endTime&quot;) === time &&
                                        &quot;bg-primary text-primary-foreground&quot;,
                                    )}
                                    onClick={() => {
                                      form.setValue(&quot;endTime&quot;, time);
                                    }}
                                    type=&quot;button&quot;
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value=&quot;options&quot; className=&quot;mt-0 space-y-6&quot;>
                <div className=&quot;space-y-6&quot;>
                  {/* Recurring Event Option */}
                  <div className=&quot;border rounded-lg overflow-hidden&quot;>
                    <button
                      type=&quot;button&quot;
                      className={cn(
                        &quot;w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors&quot;,
                        form.watch(&quot;isRecurring&quot;) && &quot;border-b border-border&quot;,
                      )}
                      onClick={() =>
                        form.setValue(&quot;isRecurring&quot;, !form.watch(&quot;isRecurring&quot;))
                      }
                    >
                      <div className=&quot;flex items-center gap-3&quot;>
                        <div
                          className={cn(
                            &quot;flex items-center justify-center w-8 h-8 rounded-full&quot;,
                            form.watch(&quot;isRecurring&quot;)
                              ? &quot;bg-primary text-primary-foreground&quot;
                              : &quot;bg-muted-foreground/20 text-muted-foreground&quot;,
                          )}
                        >
                          <CalendarIcon className=&quot;h-4 w-4&quot; />
                        </div>
                        <div className=&quot;text-left&quot;>
                          <div className=&quot;font-medium&quot;>Recurring Event</div>
                          <p className=&quot;text-muted-foreground text-sm&quot;>
                            Set this event to repeat on a schedule
                          </p>
                        </div>
                      </div>

                      <div className=&quot;flex items-center gap-3&quot;>
                        <span
                          className={cn(
                            &quot;text-sm&quot;,
                            form.watch(&quot;isRecurring&quot;)
                              ? &quot;text-primary font-medium&quot;
                              : &quot;text-muted-foreground&quot;,
                          )}
                        >
                          {form.watch(&quot;isRecurring&quot;) ? &quot;Enabled&quot; : &quot;Disabled&quot;}
                        </span>
                        <div
                          className=&quot;transform transition-transform duration-200&quot;
                          style={{
                            transform: form.watch(&quot;isRecurring&quot;)
                              ? &quot;rotate(180deg)&quot;
                              : &quot;rotate(0deg)&quot;,
                          }}
                        >
                          <svg
                            xmlns=&quot;http://www.w3.org/2000/svg&quot;
                            width=&quot;18&quot;
                            height=&quot;18&quot;
                            viewBox=&quot;0 0 24 24&quot;
                            fill=&quot;none&quot;
                            stroke=&quot;currentColor&quot;
                            strokeWidth=&quot;2&quot;
                            strokeLinecap=&quot;round&quot;
                            strokeLinejoin=&quot;round&quot;
                            className=&quot;text-muted-foreground&quot;
                          >
                            <path d=&quot;m6 9 6 6 6-6&quot; />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {form.watch(&quot;isRecurring&quot;) && (
                      <div className=&quot;p-4 grid grid-cols-2 gap-4&quot;>
                        {/* Frequency Selection */}
                        <div className=&quot;space-y-2&quot;>
                          <Label htmlFor=&quot;recurringFrequency&quot;>Frequency</Label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue(&quot;recurringFrequency&quot;, value)
                            }
                            value={form.watch(&quot;recurringFrequency&quot;)}
                          >
                            <SelectTrigger id=&quot;recurringFrequency&quot;>
                              <SelectValue placeholder=&quot;Select frequency&quot; />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=&quot;daily&quot;>Daily</SelectItem>
                              <SelectItem value=&quot;weekly&quot;>Weekly</SelectItem>
                              <SelectItem value=&quot;biweekly&quot;>
                                Bi-weekly
                              </SelectItem>
                              <SelectItem value=&quot;monthly&quot;>Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Count Selection */}
                        <div className=&quot;space-y-2&quot;>
                          <Label htmlFor=&quot;recurringCount&quot;>
                            Number of Events
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue(&quot;recurringCount&quot;, parseInt(value))
                            }
                            value={form.watch(&quot;recurringCount&quot;)?.toString()}
                          >
                            <SelectTrigger id=&quot;recurringCount&quot;>
                              <SelectValue placeholder=&quot;Select count&quot; />
                            </SelectTrigger>
                            <SelectContent>
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                                (count) => (
                                  <SelectItem
                                    key={count}
                                    value={count.toString()}
                                  >
                                    {count} events
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calendar Invites Option */}
                  <div className=&quot;border rounded-lg overflow-hidden&quot;>
                    <button
                      type=&quot;button&quot;
                      className={cn(
                        &quot;w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors&quot;,
                        form.watch(&quot;sendInvites&quot;) && &quot;border-b border-border&quot;,
                      )}
                      onClick={() =>
                        form.setValue(&quot;sendInvites&quot;, !form.watch(&quot;sendInvites&quot;))
                      }
                    >
                      <div className=&quot;flex items-center gap-3&quot;>
                        <div
                          className={cn(
                            &quot;flex items-center justify-center w-8 h-8 rounded-full&quot;,
                            form.watch(&quot;sendInvites&quot;)
                              ? &quot;bg-primary text-primary-foreground&quot;
                              : &quot;bg-muted-foreground/20 text-muted-foreground&quot;,
                          )}
                        >
                          <svg
                            xmlns=&quot;http://www.w3.org/2000/svg&quot;
                            width=&quot;16&quot;
                            height=&quot;16&quot;
                            viewBox=&quot;0 0 24 24&quot;
                            fill=&quot;none&quot;
                            stroke=&quot;currentColor&quot;
                            strokeWidth=&quot;2&quot;
                            strokeLinecap=&quot;round&quot;
                            strokeLinejoin=&quot;round&quot;
                          >
                            <path d=&quot;M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z&quot;></path>
                            <polyline points=&quot;22,6 12,13 2,6&quot;></polyline>
                          </svg>
                        </div>
                        <div className=&quot;text-left&quot;>
                          <div className=&quot;font-medium&quot;>
                            Send Calendar Invites
                          </div>
                          <p className=&quot;text-muted-foreground text-sm&quot;>
                            Send calendar invitations to all participants
                          </p>
                        </div>
                      </div>

                      <div className=&quot;flex items-center gap-3&quot;>
                        <span
                          className={cn(
                            &quot;text-sm&quot;,
                            form.watch(&quot;sendInvites&quot;)
                              ? &quot;text-primary font-medium&quot;
                              : &quot;text-muted-foreground&quot;,
                          )}
                        >
                          {form.watch(&quot;sendInvites&quot;) ? &quot;Enabled&quot; : &quot;Disabled&quot;}
                        </span>
                        <div
                          className=&quot;transform transition-transform duration-200&quot;
                          style={{
                            transform: form.watch(&quot;sendInvites&quot;)
                              ? &quot;rotate(180deg)&quot;
                              : &quot;rotate(0deg)&quot;,
                          }}
                        >
                          <svg
                            xmlns=&quot;http://www.w3.org/2000/svg&quot;
                            width=&quot;18&quot;
                            height=&quot;18&quot;
                            viewBox=&quot;0 0 24 24&quot;
                            fill=&quot;none&quot;
                            stroke=&quot;currentColor&quot;
                            strokeWidth=&quot;2&quot;
                            strokeLinecap=&quot;round&quot;
                            strokeLinejoin=&quot;round&quot;
                            className=&quot;text-muted-foreground&quot;
                          >
                            <path d=&quot;m6 9 6 6 6-6&quot; />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {form.watch(&quot;sendInvites&quot;) && (
                      <div className=&quot;p-4 space-y-3&quot;>
                        <Label htmlFor=&quot;inviteEmails&quot;>
                          Participant Email Addresses
                        </Label>
                        <Textarea
                          id=&quot;inviteEmails&quot;
                          placeholder=&quot;Enter email addresses separated by commas&quot;
                          {...form.register(&quot;inviteEmails&quot;)}
                          className=&quot;min-h-[100px]&quot;
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className=&quot;flex justify-between pt-4&quot;>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;outline&quot;
                    onClick={() => setActiveTab(&quot;details&quot;)}
                  >
                    Back
                  </Button>

                  <div className=&quot;space-x-2&quot;>
                    <Button type=&quot;button&quot; variant=&quot;outline&quot; onClick={onCancel}>
                      Cancel
                    </Button>

                    <Button type=&quot;submit&quot; disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                          Submitting...
                        </>
                      ) : (
                        &quot;Submit Booking"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </FormProvider>
    </div>
  );
}
