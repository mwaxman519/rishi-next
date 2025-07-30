"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Loader2, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Organization } from "@shared/schema";

// Define the schema for organization settings
const settingsFormSchema = z.object({
  organization_id: z.string().uuid(),
  notification_email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  date_format: z.string().default("YYYY-MM-DD"),
  time_format: z.string().default("HH:mm"),
  billing_contact_name: z.string().optional().or(z.literal("")),
  billing_contact_email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  billing_address: z.string().optional().or(z.literal("")),
  additional_settings: z.record(z.any()).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Wrapper component with suspense boundary
export default function OrganizationSettingsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrganizationSettingsPage />
    </Suspense>
  );
}

// Main component that uses useSearchParams
function OrganizationSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("organizationId");
    if (!id) {
      toast({
        title: "Error",
        description: "Organization ID is required",
        variant: "destructive",
      });
      router.push("/admin/organizations");
      return;
    }
    setOrganizationId(id);
  }, [searchParams, router]);

  // Get organization details
  const { data: orgData, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: [`/api/organizations/${organizationId}`],
    enabled: !!organizationId,
  });

  // Get organization settings
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery<{
    settings?: {
      notification_email?: string;
      timezone?: string;
      language?: string;
      date_format?: string;
      time_format?: string;
      billing_contact_name?: string;
      billing_contact_email?: string;
      billing_address?: string;
      additional_settings?: Record<string, any>;
    };
  }>({
    queryKey: [`/api/organizations/settings?organizationId=${organizationId}`],
    enabled: !!organizationId,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      organization_id: organizationId || "",
      notification_email: "",
      timezone: "UTC",
      language: "en",
      date_format: "YYYY-MM-DD",
      time_format: "HH:mm",
      billing_contact_name: "",
      billing_contact_email: "",
      billing_address: "",
      additional_settings: {},
    },
  });

  // Set form values when settings data is loaded
  useEffect(() => {
    if (settingsData?.settings && organizationId) {
      form.reset({
        organization_id: organizationId,
        notification_email: settingsData.settings.notification_email || "",
        timezone: settingsData.settings.timezone || "UTC",
        language: settingsData.settings.language || "en",
        date_format: settingsData.settings.date_format || "YYYY-MM-DD",
        time_format: settingsData.settings.time_format || "HH:mm",
        billing_contact_name: settingsData.settings.billing_contact_name || "",
        billing_contact_email:
          settingsData.settings.billing_contact_email || "",
        billing_address: settingsData.settings.billing_address || "",
        additional_settings: settingsData.settings.additional_settings || {},
      });
    }
  }, [settingsData, organizationId, form]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/organizations/settings",
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/settings?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description:
          error.message ||
          "There was an error saving the organization settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    saveSettingsMutation.mutate(data);
  };

  if (isOrgLoading || isSettingsLoading || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organization = orgData;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/organizations")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            {organization?.name || "Organization"} - Configure settings
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8>
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the organization&apos;s general settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notification_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="notifications@example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Email address for system notifications and alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time (US)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            Eastern Time (US)
                          </SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          <SelectItem value="Australia/Sydney">
                            Sydney
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default timezone for dates and times
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default language for the organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a date format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MMMM D, YYYY">
                            MMMM D, YYYY
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Format for displaying dates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HH:mm">24-hour (HH:mm)</SelectItem>
                          <SelectItem value="hh:mm A">
                            12-hour (hh:mm AM/PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Format for displaying times
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Configure billing contact information for invoices and financial
                communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="billing_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Contact Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="billing@example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Main St, Suite 100, City, State, 12345"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={saveSettingsMutation.isPending}
                className="ml-auto"
              >
                {saveSettingsMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!saveSettingsMutation.isPending && (
                  <Save className=&quot;mr-2 h-4 w-4 />
                )}
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
