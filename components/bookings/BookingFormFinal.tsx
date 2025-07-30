"use client";

import React, { useState } from "react";

// Get 3-letter timezone abbreviation
function getTimezoneAbbr() {
  // Try to get standard format like EDT, PDT, etc.
  const options = { timeZoneName: "short" } as Intl.DateTimeFormatOptions;
  const dateString = new Date().toLocaleTimeString("en-US", options);
  const abbr = dateString.split(" ")[2];
  return abbr && abbr.length <= 5 ? abbr : "Local"; // Fallback to 'Local' if no abbreviation found
}
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Base styles for the datepicker

import { useToast } from "@/hooks/use-toast";
// Mock location types and status for development
enum LocationType {
  VENUE = "VENUE",
  OFFICE = "OFFICE",
  STORAGE = "STORAGE",
  OTHER = "OTHER",
}

enum LocationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LocationSelector } from "@/components/locations/LocationSelector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define the booking form schema
const bookingFormSchema = z.object({
  // title is auto-generated, not a direct field
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string().min(1, { message: "Please enter a start time" }),
  endTime: z.string().min(1, { message: "Please enter an end time" }),
  locationId: z.string().min(1, { message: "Please select a location" }),
  activityType: z
    .string()
    .min(1, { message: "Please select an activity type" }),
  eventType: z.string().min(1, { message: "Please select an event type" }),
  clientId: z.string().min(1, { message: "Please select a client" }),
  brand: z.string().min(1, { message: "Please select a brand" }),
  eventDetails: z.string().optional(),
  promotionType: z.string().optional(),
  promotionDetails: z.string().optional(),
  notes: z.string().optional(),

  // Recurring event settings
  isRecurring: z.boolean().default(false),
  recurringFrequency: z
    .enum(["daily", "weekly", "biweekly", "monthly"])
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
  const [activeTab, setActiveTab] = useState("details");

  // Initialize form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      locationId: "",
      activityType: "",
      eventType: "",
      clientId: "",
      brand: "",
      eventDetails: "",
      promotionType: "none",
      promotionDetails: "",
      notes: "",
      isRecurring: false,
      recurringFrequency: "weekly",
      recurringCount: 4,
      sendInvites: false,
      inviteEmails: "",
      ...defaultValues,
    },
  });

  // Event type options for cannabis industry
  const eventTypes = [
    { value: "dispensary_popup", label: "Dispensary Pop-up" },
    { value: "product_launch", label: "Product Launch" },
    { value: "in_store_demo", label: "In-Store Demonstration" },
    { value: "vendor_day", label: "Vendor Day" },
    { value: "cannabis_expo", label: "Cannabis Expo/Convention" },
    { value: "patient_education", label: "Patient Education Event" },
    { value: "budtender_training", label: "Budtender Training" },
    { value: "secret_shopping", label: "Secret Shopping" },
    { value: "industry_event", label: "Industry Networking Event" },
    { value: "seasonal_promotion", label: "Seasonal Promotion" },
    { value: "other", label: "Other" },
  ];

  // Activity type options for cannabis industry
  const activityTypes = [
    { value: "brand_representation", label: "Brand Representation" },
    { value: "merchandising", label: "Merchandising" },
    { value: "product_demo", label: "Product Demonstration" },
    { value: "staff_training", label: "Staff Training" },
    { value: "patient_education", label: "Patient Education" },
    { value: "product_sampling", label: "Product Sampling (where legal)" },
    { value: "logistics", label: "Logistics/Kit Movement" },
    { value: "market_research", label: "Market Research" },
    { value: "display_setup", label: "Display Setup" },
    { value: "consumer_education", label: "Consumer Education" },
    { value: "other", label: "Other" },
  ];

  // Activities available for cannabis industry
  const availableActivities = [
    { value: "product_explanation", label: "Product Explanation" },
    { value: "strain_education", label: "Strain/Variety Education" },
    { value: "consumption_guidance", label: "Consumption Guidance" },
    { value: "terpene_education", label: "Terpene Profile Education" },
    { value: "budtender_training", label: "Budtender Training" },
    { value: "compliance_review", label: "Compliance Review" },
    { value: "display_maintenance", label: "Display Maintenance" },
    {
      value: "promotional_material",
      label: "Promotional Material Distribution",
    },
    { value: "customer_interaction", label: "Customer Interaction" },
    { value: "kit_inventory", label: "Kit Inventory Management" },
    { value: "restock_shelves", label: "Restock Shelves" },
    { value: "product_transfer", label: "Product Transfer Coordination" },
    { value: "competitor_analysis", label: "Competitor Analysis" },
    { value: "market_feedback", label: "Market Feedback Collection" },
    { value: "regional_trends", label: "Regional Trends Assessment" },
    { value: "other_activity", label: "Other Activity" },
  ];

  // Approved dispensary locations in the system
  const approvedLocations = [
    {
      id: "loc-001",
      name: "Green Therapeutics Dispensary",
      address: "123 Main Street, Los Angeles, CA",
      capacity: 50,
      status: "approved",
    },
    {
      id: "loc-002",
      name: "Healing Leaf Collective",
      address: "45 Market Avenue, San Francisco, CA",
      capacity: 35,
      status: "approved",
    },
    {
      id: "loc-003",
      name: "Herbal Wellness Center",
      address: "78 Highland Drive, Oakland, CA",
      capacity: 40,
      status: "approved",
    },
    {
      id: "loc-004",
      name: "Emerald City Cannabis",
      address: "10 Pacific Boulevard, San Diego, CA",
      capacity: 60,
      status: "approved",
    },
    {
      id: "loc-005",
      name: "Coastal Dispensary",
      address: "22 Ocean View, Santa Barbara, CA",
      capacity: 30,
      status: "approved",
    },
    {
      id: "loc-006",
      name: "Nature's Medicine",
      address: "55 Redwood Lane, Sacramento, CA",
      capacity: 45,
      status: "approved",
    },
    {
      id: "loc-007",
      name: "Evergreen Dispensary",
      address: "33 Valley Road, Phoenix, AZ",
      capacity: 50,
      status: "approved",
    },
    {
      id: "loc-008",
      name: "Pure Relief Dispensary",
      address: "67 Desert View, Tucson, AZ",
      capacity: 40,
      status: "approved",
    },
    {
      id: "loc-009",
      name: "Great Lakes Cannabis Co.",
      address: "12 Lakeshore Drive, Detroit, MI",
      capacity: 55,
      status: "approved",
    },
    {
      id: "loc-010",
      name: "Midwest Healing Center",
      address: "88 River Street, Grand Rapids, MI",
      capacity: 35,
      status: "approved",
    },
  ];

  // Cannabis industry promotion types
  const promotionTypes = [
    { value: "none", label: "No Promotion" },
    { value: "first_time_discount", label: "First-Time Patient Discount" },
    { value: "bogo", label: "Buy One Get One (BOGO)" },
    { value: "percent_off", label: "Percentage Off Products" },
    { value: "doorbuster", label: "Doorbuster Special" },
    { value: "early_bird", label: "Early Bird Special" },
    { value: "price_point", label: "Special Price Point ($X per unit)" },
    { value: "bundle", label: "Product Bundle Deal" },
    { value: "loyalty_points", label: "Double Loyalty Points" },
    { value: "product_launch", label: "New Product Launch Special" },
    { value: "bulk_discount", label: "Bulk Purchase Discount" },
    { value: "freebie", label: "Free Accessory/Merchandise" },
    { value: "brand_day", label: "Brand Day Special" },
    { value: "holiday", label: "Holiday/Seasonal Promotion" },
    { value: "other", label: "Other Promotion" },
  ];

  // Cannabis client-brand relationship data
  const clientsWithBrands = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Rishi Internal",
      isDefault: false,
      brands: [], // Internal users pick client first, then see that client's brands
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Green Horizon Distribution",
      isDefault: false,
      brands: [
        { value: "horizon_farms", label: "Horizon Farms" },
        { value: "green_life", label: "Green Life" },
        { value: "nature_therapeutics", label: "Nature Therapeutics" },
      ],
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Pacific Cannabis Brands",
      isDefault: false,
      brands: [
        { value: "pacific_gold", label: "Pacific Gold" },
        { value: "coastal_cannabis", label: "Coastal Cannabis" },
        { value: "ocean_grown", label: "Ocean Grown" },
      ],
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      name: "Emerald Valley Products",
      isDefault: false,
      brands: [
        { value: "emerald_extracts", label: "Emerald Extracts" },
        { value: "valley_vapors", label: "Valley Vapors" },
        { value: "pure_essence", label: "Pure Essence" },
      ],
    },
    {
      id: "00000000-0000-0000-0000-000000000005",
      name: "Highland Cultivators",
      isDefault: false,
      brands: [
        { value: "highland_reserve", label: "Highland Reserve" },
        { value: "mountain_grown", label: "Mountain Grown" },
        { value: "alpine_therapeutics", label: "Alpine Therapeutics" },
      ],
    },
  ];

  // State to track selected client and available brands
  const [selectedClientId, setSelectedClientId] = useState<string>("");
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
        form.setValue("brand", "");
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
      const userClientId = "00000000-0000-0000-0000-000000000002"; // Acme Corp
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

  // Add a "Quick Settings" button to the Event Details page
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  // Add effect to automatically navigate to options tab when enabling options
  React.useEffect(() => {
    // Watch for changes to recurring or invites fields
    const subscription = form.watch((value, { name }) => {
      // If user enables either feature from a details panel quick toggle
      if (
        showQuickSettings &&
        activeTab === "details" &&
        (name === "isRecurring" || name === "sendInvites")
      ) {
        // If the user has turned on either option
        if (
          (name === "isRecurring" && form.getValues("isRecurring")) ||
          (name === "sendInvites" && form.getValues("sendInvites"))
        ) {
          // Switch to options tab automatically
          setActiveTab("options");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, activeTab, showQuickSettings, setActiveTab]);

  // Generate title from booking info (for display and submission)
  const generateTitle = (): string => {
    const brand = form.watch("brand");
    const eventType = form.watch("eventType");
    const activityType = form.watch("activityType");
    const locationId = form.watch("locationId");
    const date = form.watch("date");

    let generatedTitle = "New Booking";

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
          generatedTitle += " (Location Pending Approval)";
        }
      }

      // Add date if available
      if (date) {
        generatedTitle += ` on ${format(date, "MMM d, yyyy")}`;
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

    console.log("Submitting with data:", submissionData);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(submissionData);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b dark:border-gray-800">
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 group">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Event Title:
              </span>
              <span className="badge bg-primary/10 text-primary px-2 py-0.5 text-xs rounded">
                Live Preview
              </span>
            </div>
            <h2
              className="text-xl font-semibold text-primary mt-1 truncate group-hover:text-clip cursor-default"
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
            className="w-full"
          >
            <div className="border-b">
              <div className="px-6">
                <TabsList className="grid grid-cols-2 mt-4 bg-transparent">
                  <TabsTrigger
                    value="details"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="options"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none relative"
                  >
                    Options
                    {/* Add a small dot indicator to draw attention to the Options tab */}
                    <span className="absolute -right-1 -top-1 h-3 w-3 bg-primary rounded-full border-2 border-background"></span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="details" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Client Field - Only visible for internal users */}
                  {isInternalUser && (
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client</Label>
                      <Select
                        onValueChange={(value) => {
                          form.setValue("clientId", value);
                          setSelectedClientId(value);
                        }}
                        defaultValue={form.getValues("clientId")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
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
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.clientId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Brand Field */}
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      onValueChange={(value) => form.setValue("brand", value)}
                      defaultValue={form.getValues("brand")}
                      disabled={availableBrands.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableBrands.length === 0
                              ? "Select a client first"
                              : "Select a brand"
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
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.brand.message}
                      </p>
                    )}
                  </div>

                  {/* Event Type Field */}
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("eventType", value)
                      }
                      defaultValue={form.getValues("eventType")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
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
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.eventType.message}
                      </p>
                    )}
                  </div>

                  {/* Location Field with Advanced Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Location</Label>
                    <LocationSelector
                      value={form.watch("locationId")}
                      onChange={(locationId, locationData) => {
                        form.setValue("locationId", locationId);

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
                            title: "Location Rejected",
                            description: `This location has been rejected: ${locationData.rejectionReason}`,
                            variant: "destructive",
                          });
                        }

                        // Show pending approval message if location is pending
                        if (
                          locationData &&
                          locationData.status === LocationStatus.PENDING
                        ) {
                          toast({
                            title: "Location Pending Approval",
                            description:
                              "You can still submit your booking, but it will require additional approval.",
                            variant: "default",
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
                          title: "Location Request Submitted",
                          description:
                            "Your location request has been submitted for approval.",
                        });

                        return newLocation;
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Select from existing locations or request a new one.
                      Bookings can be submitted with pending locations.
                    </p>
                    {form.formState.errors.locationId && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.locationId.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Date Field */}
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.getValues("date") &&
                                "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.getValues("date") ? (
                              <span>
                                {format(form.getValues("date"), "PPP")}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({getTimezoneAbbr()})
                                </span>
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-3 border border-border shadow-md bg-background"
                          align="start"
                        >
                          {/*
                           * Enhanced DatePicker component with custom styling and behavior
                           * - Uses the form's date value directly for controlled input
                           * - Updates the form value on date change for instant validation
                           * - Displays inline (without its own input) for use in a Popover
                           * - Integrates with app's theme system via tailwind classes
                           */}
                          <DatePicker
                            selected={form.getValues("date")}
                            onChange={(date) =>
                              form.setValue("date", date as Date)
                            }
                            inline
                            dateFormat="PPP" // Long date format from date-fns
                            showPopperArrow={false} // Removes default arrow for cleaner UI
                            calendarClassName="bg-background text-foreground rounded-md" // Theme-aware styling
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
                              <div className="flex items-center justify-between px-2 py-2 text-foreground w-full">
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  type="button"
                                  className="p-1.5 rounded-full hover:bg-muted dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="text-sm font-medium">
                                  {format(date, "MMMM yyyy")}
                                </div>
                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  type="button"
                                  className="p-1.5 rounded-full hover:bg-muted dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          />
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.date && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.date.message}
                        </p>
                      )}
                    </div>

                    {/* Activity Type */}
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("activityType", value)
                        }
                        defaultValue={form.getValues("activityType")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
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
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.activityType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={form.watch("startTime")}
                          onValueChange={(value) =>
                            form.setValue("startTime", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Select start time" />
                              {form.watch("startTime") && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({getTimezoneAbbr()})
                                </span>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent className="h-80 overflow-y-auto">
                            <div className="p-2 text-xs text-muted-foreground">
                              Local timezone:{" "}
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                            <SelectItem value="00:00">12:00 AM</SelectItem>
                            <SelectItem value="00:30">12:30 AM</SelectItem>
                            <SelectItem value="01:00">1:00 AM</SelectItem>
                            <SelectItem value="01:30">1:30 AM</SelectItem>
                            <SelectItem value="02:00">2:00 AM</SelectItem>
                            <SelectItem value="02:30">2:30 AM</SelectItem>
                            <SelectItem value="03:00">3:00 AM</SelectItem>
                            <SelectItem value="03:30">3:30 AM</SelectItem>
                            <SelectItem value="04:00">4:00 AM</SelectItem>
                            <SelectItem value="04:30">4:30 AM</SelectItem>
                            <SelectItem value="05:00">5:00 AM</SelectItem>
                            <SelectItem value="05:30">5:30 AM</SelectItem>
                            <SelectItem value="06:00">6:00 AM</SelectItem>
                            <SelectItem value="06:30">6:30 AM</SelectItem>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="07:30">7:30 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="08:30">8:30 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="09:30">9:30 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="10:30">10:30 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="11:30">11:30 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="12:30">12:30 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="13:30">1:30 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="14:30">2:30 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="15:30">3:30 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="16:30">4:30 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                            <SelectItem value="17:30">5:30 PM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="18:30">6:30 PM</SelectItem>
                            <SelectItem value="19:00">7:00 PM</SelectItem>
                            <SelectItem value="19:30">7:30 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                            <SelectItem value="20:30">8:30 PM</SelectItem>
                            <SelectItem value="21:00">9:00 PM</SelectItem>
                            <SelectItem value="21:30">9:30 PM</SelectItem>
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                            <SelectItem value="22:30">10:30 PM</SelectItem>
                            <SelectItem value="23:00">11:00 PM</SelectItem>
                            <SelectItem value="23:30">11:30 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.formState.errors.startTime && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.startTime.message}
                        </p>
                      )}
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={form.watch("endTime")}
                          onValueChange={(value) =>
                            form.setValue("endTime", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Select end time" />
                              {form.watch("endTime") && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({getTimezoneAbbr()})
                                </span>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent className="h-80 overflow-y-auto">
                            <div className="p-2 text-xs text-muted-foreground">
                              Local timezone:{" "}
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                            <SelectItem value="00:00">12:00 AM</SelectItem>
                            <SelectItem value="00:30">12:30 AM</SelectItem>
                            <SelectItem value="01:00">1:00 AM</SelectItem>
                            <SelectItem value="01:30">1:30 AM</SelectItem>
                            <SelectItem value="02:00">2:00 AM</SelectItem>
                            <SelectItem value="02:30">2:30 AM</SelectItem>
                            <SelectItem value="03:00">3:00 AM</SelectItem>
                            <SelectItem value="03:30">3:30 AM</SelectItem>
                            <SelectItem value="04:00">4:00 AM</SelectItem>
                            <SelectItem value="04:30">4:30 AM</SelectItem>
                            <SelectItem value="05:00">5:00 AM</SelectItem>
                            <SelectItem value="05:30">5:30 AM</SelectItem>
                            <SelectItem value="06:00">6:00 AM</SelectItem>
                            <SelectItem value="06:30">6:30 AM</SelectItem>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="07:30">7:30 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="08:30">8:30 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="09:30">9:30 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="10:30">10:30 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="11:30">11:30 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="12:30">12:30 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="13:30">1:30 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="14:30">2:30 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="15:30">3:30 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="16:30">4:30 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                            <SelectItem value="17:30">5:30 PM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="18:30">6:30 PM</SelectItem>
                            <SelectItem value="19:00">7:00 PM</SelectItem>
                            <SelectItem value="19:30">7:30 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                            <SelectItem value="20:30">8:30 PM</SelectItem>
                            <SelectItem value="21:00">9:00 PM</SelectItem>
                            <SelectItem value="21:30">9:30 PM</SelectItem>
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                            <SelectItem value="22:30">10:30 PM</SelectItem>
                            <SelectItem value="23:00">11:00 PM</SelectItem>
                            <SelectItem value="23:30">11:30 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.formState.errors.endTime && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activity Type is now sufficient - removing separate activities selection */}

                  {/* Event Details */}
                  <div className="space-y-2">
                    <Label htmlFor="eventDetails">Event Details</Label>
                    <Textarea
                      id="eventDetails"
                      placeholder="Enter any important details about the overall event"
                      className="min-h-[100px]"
                      {...form.register("eventDetails")}
                    />
                    {form.formState.errors.eventDetails && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.eventDetails.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("options")}
                    className="flex items-center gap-2"
                  >
                    <span>Continue to Options</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="options" className="mt-0 space-y-6">
                <div className="mb-4 p-3 bg-muted/30 rounded-md border border-muted flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div>
                    <p className="font-medium text-sm">Additional Options</p>
                    <p className="text-muted-foreground text-sm">
                      Configure recurring events, promotional details, and
                      calendar invites for this booking.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {/* Promotion Type */}
                  <div className="space-y-2">
                    <Label htmlFor="promotionType">Promotion Type</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("promotionType", value)
                      }
                      value={form.watch("promotionType") || "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a promotion type" />
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
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.promotionType.message}
                      </p>
                    )}
                  </div>

                  {/* Promotion Details */}
                  <div className="space-y-2">
                    <Label htmlFor="promotionDetails">Promotion Details</Label>
                    <Textarea
                      id="promotionDetails"
                      placeholder="Enter promotion details and requirements"
                      className="min-h-[100px]"
                      {...form.register("promotionDetails")}
                      disabled={form.watch("promotionType") === "none"}
                    />
                    {form.formState.errors.promotionDetails && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.promotionDetails.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter any additional information"
                      className="min-h-[100px]"
                      {...form.register("notes")}
                    />
                    {form.formState.errors.notes && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.notes.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Toggle Options */}
                  <div className="space-y-6">
                    {/* Recurring Event Option */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className={cn(
                          "w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors",
                          form.watch("isRecurring") && "border-b border-border",
                        )}
                        onClick={() =>
                          form.setValue(
                            "isRecurring",
                            !form.watch("isRecurring"),
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full",
                              form.watch("isRecurring")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted-foreground/20 text-muted-foreground",
                            )}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                              <line x1="8" y1="14" x2="8" y2="14"></line>
                              <line x1="12" y1="14" x2="12" y2="14"></line>
                              <line x1="16" y1="14" x2="16" y2="14"></line>
                              <line x1="8" y1="18" x2="8" y2="18"></line>
                              <line x1="12" y1="18" x2="12" y2="18"></line>
                              <line x1="16" y1="18" x2="16" y2="18"></line>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Recurring Event</div>
                            <p className="text-muted-foreground text-sm">
                              Set this event to repeat on a schedule
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-sm",
                              form.watch("isRecurring")
                                ? "text-primary font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {form.watch("isRecurring") ? "Enabled" : "Disabled"}
                          </span>
                          <div
                            className="transform transition-transform duration-200"
                            style={{
                              transform: form.watch("isRecurring")
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {form.watch("isRecurring") && (
                        <div className="p-4 grid grid-cols-2 gap-4">
                          {/* Frequency Selection */}
                          <div className="space-y-2">
                            <Label htmlFor="recurringFrequency">
                              Frequency
                            </Label>
                            <Select
                              value={
                                form.watch("recurringFrequency") || "weekly"
                              }
                              onValueChange={(
                                value:
                                  | "daily"
                                  | "weekly"
                                  | "biweekly"
                                  | "monthly",
                              ) => form.setValue("recurringFrequency", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">
                                  Daily (every day)
                                </SelectItem>
                                <SelectItem value="weekly">
                                  Weekly (every 7 days)
                                </SelectItem>
                                <SelectItem value="biweekly">
                                  Bi-weekly (every 14 days)
                                </SelectItem>
                                <SelectItem value="monthly">
                                  Monthly (every 30 days)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Occurrences Count */}
                          <div className="space-y-2">
                            <Label htmlFor="recurringCount">
                              Number of events
                            </Label>
                            <Select
                              value={
                                form.watch("recurringCount")?.toString() || "4"
                              }
                              onValueChange={(value) => {
                                const count = parseInt(value, 10);
                                if (!isNaN(count)) {
                                  form.setValue("recurringCount", count);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select count" />
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
                                <SelectItem value="12">
                                  12 events (quarterly)
                                </SelectItem>
                                <SelectItem value="24">
                                  24 events (biweekly)
                                </SelectItem>
                                <SelectItem value="52">
                                  52 events (weekly)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Preview of dates (optional enhancement) */}
                          <div className="col-span-2 mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
                            <p className="font-medium text-sm text-primary flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              Recurring Series Preview
                            </p>
                            <div className="mt-2">
                              <p className="text-sm">
                                Starting on{" "}
                                <span className="font-medium">
                                  {format(
                                    form.watch("date") || new Date(),
                                    "MMMM d, yyyy",
                                  )}
                                </span>
                                , this will create{" "}
                                <span className="font-medium">
                                  {form.watch("recurringCount") || 4}
                                </span>{" "}
                                events,
                                {form.watch("recurringFrequency") === "daily" &&
                                  " one per day"}
                                {form.watch("recurringFrequency") ===
                                  "weekly" && " one per week"}
                                {form.watch("recurringFrequency") ===
                                  "biweekly" && " one every two weeks"}
                                {form.watch("recurringFrequency") ===
                                  "monthly" && " one per month"}
                                .
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Each event will have the same details (time,
                                location, etc.) but occur on different dates.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Calendar Invites Option */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className={cn(
                          "w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors",
                          form.watch("sendInvites") && "border-b border-border",
                        )}
                        onClick={() =>
                          form.setValue(
                            "sendInvites",
                            !form.watch("sendInvites"),
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full",
                              form.watch("sendInvites")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted-foreground/20 text-muted-foreground",
                            )}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">
                              Send Calendar Invites
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Send calendar invitations to all participants
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-sm",
                              form.watch("sendInvites")
                                ? "text-primary font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {form.watch("sendInvites") ? "Enabled" : "Disabled"}
                          </span>
                          <div
                            className="transform transition-transform duration-200"
                            style={{
                              transform: form.watch("sendInvites")
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {form.watch("sendInvites") && (
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <Label
                                htmlFor="inviteEmails"
                                className="flex items-center gap-2"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Participant Email Addresses
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Each person will receive an email with a
                                calendar invitation
                              </p>
                            </div>
                          </div>

                          <Textarea
                            id="inviteEmails"
                            placeholder="Enter email addresses separated by commas (e.g., user@example.com, person@company.com)"
                            {...form.register("inviteEmails")}
                            className="min-h-[100px]"
                          />

                          <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary mt-0.5"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <p className="text-xs text-muted-foreground">
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

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Back
                  </Button>

                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Booking"
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
