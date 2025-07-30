&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;

// Get 3-letter timezone abbreviation
function getTimezoneAbbr() {
  // Try to get standard format like EDT, PDT, etc.
  const options = { timeZoneName: &quot;short&quot; } as Intl.DateTimeFormatOptions;
  const dateString = new Date().toLocaleTimeString(&quot;en-US&quot;, options);
  const abbr = dateString.split(&quot; &quot;)[2];
  return abbr && abbr.length <= 5 ? abbr : &quot;Local&quot;; // Fallback to 'Local' if no abbreviation found
}
import { z } from &quot;zod&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm, FormProvider } from &quot;react-hook-form&quot;;
import { format } from &quot;date-fns&quot;;
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from &quot;lucide-react&quot;;
/**
 * Booking Form Component - Part of the Bookings Microservice
 *
 * This form is the primary interface for creating and editing bookings within the
 * Rishi Workforce Management platform. It implements our event-driven architecture
 * by emitting events on form submission that other microservices can subscribe to.
 *
 * The form handles:
 * - Client selection (automatically selected for client users)
 * - Dynamic title generation that updates in real-time
 * - Date and time selection with timezone support
 * - Location selection with integration to the Location microservice
 * - Recurring event configuration
 * - Calendar invite generation
 * - Activity scheduling within the booking
 *
 * Technical implementation notes:
 * - Uses React Hook Form with Zod validation
 * - Implements the Command pattern via form submission
 * - Follows CQRS principles by separating read (loading data) from write (submission)
 * - Integrates with our event bus for cross-service communication
 * - Component composition pattern for maintainability
 *
 * @module BookingsModule
 * @component BookingFormFinal
 */

/**
 * DatePicker is a highly customizable calendar component for selecting dates.
 * We've chosen this over the built-in calendar component for improved
 * cross-browser compatibility, better mobile support, and more consistent styling.
 */
import DatePicker from &quot;react-datepicker&quot;;
import &quot;react-datepicker/dist/react-datepicker.css&quot;; // Base styles for the datepicker

import { useToast } from &quot;@/hooks/use-toast&quot;;
// Mock location types and status for development
enum LocationType {
  VENUE = &quot;VENUE&quot;,
  OFFICE = &quot;OFFICE&quot;,
  STORAGE = &quot;STORAGE&quot;,
  OTHER = &quot;OTHER&quot;,
}

enum LocationStatus {
  PENDING = &quot;PENDING&quot;,
  APPROVED = &quot;APPROVED&quot;,
  REJECTED = &quot;REJECTED&quot;,
}

// Location data transfer object
interface LocationDTO {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  zipcode: string;
  status: LocationStatus;
  type: string | LocationType;
  notes?: string;
  rejectionReason?: string;
}

import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { LocationSelector } from &quot;@/components/locations/LocationSelector&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;@/components/ui/popover&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { cn } from &quot;@/lib/utils&quot;;

