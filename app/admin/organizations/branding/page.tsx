&quot;use client&quot;;

import { useEffect, useState, Suspense } from &quot;react&quot;;
import { useSearchParams, useRouter } from &quot;next/navigation&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { ArrowLeft, Info, Loader2, PaintBucket, Save } from &quot;lucide-react&quot;;
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
import { toast } from &quot;@/hooks/use-toast&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { apiRequest } from &quot;@/lib/queryClient&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import type { Organization } from &quot;@shared/schema&quot;;

const brandingFormSchema = z.object({
  organization_id: z.string().uuid(),
  logo_url: z.string().nullable().optional(),
  primary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  secondary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  accent_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: &quot;Must be a valid hex color code&quot;,
    }),
  font_family: z.string().optional(),
  custom_css: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
  email_template: z.record(z.any()).optional(),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

// Wrapper component with suspense boundary
export default function OrganizationBrandingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className=&quot;flex items-center justify-center min-h-screen&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
        </div>
      }
    >
      <OrganizationBrandingPage />
    </Suspense>
  );
}

// Main component that uses useSearchParams
function OrganizationBrandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Extract organization ID from URL
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

  // Get organization branding
  const { data: brandingData, isLoading: isBrandingLoading } = useQuery<{
    branding?: {
      logo_url?: string;
      primary_color?: string;
      secondary_color?: string;
      accent_color?: string;
      font_family?: string;
      custom_css?: string;
      favicon_url?: string;
      email_template?: Record<string, any>;
    };
    can_customize?: boolean;
  }>({
    queryKey: [`/api/organizations/branding?organizationId=${organizationId}`],
    enabled: !!organizationId,
  });

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      organization_id: organizationId || "&quot;,
      logo_url: &quot;&quot;,
      primary_color: &quot;#00A8A8&quot;,
      secondary_color: &quot;#675EA9&quot;,
      accent_color: &quot;#2DD4BF&quot;,
      font_family: &quot;Inter, sans-serif&quot;,
      custom_css: &quot;&quot;,
      favicon_url: &quot;&quot;,
      email_template: {},
    },
  });

  // Set form values when branding data is loaded
  useEffect(() => {
    if (brandingData?.branding && organizationId) {
      form.reset({
        organization_id: organizationId,
        logo_url: brandingData.branding.logo_url || &quot;&quot;,
        primary_color: brandingData.branding.primary_color || &quot;#00A8A8&quot;,
        secondary_color: brandingData.branding.secondary_color || &quot;#675EA9&quot;,
        accent_color: brandingData.branding.accent_color || &quot;#2DD4BF&quot;,
        font_family: brandingData.branding.font_family || &quot;Inter, sans-serif&quot;,
        custom_css: brandingData.branding.custom_css || &quot;&quot;,
        favicon_url: brandingData.branding.favicon_url || &quot;&quot;,
        email_template: brandingData.branding.email_template || {},
      });
    }
  }, [brandingData, organizationId, form]);

  const saveBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormValues) => {
      const response = await apiRequest(
        &quot;POST&quot;,
        &quot;/api/organizations/branding&quot;,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: &quot;Branding saved&quot;,
        description: &quot;Organization branding has been updated successfully.&quot;,
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/branding?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error saving branding&quot;,
        description:
          error.message ||
          &quot;There was an error saving the organization branding.&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  const onSubmit = (data: BrandingFormValues) => {
    saveBrandingMutation.mutate(data);
  };

  if (isOrgLoading || isBrandingLoading || !organizationId) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  const organization = orgData;
  const canCustomize = brandingData?.can_customize;

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
            Organization Branding
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            {organization?.name || &quot;Organization&quot;} - Customize branding
          </p>
        </div>
      </div>

      <Separator className=&quot;my-6&quot; />

      {!canCustomize && (
        <Alert className=&quot;mb-6&quot;>
          <Info className=&quot;h-4 w-4&quot; />
          <AlertTitle>Tier Limitation</AlertTitle>
          <AlertDescription>
            Branding customization is only available for Tier 3 organizations or
            with special permissions.
            {organization?.tier !== &quot;tier_3&quot; &&
              &quot; Consider upgrading to Tier 3 to access this feature.&quot;}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Visual Branding</CardTitle>
              <CardDescription>
                Configure the visual appearance of the organization in the
                platform.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <FormField
                control={form.control}
                name=&quot;logo_url&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;https://example.com/logo.png&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                        disabled={!canCustomize}
                      />
                    </FormControl>
                    <FormDescription>
                      URL for the organization logo (recommended size: 200x60px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
                <FormField
                  control={form.control}
                  name=&quot;primary_color&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className=&quot;flex gap-2&quot;>
                        <FormControl>
                          <Input
                            type=&quot;text&quot;
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type=&quot;color&quot;
                          value={field.value || &quot;#00A8A8&quot;}
                          onChange={(e) => field.onChange(e.target.value)}
                          className=&quot;w-12 p-1 h-10&quot;
                          disabled={!canCustomize}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=&quot;secondary_color&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className=&quot;flex gap-2&quot;>
                        <FormControl>
                          <Input
                            type=&quot;text&quot;
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type=&quot;color&quot;
                          value={field.value || &quot;#675EA9&quot;}
                          onChange={(e) => field.onChange(e.target.value)}
                          className=&quot;w-12 p-1 h-10&quot;
                          disabled={!canCustomize}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=&quot;accent_color&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className=&quot;flex gap-2&quot;>
                        <FormControl>
                          <Input
                            type=&quot;text&quot;
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type=&quot;color&quot;
                          value={field.value || &quot;#2DD4BF&quot;}
                          onChange={(e) => field.onChange(e.target.value)}
                          className=&quot;w-12 p-1 h-10&quot;
                          disabled={!canCustomize}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name=&quot;font_family&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;Inter, sans-serif&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                        disabled={!canCustomize}
                      />
                    </FormControl>
                    <FormDescription>
                      Primary font family for the organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name=&quot;favicon_url&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;https://example.com/favicon.ico&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                        disabled={!canCustomize}
                      />
                    </FormControl>
                    <FormDescription>
                      URL for the organization favicon
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Customization</CardTitle>
              <CardDescription>
                Configure advanced branding options for the organization.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <FormField
                control={form.control}
                name=&quot;custom_css&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom CSS</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=&quot;.custom-class { color: #333; }&quot;
                        {...field}
                        value={field.value || &quot;&quot;}
                        className=&quot;font-mono h-32&quot;
                        disabled={!canCustomize}
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom CSS for advanced styling (Tier 3 only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type=&quot;submit&quot;
                disabled={saveBrandingMutation.isPending || !canCustomize}
                className=&quot;ml-auto&quot;
              >
                {saveBrandingMutation.isPending && (
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                )}
                {!saveBrandingMutation.isPending && (
                  <PaintBucket className=&quot;mr-2 h-4 w-4&quot; />
                )}
                Save Branding
              </Button>
            </CardFooter>
          </Card>

          <div className=&quot;p-4 border rounded-lg bg-muted/50&quot;>
            <h3 className=&quot;font-semibold mb-2&quot;>Branding Preview</h3>
            <div
              className=&quot;p-6 border rounded-lg bg-white dark:bg-slate-900&quot;
              style={
                {
                  &quot;--primary-color&quot;: form.watch(&quot;primary_color&quot;) || &quot;#00A8A8&quot;,
                  &quot;--secondary-color&quot;:
                    form.watch(&quot;secondary_color&quot;) || &quot;#675EA9&quot;,
                  &quot;--accent-color&quot;: form.watch(&quot;accent_color&quot;) || &quot;#2DD4BF&quot;,
                } as React.CSSProperties
              }
            >
              <div
                className=&quot;h-12 w-full mb-4 bg-[var(--primary-color)]&quot;
                style={{
                  fontFamily: form.watch(&quot;font_family&quot;) || &quot;Inter, sans-serif&quot;,
                }}
              >
                <div className=&quot;h-full flex items-center px-4 text-white font-medium&quot;>
                  {form.watch(&quot;logo_url&quot;) ? (
                    <img
                      src={form.watch(&quot;logo_url&quot;) || &quot;&quot;}
                      alt=&quot;Organization Logo&quot;
                      className=&quot;h-8 max-w-[160px] object-contain&quot;
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          &quot;data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22%3E%3Crect fill%3D%22%23CCC%22 width%3D%22100%22 height%3D%22100%22%2F%3E%3Cpath fill%3D%22%23FFF%22 d%3D%22M34 46h32v8H34z%22%2F%3E%3C%2Fsvg%3E&quot;;
                      }}
                    />
                  ) : (
                    <span>{organization?.name || &quot;Organization Name&quot;}</span>
                  )}
                </div>
              </div>
              <div className=&quot;flex gap-2 mb-4&quot;>
                <div className=&quot;h-8 px-4 flex items-center justify-center text-white text-sm font-medium rounded-md bg-[var(--primary-color)]&quot;>
                  Primary Button
                </div>
                <div className=&quot;h-8 px-4 flex items-center justify-center text-[var(--primary-color)] text-sm font-medium rounded-md bg-white border border-[var(--primary-color)]&quot;>
                  Secondary Button
                </div>
                <div className=&quot;h-8 px-4 flex items-center justify-center text-white text-sm font-medium rounded-md bg-[var(--accent-color)]&quot;>
                  Accent Button
                </div>
              </div>
              <div className=&quot;h-4 w-1/2 rounded-full bg-[var(--secondary-color)] mb-4&quot;></div>
              <div className=&quot;h-4 w-3/4 rounded-full bg-[var(--secondary-color)] opacity-70 mb-4&quot;></div>
              <div className=&quot;h-4 w-1/3 rounded-full bg-[var(--secondary-color)] opacity-40 mb-4"></div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
