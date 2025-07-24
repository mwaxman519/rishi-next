"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Info, Loader2, PaintBucket, Save } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Organization } from "@shared/schema";

const brandingFormSchema = z.object({
  organization_id: z.string().uuid(),
  logo_url: z.string().nullable().optional(),
  primary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
    }),
  secondary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
    }),
  accent_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code",
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      organization_id: organizationId || "",
      logo_url: "",
      primary_color: "#00A8A8",
      secondary_color: "#675EA9",
      accent_color: "#2DD4BF",
      font_family: "Inter, sans-serif",
      custom_css: "",
      favicon_url: "",
      email_template: {},
    },
  });

  // Set form values when branding data is loaded
  useEffect(() => {
    if (brandingData?.branding && organizationId) {
      form.reset({
        organization_id: organizationId,
        logo_url: brandingData.branding.logo_url || "",
        primary_color: brandingData.branding.primary_color || "#00A8A8",
        secondary_color: brandingData.branding.secondary_color || "#675EA9",
        accent_color: brandingData.branding.accent_color || "#2DD4BF",
        font_family: brandingData.branding.font_family || "Inter, sans-serif",
        custom_css: brandingData.branding.custom_css || "",
        favicon_url: brandingData.branding.favicon_url || "",
        email_template: brandingData.branding.email_template || {},
      });
    }
  }, [brandingData, organizationId, form]);

  const saveBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/organizations/branding",
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Branding saved",
        description: "Organization branding has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/branding?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving branding",
        description:
          error.message ||
          "There was an error saving the organization branding.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrandingFormValues) => {
    saveBrandingMutation.mutate(data);
  };

  if (isOrgLoading || isBrandingLoading || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organization = orgData;
  const canCustomize = brandingData?.can_customize;

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
            Organization Branding
          </h1>
          <p className="text-muted-foreground">
            {organization?.name || "Organization"} - Customize branding
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {!canCustomize && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Tier Limitation</AlertTitle>
          <AlertDescription>
            Branding customization is only available for Tier 3 organizations or
            with special permissions.
            {organization?.tier !== "tier_3" &&
              " Consider upgrading to Tier 3 to access this feature."}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Visual Branding</CardTitle>
              <CardDescription>
                Configure the visual appearance of the organization in the
                platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                        value={field.value || ""}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type="color"
                          value={field.value || "#00A8A8"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 p-1 h-10"
                          disabled={!canCustomize}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type="color"
                          value={field.value || "#675EA9"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 p-1 h-10"
                          disabled={!canCustomize}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accent_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            disabled={!canCustomize}
                          />
                        </FormControl>
                        <Input
                          type="color"
                          value={field.value || "#2DD4BF"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 p-1 h-10"
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
                name="font_family"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Inter, sans-serif"
                        {...field}
                        value={field.value || ""}
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
                name="favicon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/favicon.ico"
                        {...field}
                        value={field.value || ""}
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
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="custom_css"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom CSS</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=".custom-class { color: #333; }"
                        {...field}
                        value={field.value || ""}
                        className="font-mono h-32"
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
                type="submit"
                disabled={saveBrandingMutation.isPending || !canCustomize}
                className="ml-auto"
              >
                {saveBrandingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!saveBrandingMutation.isPending && (
                  <PaintBucket className="mr-2 h-4 w-4" />
                )}
                Save Branding
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Branding Preview</h3>
            <div
              className="p-6 border rounded-lg bg-white dark:bg-slate-900"
              style={
                {
                  "--primary-color": form.watch("primary_color") || "#00A8A8",
                  "--secondary-color":
                    form.watch("secondary_color") || "#675EA9",
                  "--accent-color": form.watch("accent_color") || "#2DD4BF",
                } as React.CSSProperties
              }
            >
              <div
                className="h-12 w-full mb-4 bg-[var(--primary-color)]"
                style={{
                  fontFamily: form.watch("font_family") || "Inter, sans-serif",
                }}
              >
                <div className="h-full flex items-center px-4 text-white font-medium">
                  {form.watch("logo_url") ? (
                    <img
                      src={form.watch("logo_url") || ""}
                      alt="Organization Logo"
                      className="h-8 max-w-[160px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22%3E%3Crect fill%3D%22%23CCC%22 width%3D%22100%22 height%3D%22100%22%2F%3E%3Cpath fill%3D%22%23FFF%22 d%3D%22M34 46h32v8H34z%22%2F%3E%3C%2Fsvg%3E";
                      }}
                    />
                  ) : (
                    <span>{organization?.name || "Organization Name"}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-8 px-4 flex items-center justify-center text-white text-sm font-medium rounded-md bg-[var(--primary-color)]">
                  Primary Button
                </div>
                <div className="h-8 px-4 flex items-center justify-center text-[var(--primary-color)] text-sm font-medium rounded-md bg-white border border-[var(--primary-color)]">
                  Secondary Button
                </div>
                <div className="h-8 px-4 flex items-center justify-center text-white text-sm font-medium rounded-md bg-[var(--accent-color)]">
                  Accent Button
                </div>
              </div>
              <div className="h-4 w-1/2 rounded-full bg-[var(--secondary-color)] mb-4"></div>
              <div className="h-4 w-3/4 rounded-full bg-[var(--secondary-color)] opacity-70 mb-4"></div>
              <div className="h-4 w-1/3 rounded-full bg-[var(--secondary-color)] opacity-40 mb-4"></div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
