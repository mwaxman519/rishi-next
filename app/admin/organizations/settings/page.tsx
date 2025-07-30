&quot;use client&quot;;

import { useEffect, useState, Suspense } from &quot;react&quot;;
import { useSearchParams, useRouter } from &quot;next/navigation&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { ArrowLeft, Loader2, Save, User } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { apiRequest } from &quot;@/lib/queryClient&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import type { Organization } from &quot;@shared/schema&quot;;

// Define the schema for organization settings
const settingsFormSchema = z.object({
  organization_id: z.string().uuid(),
  notification_email: z
    .string()
    .email({ message: &quot;Please enter a valid email address&quot; })
    .optional()
    .or(z.literal("&quot;)),
  timezone: z.string().default(&quot;UTC&quot;),
  language: z.string().default(&quot;en&quot;),
  date_format: z.string().default(&quot;YYYY-MM-DD&quot;),
  time_format: z.string().default(&quot;HH:mm&quot;),
  billing_contact_name: z.string().optional().or(z.literal(&quot;&quot;)),
  billing_contact_email: z
    .string()
    .email({ message: &quot;Please enter a valid email address&quot; })
    .optional()
    .or(z.literal(&quot;&quot;)),
  billing_address: z.string().optional().or(z.literal(&quot;&quot;)),
  additional_settings: z.record(z.any()).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Wrapper component with suspense boundary
export default function OrganizationSettingsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className=&quot;flex items-center justify-center min-h-screen&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
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
    const id = searchParams.get(&quot;organizationId&quot;);
    if (!id) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;Organization ID is required&quot;,
        variant: &quot;destructive&quot;,
      });
      router.push(&quot;/admin/organizations&quot;);
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
      organization_id: organizationId || &quot;&quot;,
      notification_email: &quot;&quot;,
      timezone: &quot;UTC&quot;,
      language: &quot;en&quot;,
      date_format: &quot;YYYY-MM-DD&quot;,
      time_format: &quot;HH:mm&quot;,
      billing_contact_name: &quot;&quot;,
      billing_contact_email: &quot;&quot;,
      billing_address: &quot;&quot;,
      additional_settings: {},
    },
  });

  // Set form values when settings data is loaded
  useEffect(() => {
    if (settingsData?.settings && organizationId) {
      form.reset({
        organization_id: organizationId,
        notification_email: settingsData.settings.notification_email || &quot;&quot;,
        timezone: settingsData.settings.timezone || &quot;UTC&quot;,
        language: settingsData.settings.language || &quot;en&quot;,
        date_format: settingsData.settings.date_format || &quot;YYYY-MM-DD&quot;,
        time_format: settingsData.settings.time_format || &quot;HH:mm&quot;,
        billing_contact_name: settingsData.settings.billing_contact_name || &quot;&quot;,
        billing_contact_email:
          settingsData.settings.billing_contact_email || &quot;&quot;,
        billing_address: settingsData.settings.billing_address || &quot;&quot;,
        additional_settings: settingsData.settings.additional_settings || {},
      });
    }
  }, [settingsData, organizationId, form]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest(
        &quot;POST&quot;,
        &quot;/api/organizations/settings&quot;,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: &quot;Settings saved&quot;,
        description: &quot;Organization settings have been updated successfully.&quot;,
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/settings?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error saving settings&quot;,
        description:
          error.message ||
          &quot;There was an error saving the organization settings.&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    saveSettingsMutation.mutate(data);
  };

  if (isOrgLoading || isSettingsLoading || !organizationId) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  const organization = orgData;

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex items-center mb-6&quot;>
        <Button
          variant=&quot;ghost&quot;
          onClick={() => router.push(&quot;/admin/organizations&quot;)}
          className=&quot;mr-4&quot;
        >
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back to Organizations
        </Button>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Organization Settings
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            {organization?.name || &quot;Organization&quot;} - Configure settings
          </p>
        </div>
      </div>

      <Separator className=&quot;my-6&quot; />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8&quot;>
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the organization's general settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <FormField
                control={form.control}
                name=&quot;notification_email&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;notifications@example.com&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                      />
                    </FormControl>
                    <FormDescription>
                      Email address for system notifications and alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <FormField
                  control={form.control}
                  name=&quot;timezone&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a timezone&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=&quot;UTC&quot;>UTC</SelectItem>
                          <SelectItem value=&quot;America/Los_Angeles&quot;>
                            Pacific Time (US)
                          </SelectItem>
                          <SelectItem value=&quot;America/New_York&quot;>
                            Eastern Time (US)
                          </SelectItem>
                          <SelectItem value=&quot;Europe/London&quot;>London</SelectItem>
                          <SelectItem value=&quot;Asia/Tokyo&quot;>Tokyo</SelectItem>
                          <SelectItem value=&quot;Australia/Sydney&quot;>
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
                  name=&quot;language&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a language&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=&quot;en&quot;>English</SelectItem>
                          <SelectItem value=&quot;es&quot;>Spanish</SelectItem>
                          <SelectItem value=&quot;fr&quot;>French</SelectItem>
                          <SelectItem value=&quot;de&quot;>German</SelectItem>
                          <SelectItem value=&quot;ja&quot;>Japanese</SelectItem>
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

              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <FormField
                  control={form.control}
                  name=&quot;date_format&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a date format&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=&quot;YYYY-MM-DD&quot;>YYYY-MM-DD</SelectItem>
                          <SelectItem value=&quot;MM/DD/YYYY&quot;>MM/DD/YYYY</SelectItem>
                          <SelectItem value=&quot;DD/MM/YYYY&quot;>DD/MM/YYYY</SelectItem>
                          <SelectItem value=&quot;MMMM D, YYYY&quot;>
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
                  name=&quot;time_format&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a time format&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=&quot;HH:mm&quot;>24-hour (HH:mm)</SelectItem>
                          <SelectItem value=&quot;hh:mm A&quot;>
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
            <CardContent className=&quot;space-y-6&quot;>
              <FormField
                control={form.control}
                name=&quot;billing_contact_name&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Contact Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;John Doe&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name=&quot;billing_contact_email&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;billing@example.com&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name=&quot;billing_address&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=&quot;123 Main St, Suite 100, City, State, 12345&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type=&quot;submit&quot;
                disabled={saveSettingsMutation.isPending}
                className=&quot;ml-auto&quot;
              >
                {saveSettingsMutation.isPending && (
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                )}
                {!saveSettingsMutation.isPending && (
                  <Save className=&quot;mr-2 h-4 w-4" />
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