// Define the booking form schema
const bookingFormSchema = z.object({
  // title is auto-generated, not a direct field
  date: z.date({ required_error: &quot;Please select a date&quot; }),
  startTime: z.string().min(1, { message: &quot;Please enter a start time&quot; }),
  endTime: z.string().min(1, { message: &quot;Please enter an end time&quot; }),
  locationId: z.string().min(1, { message: &quot;Please select a location&quot; }),
  activityType: z
    .string()
    .min(1, { message: &quot;Please select an activity type&quot; }),
  eventType: z.string().min(1, { message: &quot;Please select an event type&quot; }),
  clientId: z.string().min(1, { message: &quot;Please select a client&quot; }),
  brand: z.string().min(1, { message: &quot;Please select a brand&quot; }),
  eventDetails: z.string().optional(),
  promotionType: z.string().optional(),
  promotionDetails: z.string().optional(),
  notes: z.string().optional(),

  // Recurring event settings
  isRecurring: z.boolean().default(false),
  recurringFrequency: z
    .enum([&quot;daily&quot;, &quot;weekly&quot;, &quot;biweekly&quot;, &quot;monthly&quot;])
    .optional(),
  recurringCount: z.number().min(2).max(52).optional(),

  // Calendar invites
  sendInvites: z.boolean().default(false),
  inviteEmails: z.string().optional(), // Comma-separated list of emails
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<BookingFormValues>;
}

export function BookingFormFinal({
  onSubmit,
  onCancel,
  defaultValues,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(&quot;details&quot;);

  // Initialize form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: &quot;09:00&quot;,
      endTime: &quot;17:00&quot;,
      locationId: "&quot;,
      activityType: &quot;&quot;,
      eventType: &quot;&quot;,
      clientId: &quot;&quot;,
      brand: &quot;&quot;,
      eventDetails: &quot;&quot;,
      promotionType: &quot;none&quot;,
      promotionDetails: &quot;&quot;,
      notes: &quot;&quot;,
      isRecurring: false,
      recurringFrequency: &quot;weekly&quot;,
      recurringCount: 4,
      sendInvites: false,
      inviteEmails: &quot;&quot;,
      ...defaultValues,
    },
  });

  // Event type options for cannabis industry
  const eventTypes = [
    { value: &quot;dispensary_popup&quot;, label: &quot;Dispensary Pop-up&quot; },
    { value: &quot;product_launch&quot;, label: &quot;Product Launch&quot; },
    { value: &quot;in_store_demo&quot;, label: &quot;In-Store Demonstration&quot; },
    { value: &quot;vendor_day&quot;, label: &quot;Vendor Day&quot; },
    { value: &quot;cannabis_expo&quot;, label: &quot;Cannabis Expo/Convention&quot; },
    { value: &quot;patient_education&quot;, label: &quot;Patient Education Event&quot; },
    { value: &quot;budtender_training&quot;, label: &quot;Budtender Training&quot; },
    { value: &quot;secret_shopping&quot;, label: &quot;Secret Shopping&quot; },
    { value: &quot;industry_event&quot;, label: &quot;Industry Networking Event&quot; },
    { value: &quot;seasonal_promotion&quot;, label: &quot;Seasonal Promotion&quot; },
    { value: &quot;other&quot;, label: &quot;Other&quot; },
  ];

  // Activity type options for cannabis industry
  const activityTypes = [
    { value: &quot;brand_representation&quot;, label: &quot;Brand Representation&quot; },
    { value: &quot;merchandising&quot;, label: &quot;Merchandising&quot; },
    { value: &quot;product_demo&quot;, label: &quot;Product Demonstration&quot; },
    { value: &quot;staff_training&quot;, label: &quot;Staff Training&quot; },
    { value: &quot;patient_education&quot;, label: &quot;Patient Education&quot; },
    { value: &quot;product_sampling&quot;, label: &quot;Product Sampling (where legal)&quot; },
    { value: &quot;logistics&quot;, label: &quot;Logistics/Kit Movement&quot; },
    { value: &quot;market_research&quot;, label: &quot;Market Research&quot; },
    { value: &quot;display_setup&quot;, label: &quot;Display Setup&quot; },
    { value: &quot;consumer_education&quot;, label: &quot;Consumer Education&quot; },
    { value: &quot;other&quot;, label: &quot;Other&quot; },
  ];

  // Activities available for cannabis industry
  const availableActivities = [
    { value: &quot;product_explanation&quot;, label: &quot;Product Explanation&quot; },
    { value: &quot;strain_education&quot;, label: &quot;Strain/Variety Education&quot; },
    { value: &quot;consumption_guidance&quot;, label: &quot;Consumption Guidance&quot; },
    { value: &quot;terpene_education&quot;, label: &quot;Terpene Profile Education&quot; },
    { value: &quot;budtender_training&quot;, label: &quot;Budtender Training&quot; },
    { value: &quot;compliance_review&quot;, label: &quot;Compliance Review&quot; },
    { value: &quot;display_maintenance&quot;, label: &quot;Display Maintenance&quot; },
    {
      value: &quot;promotional_material&quot;,
      label: &quot;Promotional Material Distribution&quot;,
    },
    { value: &quot;customer_interaction&quot;, label: &quot;Customer Interaction&quot; },
    { value: &quot;kit_inventory&quot;, label: &quot;Kit Inventory Management&quot; },
    { value: &quot;restock_shelves&quot;, label: &quot;Restock Shelves&quot; },
    { value: &quot;product_transfer&quot;, label: &quot;Product Transfer Coordination&quot; },
    { value: &quot;competitor_analysis&quot;, label: &quot;Competitor Analysis&quot; },
    { value: &quot;market_feedback&quot;, label: &quot;Market Feedback Collection&quot; },
    { value: &quot;regional_trends&quot;, label: &quot;Regional Trends Assessment&quot; },
    { value: &quot;other_activity&quot;, label: &quot;Other Activity&quot; },
  ];

  // Approved dispensary locations in the system
  const approvedLocations = [
    {
      id: &quot;loc-001&quot;,
      name: &quot;Green Therapeutics Dispensary&quot;,
      address: &quot;123 Main Street, Los Angeles, CA&quot;,
      capacity: 50,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-002&quot;,
      name: &quot;Healing Leaf Collective&quot;,
      address: &quot;45 Market Avenue, San Francisco, CA&quot;,
      capacity: 35,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-003&quot;,
      name: &quot;Herbal Wellness Center&quot;,
      address: &quot;78 Highland Drive, Oakland, CA&quot;,
      capacity: 40,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-004&quot;,
      name: &quot;Emerald City Cannabis&quot;,
      address: &quot;10 Pacific Boulevard, San Diego, CA&quot;,
      capacity: 60,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-005&quot;,
      name: &quot;Coastal Dispensary&quot;,
      address: &quot;22 Ocean View, Santa Barbara, CA&quot;,
      capacity: 30,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-006&quot;,
      name: &quot;Nature's Medicine&quot;,
      address: &quot;55 Redwood Lane, Sacramento, CA&quot;,
      capacity: 45,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-007&quot;,
      name: &quot;Evergreen Dispensary&quot;,
      address: &quot;33 Valley Road, Phoenix, AZ&quot;,
      capacity: 50,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-008&quot;,
      name: &quot;Pure Relief Dispensary&quot;,
      address: &quot;67 Desert View, Tucson, AZ&quot;,
      capacity: 40,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-009&quot;,
      name: &quot;Great Lakes Cannabis Co.&quot;,
      address: &quot;12 Lakeshore Drive, Detroit, MI&quot;,
      capacity: 55,
      status: &quot;approved&quot;,
    },
    {
      id: &quot;loc-010&quot;,
      name: &quot;Midwest Healing Center&quot;,
      address: &quot;88 River Street, Grand Rapids, MI&quot;,
      capacity: 35,
      status: &quot;approved&quot;,
    },
  ];

  // Cannabis industry promotion types
  const promotionTypes = [
    { value: &quot;none&quot;, label: &quot;No Promotion&quot; },
    { value: &quot;first_time_discount&quot;, label: &quot;First-Time Patient Discount&quot; },
    { value: &quot;bogo&quot;, label: &quot;Buy One Get One (BOGO)&quot; },
    { value: &quot;percent_off&quot;, label: &quot;Percentage Off Products&quot; },
    { value: &quot;doorbuster&quot;, label: &quot;Doorbuster Special&quot; },
    { value: &quot;early_bird&quot;, label: &quot;Early Bird Special&quot; },
    { value: &quot;price_point&quot;, label: &quot;Special Price Point ($X per unit)&quot; },
    { value: &quot;bundle&quot;, label: &quot;Product Bundle Deal&quot; },
    { value: &quot;loyalty_points&quot;, label: &quot;Double Loyalty Points&quot; },
    { value: &quot;product_launch&quot;, label: &quot;New Product Launch Special&quot; },
    { value: &quot;bulk_discount&quot;, label: &quot;Bulk Purchase Discount&quot; },
    { value: &quot;freebie&quot;, label: &quot;Free Accessory/Merchandise&quot; },
    { value: &quot;brand_day&quot;, label: &quot;Brand Day Special&quot; },
    { value: &quot;holiday&quot;, label: &quot;Holiday/Seasonal Promotion&quot; },
    { value: &quot;other&quot;, label: &quot;Other Promotion&quot; },
  ];

  // Cannabis client-brand relationship data
  const clientsWithBrands = [
    {
      id: &quot;00000000-0000-0000-0000-000000000001&quot;,
      name: &quot;Rishi Internal&quot;,
      isDefault: false,
      brands: [], // Internal users pick client first, then see that client's brands
    },
    {
      id: &quot;00000000-0000-0000-0000-000000000002&quot;,
      name: &quot;Green Horizon Distribution&quot;,
      isDefault: false,
      brands: [
        { value: &quot;horizon_farms&quot;, label: &quot;Horizon Farms&quot; },
        { value: &quot;green_life&quot;, label: &quot;Green Life&quot; },
        { value: &quot;nature_therapeutics&quot;, label: &quot;Nature Therapeutics&quot; },
      ],
    },
    {
      id: &quot;00000000-0000-0000-0000-000000000003&quot;,
      name: &quot;Pacific Cannabis Brands&quot;,
      isDefault: false,
      brands: [
        { value: &quot;pacific_gold&quot;, label: &quot;Pacific Gold&quot; },
        { value: &quot;coastal_cannabis&quot;, label: &quot;Coastal Cannabis&quot; },
        { value: &quot;ocean_grown&quot;, label: &quot;Ocean Grown&quot; },
      ],
    },
    {
      id: &quot;00000000-0000-0000-0000-000000000004&quot;,
      name: &quot;Emerald Valley Products&quot;,
      isDefault: false,
      brands: [
        { value: &quot;emerald_extracts&quot;, label: &quot;Emerald Extracts&quot; },
        { value: &quot;valley_vapors&quot;, label: &quot;Valley Vapors&quot; },
        { value: &quot;pure_essence&quot;, label: &quot;Pure Essence&quot; },
      ],
    },
    {
      id: &quot;00000000-0000-0000-0000-000000000005&quot;,
      name: &quot;Highland Cultivators&quot;,
      isDefault: false,
      brands: [
        { value: &quot;highland_reserve&quot;, label: &quot;Highland Reserve&quot; },
        { value: &quot;mountain_grown&quot;, label: &quot;Mountain Grown&quot; },
        { value: &quot;alpine_therapeutics&quot;, label: &quot;Alpine Therapeutics&quot; },
      ],
    },
  ];

  // State to track selected client and available brands
  const [selectedClientId, setSelectedClientId] = useState<string>(&quot;&quot;);
  const [availableBrands, setAvailableBrands] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [selectedLocation, setLocationData] = useState<LocationDTO | null>(
    null,
  );
  const [isInternalUser, setIsInternalUser] = useState<boolean>(true); // Mock: In real app, get from auth context

  // Notifications
  const { toast } = useToast();

  // When client changes, update available brands
  React.useEffect(() => {
    if (selectedClientId) {
      const client = clientsWithBrands.find((c) => c.id === selectedClientId);
      if (client) {
        setAvailableBrands(client.brands);
        // Clear brand selection when client changes
        form.setValue(&quot;brand&quot;, &quot;&quot;);
      }
    } else {
      setAvailableBrands([]);
    }
  }, [selectedClientId, form]);

  // Simulate auto-selection for client users (not internal)
  React.useEffect(() => {
    if (!isInternalUser) {
      // In a real app, this would get the user's clientId from auth context
      // For mock purposes, we'll use Acme Corp
      const userClientId = &quot;00000000-0000-0000-0000-000000000002&quot;; // Acme Corp
      setSelectedClientId(userClientId);

      // Set available brands based on client
      const client = clientsWithBrands.find((c) => c.id === userClientId);
      if (client) {
        setAvailableBrands(client.brands);
      }
    }
  }, [isInternalUser]);

  // Create a state variable specifically for title updates
  const [titleUpdateTrigger, setTitleUpdateTrigger] = useState(0);

  // Watch for changes in ALL fields to ensure immediate title updates
  React.useEffect(() => {
    // Force re-render when any field changes, which will update the title
    const subscription = form.watch(() => {
      // Increment the counter to trigger a re-render
      setTitleUpdateTrigger((prev) => prev + 1);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Add a &quot;Quick Settings&quot; button to the Event Details page
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  // Add effect to automatically navigate to options tab when enabling options
  React.useEffect(() => {
    // Watch for changes to recurring or invites fields
    const subscription = form.watch((value, { name }) => {
      // If user enables either feature from a details panel quick toggle
      if (
        showQuickSettings &&
        activeTab === &quot;details&quot; &&
        (name === &quot;isRecurring&quot; || name === &quot;sendInvites&quot;)
      ) {
        // If the user has turned on either option
        if (
          (name === &quot;isRecurring&quot; && form.getValues(&quot;isRecurring&quot;)) ||
          (name === &quot;sendInvites&quot; && form.getValues(&quot;sendInvites&quot;))
        ) {
          // Switch to options tab automatically
          setActiveTab(&quot;options&quot;);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, activeTab, showQuickSettings, setActiveTab]);

  // Generate title from booking info (for display and submission)
  const generateTitle = (): string => {
    const brand = form.watch(&quot;brand&quot;);
    const eventType = form.watch(&quot;eventType&quot;);
    const activityType = form.watch(&quot;activityType&quot;);
    const locationId = form.watch(&quot;locationId&quot;);
    const date = form.watch(&quot;date&quot;);

    let generatedTitle = &quot;New Booking&quot;;

    // Build title progressively, adding parts as they become available
    if (brand) {
      // Get the brand label
      const brandLabel =
        availableBrands.find((b) => b.value === brand)?.label || brand;
      generatedTitle = brandLabel;

      // Add event type if available
      if (eventType) {
        const eventLabel =
          eventTypes.find((type) => type.value === eventType)?.label ||
          eventType;
        generatedTitle += ` - ${eventLabel}`;

        // Add activity type if available
        if (activityType) {
          const activityLabel =
            activityTypes.find((type) => type.value === activityType)?.label ||
            activityType;
          generatedTitle += ` (${activityLabel})`;
        }
      }

      // Add location if available
      if (locationId) {
        const locationName =
          selectedLocation?.name ||
          approvedLocations.find((loc) => loc.id === locationId)?.name ||
          locationId;
        generatedTitle += ` at ${locationName}`;

        // Add location status if pending approval
        if (selectedLocation?.status === LocationStatus.PENDING) {
          generatedTitle += &quot; (Location Pending Approval)&quot;;
        }
      }

      // Add date if available
      if (date) {
        generatedTitle += ` on ${format(date, &quot;MMM d, yyyy&quot;)}`;
      }
    }

    return generatedTitle;
  };

  // Handle form submission
  const handleSubmit = (data: BookingFormValues) => {
    setIsSubmitting(true);

    // Generate and include the title in the submission data
    const submissionData = {
      ...data,
      title: generateTitle(), // Add the auto-generated title
    };

    console.log(&quot;Submitting with data:&quot;, submissionData);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(submissionData);
    }, 1000);
  };

  return (
    <div className=&quot;bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm&quot;>
      <div className=&quot;p-6 border-b dark:border-gray-800&quot;>
        <div className=&quot;flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between&quot;>
          <div className=&quot;flex-1 group&quot;>
            <div className=&quot;flex items-center&quot;>
              <span className=&quot;text-sm font-medium text-muted-foreground mr-2&quot;>
                Event Title:
              </span>
              <span className=&quot;badge bg-primary/10 text-primary px-2 py-0.5 text-xs rounded&quot;>
                Live Preview
              </span>
            </div>
            <h2
              className=&quot;text-xl font-semibold text-primary mt-1 truncate group-hover:text-clip cursor-default&quot;
              title={generateTitle()}
              key={`title-${titleUpdateTrigger}`} // Force re-render on any form field change
            >
              {generateTitle()}
            </h2>
          </div>
        </div>
      </div>

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
                    className=&quot;rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none&quot;
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger
                    value=&quot;options&quot;
                    className=&quot;rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none relative&quot;
                  >
                    Options
                    {/* Add a small dot indicator to draw attention to the Options tab */}
                    <span className=&quot;absolute -right-1 -top-1 h-3 w-3 bg-primary rounded-full border-2 border-background&quot;></span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className=&quot;p-6&quot;>
              <TabsContent value=&quot;details&quot; className=&quot;mt-0 space-y-6&quot;>
                <div className=&quot;grid grid-cols-1 gap-6&quot;>
                  {/* Client Field - Only visible for internal users */}
                  {isInternalUser && (
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;clientId&quot;>Client</Label>
                      <Select
                        onValueChange={(value) => {
                          form.setValue(&quot;clientId&quot;, value);
                          setSelectedClientId(value);
                        }}
                        defaultValue={form.getValues(&quot;clientId&quot;)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder=&quot;Select a client&quot; />
                        </SelectTrigger>
                        <SelectContent>
                          {clientsWithBrands.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.clientId && (
                        <p className=&quot;text-sm font-medium text-destructive&quot;>
                          {form.formState.errors.clientId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Brand Field */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;brand&quot;>Brand</Label>
                    <Select
                      onValueChange={(value) => form.setValue(&quot;brand&quot;, value)}
                      defaultValue={form.getValues(&quot;brand&quot;)}
                      disabled={availableBrands.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableBrands.length === 0
                              ? &quot;Select a client first&quot;
                              : &quot;Select a brand&quot;
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBrands.map((brand) => (
                          <SelectItem key={brand.value} value={brand.value}>
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.brand && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.brand.message}
                      </p>
                    )}
                  </div>

                  {/* Event Type Field */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;eventType&quot;>Event Type</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(&quot;eventType&quot;, value)
                      }
                      defaultValue={form.getValues(&quot;eventType&quot;)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select an event type&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.eventType && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.eventType.message}
                      </p>
                    )}
                  </div>

                  {/* Location Field with Advanced Selection */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;locationId&quot;>Location</Label>
                    <LocationSelector
                      value={form.watch(&quot;locationId&quot;)}
                      onChange={(locationId, locationData) => {
                        form.setValue(&quot;locationId&quot;, locationId);

                        // Store the full location data for title generation
                        if (locationData) {
                          setLocationData(locationData);
                        }

                        // Show rejection message if location is rejected
                        if (
                          locationData &&
                          locationData.status === LocationStatus.REJECTED &&
                          locationData.rejectionReason
                        ) {
                          toast({
                            title: &quot;Location Rejected&quot;,
                            description: `This location has been rejected: ${locationData.rejectionReason}`,
                            variant: &quot;destructive&quot;,
                          });
                        }

                        // Show pending approval message if location is pending
                        if (
                          locationData &&
                          locationData.status === LocationStatus.PENDING
                        ) {
                          toast({
                            title: &quot;Location Pending Approval&quot;,
                            description:
                              &quot;You can still submit your booking, but it will require additional approval.&quot;,
                            variant: &quot;default&quot;,
                          });
                        }
                      }}
                      onCreateLocation={async (locationData) => {
                        // In a real implementation, this would make an API call to submit a new location request
                        // For now, we'll mock it with a pending status
                        // Create a location with proper handling of optional fields
                        const newLocation: LocationDTO = {
                          id: `new-${Date.now()}`, // Generate a temporary ID
                          name: locationData.name,
                          address1: locationData.address1,
                          city: locationData.city,
                          stateId: locationData.stateId,
                          zipcode: locationData.zipcode,
                          status: LocationStatus.PENDING, // New locations start as pending
                          type: locationData.type,
                        };

                        // Add optional fields only if they exist
                        if (locationData.address2) {
                          newLocation.address2 = locationData.address2;
                        }
                        if (locationData.notes) {
                          newLocation.notes = locationData.notes;
                        }

                        toast({
                          title: &quot;Location Request Submitted&quot;,
                          description:
                            &quot;Your location request has been submitted for approval.&quot;,
                        });

                        return newLocation;
                      }}
                    />
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      Select from existing locations or request a new one.
                      Bookings can be submitted with pending locations.
                    </p>
                    {form.formState.errors.locationId && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.locationId.message}
                      </p>
                    )}
                  </div>

                  <div className=&quot;grid grid-cols-2 gap-6&quot;>
                    {/* Date Field */}
                    <div className=&quot;space-y-2&quot;>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant=&quot;outline&quot;
                            className={cn(
                              &quot;w-full justify-start text-left font-normal&quot;,
                              !form.getValues(&quot;date&quot;) &&
                                &quot;text-muted-foreground&quot;,
                            )}
                          >
                            <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
                            {form.getValues(&quot;date&quot;) ? (
                              <span>
                                {format(form.getValues(&quot;date&quot;), &quot;PPP&quot;)}
                                <span className=&quot;ml-1 text-xs text-muted-foreground&quot;>
                                  ({getTimezoneAbbr()})
                                </span>
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className=&quot;w-auto p-3 border border-border shadow-md bg-background&quot;
                          align=&quot;start&quot;
                        >
                          {/*
                           * Enhanced DatePicker component with custom styling and behavior
                           * - Uses the form's date value directly for controlled input
                           * - Updates the form value on date change for instant validation
                           * - Displays inline (without its own input) for use in a Popover
                           * - Integrates with app's theme system via tailwind classes
                           */}
                          <DatePicker
                            selected={form.getValues(&quot;date&quot;)}
                            onChange={(date) =>
                              form.setValue(&quot;date&quot;, date as Date)
                            }
                            inline
                            dateFormat=&quot;PPP&quot; // Long date format from date-fns
                            showPopperArrow={false} // Removes default arrow for cleaner UI
                            calendarClassName=&quot;bg-background text-foreground rounded-md&quot; // Theme-aware styling
                            /**
                             * Custom header renderer for the DatePicker
                             * This replaces the default header with our own styled version
                             * that matches the application's design system
                             */
                            renderCustomHeader={({
                              date, // Current visible month/year date object
                              decreaseMonth, // Function to go to previous month
                              increaseMonth, // Function to go to next month
                              prevMonthButtonDisabled, // Boolean to disable prev button
                              nextMonthButtonDisabled, // Boolean to disable next button
                            }) => (
                              <div className=&quot;flex items-center justify-between px-2 py-2 text-foreground w-full&quot;>
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  type=&quot;button&quot;
                                  className=&quot;p-1.5 rounded-full hover:bg-muted dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30&quot;
                                >
                                  <ChevronLeft className=&quot;h-4 w-4&quot; />
                                </button>
                                <div className=&quot;text-sm font-medium&quot;>
                                  {format(date, &quot;MMMM yyyy&quot;)}
                                </div>
                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  type=&quot;button&quot;
                                  className=&quot;p-1.5 rounded-full hover:bg-muted dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30&quot;
                                >
                                  <ChevronRight className=&quot;h-4 w-4&quot; />
                                </button>
                              </div>
                            )}
                          />
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.date && (
                        <p className=&quot;text-sm font-medium text-destructive&quot;>
                          {form.formState.errors.date.message}
                        </p>
                      )}
                    </div>

                    {/* Activity Type */}
                    <div className=&quot;space-y-2&quot;>
                      <Label>Activity Type</Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue(&quot;activityType&quot;, value)
                        }
                        defaultValue={form.getValues(&quot;activityType&quot;)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder=&quot;Select activity type&quot; />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.activityType && (
                        <p className=&quot;text-sm font-medium text-destructive&quot;>
                          {form.formState.errors.activityType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className=&quot;grid grid-cols-2 gap-6&quot;>
                    {/* Start Time */}
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;startTime&quot;>Start Time</Label>
                      <div className=&quot;flex items-center space-x-2&quot;>
                        <Select
                          value={form.watch(&quot;startTime&quot;)}
                          onValueChange={(value) =>
                            form.setValue(&quot;startTime&quot;, value)
                          }
                        >
                          <SelectTrigger className=&quot;w-full&quot;>
                            <div className=&quot;flex items-center&quot;>
                              <Clock className=&quot;h-4 w-4 mr-2&quot; />
                              <SelectValue placeholder=&quot;Select start time&quot; />
                              {form.watch(&quot;startTime&quot;) && (
                                <span className=&quot;ml-1 text-xs text-muted-foreground&quot;>
                                  ({getTimezoneAbbr()})
                                </span>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent className=&quot;h-80 overflow-y-auto&quot;>
                            <div className=&quot;p-2 text-xs text-muted-foreground&quot;>
                              Local timezone:{&quot; &quot;}
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                            <SelectItem value=&quot;00:00&quot;>12:00 AM</SelectItem>
                            <SelectItem value=&quot;00:30&quot;>12:30 AM</SelectItem>
                            <SelectItem value=&quot;01:00&quot;>1:00 AM</SelectItem>
                            <SelectItem value=&quot;01:30&quot;>1:30 AM</SelectItem>
                            <SelectItem value=&quot;02:00&quot;>2:00 AM</SelectItem>
                            <SelectItem value=&quot;02:30&quot;>2:30 AM</SelectItem>
                            <SelectItem value=&quot;03:00&quot;>3:00 AM</SelectItem>
                            <SelectItem value=&quot;03:30&quot;>3:30 AM</SelectItem>
                            <SelectItem value=&quot;04:00&quot;>4:00 AM</SelectItem>
                            <SelectItem value=&quot;04:30&quot;>4:30 AM</SelectItem>
                            <SelectItem value=&quot;05:00&quot;>5:00 AM</SelectItem>
                            <SelectItem value=&quot;05:30&quot;>5:30 AM</SelectItem>
                            <SelectItem value=&quot;06:00&quot;>6:00 AM</SelectItem>
                            <SelectItem value=&quot;06:30&quot;>6:30 AM</SelectItem>
                            <SelectItem value=&quot;07:00&quot;>7:00 AM</SelectItem>
                            <SelectItem value=&quot;07:30&quot;>7:30 AM</SelectItem>
                            <SelectItem value=&quot;08:00&quot;>8:00 AM</SelectItem>
                            <SelectItem value=&quot;08:30&quot;>8:30 AM</SelectItem>
                            <SelectItem value=&quot;09:00&quot;>9:00 AM</SelectItem>
                            <SelectItem value=&quot;09:30&quot;>9:30 AM</SelectItem>
                            <SelectItem value=&quot;10:00&quot;>10:00 AM</SelectItem>
                            <SelectItem value=&quot;10:30&quot;>10:30 AM</SelectItem>
                            <SelectItem value=&quot;11:00&quot;>11:00 AM</SelectItem>
                            <SelectItem value=&quot;11:30&quot;>11:30 AM</SelectItem>
                            <SelectItem value=&quot;12:00&quot;>12:00 PM</SelectItem>
                            <SelectItem value=&quot;12:30&quot;>12:30 PM</SelectItem>
                            <SelectItem value=&quot;13:00&quot;>1:00 PM</SelectItem>
                            <SelectItem value=&quot;13:30&quot;>1:30 PM</SelectItem>
                            <SelectItem value=&quot;14:00&quot;>2:00 PM</SelectItem>
                            <SelectItem value=&quot;14:30&quot;>2:30 PM</SelectItem>
                            <SelectItem value=&quot;15:00&quot;>3:00 PM</SelectItem>
                            <SelectItem value=&quot;15:30&quot;>3:30 PM</SelectItem>
                            <SelectItem value=&quot;16:00&quot;>4:00 PM</SelectItem>
                            <SelectItem value=&quot;16:30&quot;>4:30 PM</SelectItem>
                            <SelectItem value=&quot;17:00&quot;>5:00 PM</SelectItem>
                            <SelectItem value=&quot;17:30&quot;>5:30 PM</SelectItem>
                            <SelectItem value=&quot;18:00&quot;>6:00 PM</SelectItem>
                            <SelectItem value=&quot;18:30&quot;>6:30 PM</SelectItem>
                            <SelectItem value=&quot;19:00&quot;>7:00 PM</SelectItem>
                            <SelectItem value=&quot;19:30&quot;>7:30 PM</SelectItem>
                            <SelectItem value=&quot;20:00&quot;>8:00 PM</SelectItem>
                            <SelectItem value=&quot;20:30&quot;>8:30 PM</SelectItem>
                            <SelectItem value=&quot;21:00&quot;>9:00 PM</SelectItem>
                            <SelectItem value=&quot;21:30&quot;>9:30 PM</SelectItem>
                            <SelectItem value=&quot;22:00&quot;>10:00 PM</SelectItem>
                            <SelectItem value=&quot;22:30&quot;>10:30 PM</SelectItem>
                            <SelectItem value=&quot;23:00&quot;>11:00 PM</SelectItem>
                            <SelectItem value=&quot;23:30&quot;>11:30 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.formState.errors.startTime && (
                        <p className=&quot;text-sm font-medium text-destructive&quot;>
                          {form.formState.errors.startTime.message}
                        </p>
                      )}
                    </div>

                    {/* End Time */}
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;endTime&quot;>End Time</Label>
                      <div className=&quot;flex items-center space-x-2&quot;>
                        <Select
                          value={form.watch(&quot;endTime&quot;)}
                          onValueChange={(value) =>
                            form.setValue(&quot;endTime&quot;, value)
                          }
                        >
                          <SelectTrigger className=&quot;w-full&quot;>
                            <div className=&quot;flex items-center&quot;>
                              <Clock className=&quot;h-4 w-4 mr-2&quot; />
                              <SelectValue placeholder=&quot;Select end time&quot; />
                              {form.watch(&quot;endTime&quot;) && (
                                <span className=&quot;ml-1 text-xs text-muted-foreground&quot;>
                                  ({getTimezoneAbbr()})
                                </span>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent className=&quot;h-80 overflow-y-auto&quot;>
                            <div className=&quot;p-2 text-xs text-muted-foreground&quot;>
                              Local timezone:{&quot; &quot;}
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                            <SelectItem value=&quot;00:00&quot;>12:00 AM</SelectItem>
                            <SelectItem value=&quot;00:30&quot;>12:30 AM</SelectItem>
                            <SelectItem value=&quot;01:00&quot;>1:00 AM</SelectItem>
                            <SelectItem value=&quot;01:30&quot;>1:30 AM</SelectItem>
                            <SelectItem value=&quot;02:00&quot;>2:00 AM</SelectItem>
                            <SelectItem value=&quot;02:30&quot;>2:30 AM</SelectItem>
                            <SelectItem value=&quot;03:00&quot;>3:00 AM</SelectItem>
                            <SelectItem value=&quot;03:30&quot;>3:30 AM</SelectItem>
                            <SelectItem value=&quot;04:00&quot;>4:00 AM</SelectItem>
                            <SelectItem value=&quot;04:30&quot;>4:30 AM</SelectItem>
                            <SelectItem value=&quot;05:00&quot;>5:00 AM</SelectItem>
                            <SelectItem value=&quot;05:30&quot;>5:30 AM</SelectItem>
                            <SelectItem value=&quot;06:00&quot;>6:00 AM</SelectItem>
                            <SelectItem value=&quot;06:30&quot;>6:30 AM</SelectItem>
                            <SelectItem value=&quot;07:00&quot;>7:00 AM</SelectItem>
                            <SelectItem value=&quot;07:30&quot;>7:30 AM</SelectItem>
                            <SelectItem value=&quot;08:00&quot;>8:00 AM</SelectItem>
                            <SelectItem value=&quot;08:30&quot;>8:30 AM</SelectItem>
                            <SelectItem value=&quot;09:00&quot;>9:00 AM</SelectItem>
                            <SelectItem value=&quot;09:30&quot;>9:30 AM</SelectItem>
                            <SelectItem value=&quot;10:00&quot;>10:00 AM</SelectItem>
                            <SelectItem value=&quot;10:30&quot;>10:30 AM</SelectItem>
                            <SelectItem value=&quot;11:00&quot;>11:00 AM</SelectItem>
                            <SelectItem value=&quot;11:30&quot;>11:30 AM</SelectItem>
                            <SelectItem value=&quot;12:00&quot;>12:00 PM</SelectItem>
                            <SelectItem value=&quot;12:30&quot;>12:30 PM</SelectItem>
                            <SelectItem value=&quot;13:00&quot;>1:00 PM</SelectItem>
                            <SelectItem value=&quot;13:30&quot;>1:30 PM</SelectItem>
                            <SelectItem value=&quot;14:00&quot;>2:00 PM</SelectItem>
                            <SelectItem value=&quot;14:30&quot;>2:30 PM</SelectItem>
                            <SelectItem value=&quot;15:00&quot;>3:00 PM</SelectItem>
                            <SelectItem value=&quot;15:30&quot;>3:30 PM</SelectItem>
                            <SelectItem value=&quot;16:00&quot;>4:00 PM</SelectItem>
                            <SelectItem value=&quot;16:30&quot;>4:30 PM</SelectItem>
                            <SelectItem value=&quot;17:00&quot;>5:00 PM</SelectItem>
                            <SelectItem value=&quot;17:30&quot;>5:30 PM</SelectItem>
                            <SelectItem value=&quot;18:00&quot;>6:00 PM</SelectItem>
                            <SelectItem value=&quot;18:30&quot;>6:30 PM</SelectItem>
                            <SelectItem value=&quot;19:00&quot;>7:00 PM</SelectItem>
                            <SelectItem value=&quot;19:30&quot;>7:30 PM</SelectItem>
                            <SelectItem value=&quot;20:00&quot;>8:00 PM</SelectItem>
                            <SelectItem value=&quot;20:30&quot;>8:30 PM</SelectItem>
                            <SelectItem value=&quot;21:00&quot;>9:00 PM</SelectItem>
                            <SelectItem value=&quot;21:30&quot;>9:30 PM</SelectItem>
                            <SelectItem value=&quot;22:00&quot;>10:00 PM</SelectItem>
                            <SelectItem value=&quot;22:30&quot;>10:30 PM</SelectItem>
                            <SelectItem value=&quot;23:00&quot;>11:00 PM</SelectItem>
                            <SelectItem value=&quot;23:30&quot;>11:30 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.formState.errors.endTime && (
                        <p className=&quot;text-sm font-medium text-destructive&quot;>
                          {form.formState.errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activity Type is now sufficient - removing separate activities selection */}

                  {/* Event Details */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;eventDetails&quot;>Event Details</Label>
                    <Textarea
                      id=&quot;eventDetails&quot;
                      placeholder=&quot;Enter any important details about the overall event&quot;
                      className=&quot;min-h-[100px]&quot;
                      {...form.register(&quot;eventDetails&quot;)}
                    />
                    {form.formState.errors.eventDetails && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.eventDetails.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className=&quot;flex justify-end mt-6&quot;>
                  <Button
                    type=&quot;button&quot;
                    onClick={() => setActiveTab(&quot;options&quot;)}
                    className=&quot;flex items-center gap-2&quot;
                  >
                    <span>Continue to Options</span>
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
                      <path d=&quot;M5 12h14&quot;></path>
                      <path d=&quot;m12 5 7 7-7 7&quot;></path>
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value=&quot;options&quot; className=&quot;mt-0 space-y-6&quot;>
                <div className=&quot;mb-4 p-3 bg-muted/30 rounded-md border border-muted flex items-start gap-3&quot;>
                  <svg
                    xmlns=&quot;http://www.w3.org/2000/svg&quot;
                    width=&quot;20&quot;
                    height=&quot;20&quot;
                    viewBox=&quot;0 0 24 24&quot;
                    fill=&quot;none&quot;
                    stroke=&quot;currentColor&quot;
                    strokeWidth=&quot;2&quot;
                    strokeLinecap=&quot;round&quot;
                    strokeLinejoin=&quot;round&quot;
                    className=&quot;text-primary mt-0.5&quot;
                  >
                    <circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot;></circle>
                    <line x1=&quot;12&quot; y1=&quot;16&quot; x2=&quot;12&quot; y2=&quot;12&quot;></line>
                    <line x1=&quot;12&quot; y1=&quot;8&quot; x2=&quot;12.01&quot; y2=&quot;8&quot;></line>
                  </svg>
                  <div>
                    <p className=&quot;font-medium text-sm&quot;>Additional Options</p>
                    <p className=&quot;text-muted-foreground text-sm&quot;>
                      Configure recurring events, promotional details, and
                      calendar invites for this booking.
                    </p>
                  </div>
                </div>
                <div className=&quot;grid grid-cols-1 gap-6&quot;>
                  {/* Promotion Type */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;promotionType&quot;>Promotion Type</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(&quot;promotionType&quot;, value)
                      }
                      value={form.watch(&quot;promotionType&quot;) || &quot;none&quot;}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select a promotion type&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        {promotionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.promotionType && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.promotionType.message}
                      </p>
                    )}
                  </div>

                  {/* Promotion Details */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;promotionDetails&quot;>Promotion Details</Label>
                    <Textarea
                      id=&quot;promotionDetails&quot;
                      placeholder=&quot;Enter promotion details and requirements&quot;
                      className=&quot;min-h-[100px]&quot;
                      {...form.register(&quot;promotionDetails&quot;)}
                      disabled={form.watch(&quot;promotionType&quot;) === &quot;none&quot;}
                    />
                    {form.formState.errors.promotionDetails && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.promotionDetails.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;notes&quot;>Additional Notes</Label>
                    <Textarea
                      id=&quot;notes&quot;
                      placeholder=&quot;Enter any additional information&quot;
                      className=&quot;min-h-[100px]&quot;
                      {...form.register(&quot;notes&quot;)}
                    />
                    {form.formState.errors.notes && (
                      <p className=&quot;text-sm font-medium text-destructive&quot;>
                        {form.formState.errors.notes.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Toggle Options */}
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
                          form.setValue(
                            &quot;isRecurring&quot;,
                            !form.watch(&quot;isRecurring&quot;),
                          )
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
                              <rect
                                x=&quot;3&quot;
                                y=&quot;4&quot;
                                width=&quot;18&quot;
                                height=&quot;18&quot;
                                rx=&quot;2&quot;
                                ry=&quot;2&quot;
                              ></rect>
                              <line x1=&quot;16&quot; y1=&quot;2&quot; x2=&quot;16&quot; y2=&quot;6&quot;></line>
                              <line x1=&quot;8&quot; y1=&quot;2&quot; x2=&quot;8&quot; y2=&quot;6&quot;></line>
                              <line x1=&quot;3&quot; y1=&quot;10&quot; x2=&quot;21&quot; y2=&quot;10&quot;></line>
                              <line x1=&quot;8&quot; y1=&quot;14&quot; x2=&quot;8&quot; y2=&quot;14&quot;></line>
                              <line x1=&quot;12&quot; y1=&quot;14&quot; x2=&quot;12&quot; y2=&quot;14&quot;></line>
                              <line x1=&quot;16&quot; y1=&quot;14&quot; x2=&quot;16&quot; y2=&quot;14&quot;></line>
                              <line x1=&quot;8&quot; y1=&quot;18&quot; x2=&quot;8&quot; y2=&quot;18&quot;></line>
                              <line x1=&quot;12&quot; y1=&quot;18&quot; x2=&quot;12&quot; y2=&quot;18&quot;></line>
                              <line x1=&quot;16&quot; y1=&quot;18&quot; x2=&quot;16&quot; y2=&quot;18&quot;></line>
                            </svg>
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
                            <Label htmlFor=&quot;recurringFrequency&quot;>
                              Frequency
                            </Label>
                            <Select
                              value={
                                form.watch(&quot;recurringFrequency&quot;) || &quot;weekly&quot;
                              }
                              onValueChange={(
                                value:
                                  | &quot;daily&quot;
                                  | &quot;weekly&quot;
                                  | &quot;biweekly&quot;
                                  | &quot;monthly&quot;,
                              ) => form.setValue(&quot;recurringFrequency&quot;, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder=&quot;Select frequency&quot; />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=&quot;daily&quot;>
                                  Daily (every day)
                                </SelectItem>
                                <SelectItem value=&quot;weekly&quot;>
                                  Weekly (every 7 days)
                                </SelectItem>
                                <SelectItem value=&quot;biweekly&quot;>
                                  Bi-weekly (every 14 days)
                                </SelectItem>
                                <SelectItem value=&quot;monthly&quot;>
                                  Monthly (every 30 days)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Occurrences Count */}
                          <div className=&quot;space-y-2&quot;>
                            <Label htmlFor=&quot;recurringCount&quot;>
                              Number of events
                            </Label>
                            <Select
                              value={
                                form.watch(&quot;recurringCount&quot;)?.toString() || &quot;4&quot;
                              }
                              onValueChange={(value) => {
                                const count = parseInt(value, 10);
                                if (!isNaN(count)) {
                                  form.setValue(&quot;recurringCount&quot;, count);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder=&quot;Select count&quot; />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Generate options from 2-10 events */}
                                {Array.from({ length: 9 }, (_, i) => i + 2).map(
                                  (count) => (
                                    <SelectItem
                                      key={count}
                                      value={count.toString()}
                                    >
                                      {count} events
                                    </SelectItem>
                                  ),
                                )}
                                {/* Common event frequencies */}
                                <SelectItem value=&quot;12&quot;>
                                  12 events (quarterly)
                                </SelectItem>
                                <SelectItem value=&quot;24&quot;>
                                  24 events (biweekly)
                                </SelectItem>
                                <SelectItem value=&quot;52&quot;>
                                  52 events (weekly)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Preview of dates (optional enhancement) */}
                          <div className=&quot;col-span-2 mt-3 p-3 bg-primary/5 rounded-md border border-primary/10&quot;>
                            <p className=&quot;font-medium text-sm text-primary flex items-center gap-2&quot;>
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
                                <rect
                                  x=&quot;3&quot;
                                  y=&quot;4&quot;
                                  width=&quot;18&quot;
                                  height=&quot;18&quot;
                                  rx=&quot;2&quot;
                                  ry=&quot;2&quot;
                                ></rect>
                                <line x1=&quot;16&quot; y1=&quot;2&quot; x2=&quot;16&quot; y2=&quot;6&quot;></line>
                                <line x1=&quot;8&quot; y1=&quot;2&quot; x2=&quot;8&quot; y2=&quot;6&quot;></line>
                                <line x1=&quot;3&quot; y1=&quot;10&quot; x2=&quot;21&quot; y2=&quot;10&quot;></line>
                              </svg>
                              Recurring Series Preview
                            </p>
                            <div className=&quot;mt-2&quot;>
                              <p className=&quot;text-sm&quot;>
                                Starting on{&quot; &quot;}
                                <span className=&quot;font-medium&quot;>
                                  {format(
                                    form.watch(&quot;date&quot;) || new Date(),
                                    &quot;MMMM d, yyyy&quot;,
                                  )}
                                </span>
                                , this will create{&quot; &quot;}
                                <span className=&quot;font-medium&quot;>
                                  {form.watch(&quot;recurringCount&quot;) || 4}
                                </span>{&quot; &quot;}
                                events,
                                {form.watch(&quot;recurringFrequency&quot;) === &quot;daily&quot; &&
                                  &quot; one per day&quot;}
                                {form.watch(&quot;recurringFrequency&quot;) ===
                                  &quot;weekly&quot; && &quot; one per week&quot;}
                                {form.watch(&quot;recurringFrequency&quot;) ===
                                  &quot;biweekly&quot; && &quot; one every two weeks&quot;}
                                {form.watch(&quot;recurringFrequency&quot;) ===
                                  &quot;monthly&quot; && &quot; one per month&quot;}
                                .
                              </p>
                              <p className=&quot;text-xs text-muted-foreground mt-1&quot;>
                                Each event will have the same details (time,
                                location, etc.) but occur on different dates.
                              </p>
                            </div>
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
                          form.setValue(
                            &quot;sendInvites&quot;,
                            !form.watch(&quot;sendInvites&quot;),
                          )
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
                          <div className=&quot;flex justify-between items-start&quot;>
                            <div>
                              <Label
                                htmlFor=&quot;inviteEmails&quot;
                                className=&quot;flex items-center gap-2&quot;
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
                                Participant Email Addresses
                              </Label>
                              <p className=&quot;text-xs text-muted-foreground&quot;>
                                Each person will receive an email with a
                                calendar invitation
                              </p>
                            </div>
                          </div>

                          <Textarea
                            id=&quot;inviteEmails&quot;
                            placeholder=&quot;Enter email addresses separated by commas (e.g., user@example.com, person@company.com)&quot;
                            {...form.register(&quot;inviteEmails&quot;)}
                            className=&quot;min-h-[100px]&quot;
                          />

                          <div className=&quot;flex items-start gap-2 p-2 bg-primary/5 rounded-sm&quot;>
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
                              className=&quot;text-primary mt-0.5&quot;
                            >
                              <circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot;></circle>
                              <line x1=&quot;12&quot; y1=&quot;16&quot; x2=&quot;12&quot; y2=&quot;12&quot;></line>
                              <line x1=&quot;12&quot; y1=&quot;8&quot; x2=&quot;12.01&quot; y2=&quot;8&quot;></line>
                            </svg>
                            <p className=&quot;text-xs text-muted-foreground&quot;>
                              Invitations will include all event details (date,
                              time, location) and will appear in recipients'
                              calendar applications like Google Calendar,
                              Outlook, or Apple Calendar.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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
