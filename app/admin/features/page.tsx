&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useOrganization } from &quot;../../contexts/OrganizationProvider&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from &quot;@/components/ui/alert-dialog&quot;;
import {
  LucideIcon,
  Server,
  BarChart2,
  Layers,
  AlertTriangle,
  RefreshCw,
} from &quot;lucide-react&quot;;
import { OrganizationTier } from &quot;../../../shared/tiers&quot;;

// Feature interface to match the feature modules on the server
interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  availableTiers: string[];
  dependencies?: string[];
  userConfigurable: boolean;
  enabled: boolean;
}

// Map feature icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  server: Server,
  &quot;bar-chart-2&quot;: BarChart2,
  layers: Layers,
  // Add more icons as needed
};

export default function FeaturesAdminPage() {
  const { currentOrganization, isLoading } = useOrganization();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [showInitDialog, setShowInitDialog] = useState(false);
  const { toast } = useToast();

  // Fetch the list of features for the current organization
  useEffect(() => {
    if (isLoading || !currentOrganization) return;

    const fetchFeatures = async () => {
      try {
        setLoadingFeatures(true);
        const response = await fetch(
          `/api/features/list?organizationId=${currentOrganization.id}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch features: ${response.status}`);
        }

        const data = await response.json();
        setFeatures(data.features || []);
      } catch (error) {
        console.error(&quot;Error fetching features:&quot;, error);
        toast({
          variant: &quot;destructive&quot;,
          title: &quot;Error loading features&quot;,
          description:
            &quot;There was a problem loading the feature list. Please try again.&quot;,
        });
      } finally {
        setLoadingFeatures(false);
      }
    };

    fetchFeatures();
  }, [currentOrganization, isLoading, toast]);

  // Function to toggle a feature
  const toggleFeature = async (featureId: string, enabled: boolean) => {
    if (!currentOrganization) return;

    // Set saving state for this feature
    setSaving((prev) => ({ ...prev, [featureId]: true }));

    try {
      const response = await fetch(&quot;/api/features/manage&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          organizationId: currentOrganization.id,
          featureId,
          enabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update feature: ${response.status}`);
      }

      // Update the local state
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, enabled } : f)),
      );

      toast({
        title: `Feature ${enabled ? &quot;enabled&quot; : &quot;disabled&quot;}`,
        description: `${featureId} has been ${enabled ? &quot;enabled&quot; : &quot;disabled&quot;} for ${currentOrganization.name}`,
      });
    } catch (error) {
      console.error(&quot;Error updating feature:&quot;, error);
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Error updating feature&quot;,
        description:
          &quot;There was a problem updating the feature. Please try again.&quot;,
      });
    } finally {
      setSaving((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  // Function to initialize all features
  const initializeFeatures = async () => {
    try {
      setShowInitDialog(false);

      const response = await fetch(&quot;/api/features/initialize&quot;, {
        method: &quot;POST&quot;,
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize features: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: &quot;Features initialized&quot;,
        description: `Successfully initialized features for ${data.initializedOrganizationCount} organizations.`,
      });

      // Refresh the feature list
      if (currentOrganization) {
        const featuresResponse = await fetch(
          `/api/features/list?organizationId=${currentOrganization.id}`,
        );
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData.features || []);
        }
      }
    } catch (error) {
      console.error(&quot;Error initializing features:&quot;, error);
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Error initializing features&quot;,
        description:
          &quot;There was a problem initializing the feature system. Please try again.&quot;,
      });
    }
  };

  // Function to get feature tier availability
  const getFeatureTierLabel = (availableTiers: string[]) => {
    if (availableTiers.includes(OrganizationTier.TIER1)) {
      return &quot;All tiers&quot;;
    } else if (availableTiers.includes(OrganizationTier.TIER2)) {
      return &quot;Tier 2 & 3&quot;;
    } else if (availableTiers.includes(OrganizationTier.TIER3)) {
      return &quot;Tier 3 only&quot;;
    }
    return &quot;Custom&quot;;
  };

  // Function to get icon for a feature
  const getFeatureIcon = (iconName?: string) => {
    if (!iconName || !iconMap[iconName]) {
      return AlertTriangle;
    }
    return iconMap[iconName];
  };

  if (isLoading || !currentOrganization) {
    return (
      <div className=&quot;flex items-center justify-center min-h-[50vh]&quot;>
        <div className=&quot;animate-spin mr-2&quot;>
          <RefreshCw size={24} />
        </div>
        <p>Loading organization data...</p>
      </div>
    );
  }

  if (loadingFeatures) {
    return (
      <div className=&quot;flex items-center justify-center min-h-[50vh]&quot;>
        <div className=&quot;animate-spin mr-2&quot;>
          <RefreshCw size={24} />
        </div>
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex justify-between items-center mb-6&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Feature Management
          </h1>
          <p className=&quot;text-gray-500&quot;>
            Manage features for {currentOrganization.name}
            {currentOrganization.tier &&
              ` (${currentOrganization.tier.replace(&quot;_&quot;, &quot; &quot;)})`}
          </p>
        </div>

        <AlertDialog open={showInitDialog} onOpenChange={setShowInitDialog}>
          <AlertDialogTrigger asChild>
            <Button variant=&quot;outline&quot;>Initialize Feature System</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Initialize All Features</AlertDialogTitle>
              <AlertDialogDescription>
                This will initialize the feature system for all organizations.
                Only use this during system setup or after major changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={initializeFeatures}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {features.length === 0 ? (
        <div className=&quot;text-center py-12 bg-gray-50 rounded-lg&quot;>
          <h3 className=&quot;text-lg font-medium&quot;>No features available</h3>
          <p className=&quot;text-gray-500 mt-2&quot;>
            Either no features are registered or the feature list couldn&apos;t be
            loaded.
          </p>
          <Button
            variant=&quot;outline&quot;
            className=&quot;mt-4&quot;
            onClick={() => setShowInitDialog(true)}
          >
            Initialize Features
          </Button>
        </div>
      ) : (
        <div className=&quot;grid gap-6 md:grid-cols-2 lg:grid-cols-3&quot;>
          {features.map((feature) => {
            const FeatureIcon = getFeatureIcon(feature.icon);
            return (
              <Card key={feature.id}>
                <CardHeader>
                  <div className=&quot;flex items-start justify-between&quot;>
                    <div className=&quot;flex items-center&quot;>
                      <div className=&quot;mr-3 p-2 bg-primary/10 rounded-lg text-primary&quot;>
                        <FeatureIcon size={20} />
                      </div>
                      <CardTitle>{feature.name}</CardTitle>
                    </div>
                    <div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(checked) =>
                          toggleFeature(feature.id, checked)
                        }
                        disabled={
                          !feature.userConfigurable || saving[feature.id]
                        }
                      />
                    </div>
                  </div>
                  <div className=&quot;flex items-center mt-1&quot;>
                    <span className=&quot;text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5&quot;>
                      {getFeatureTierLabel(feature.availableTiers)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className=&quot;text-sm text-gray-600&quot;>
                    {feature.description}
                  </CardDescription>

                  {feature.dependencies && feature.dependencies.length > 0 && (
                    <div className=&quot;mt-4&quot;>
                      <p className=&quot;text-xs text-gray-500 mb-1&quot;>
                        Dependencies:
                      </p>
                      <div className=&quot;flex flex-wrap gap-1&quot;>
                        {feature.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className=&quot;text-xs bg-gray-100 rounded-full px-2 py-0.5&quot;
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className=&quot;text-xs text-gray-400&quot;>
                    Feature ID: {feature.id}
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
