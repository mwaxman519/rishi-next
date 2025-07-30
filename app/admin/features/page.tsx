"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "../../contexts/OrganizationProvider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {
  LucideIcon,
  Server,
  BarChart2,
  Layers,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { OrganizationTier } from "../../../shared/tiers";

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
  "bar-chart-2": BarChart2,
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
        console.error("Error fetching features:", error);
        toast({
          variant: "destructive",
          title: "Error loading features",
          description:
            "There was a problem loading the feature list. Please try again.",
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
      const response = await fetch("/api/features/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        title: `Feature ${enabled ? "enabled" : "disabled"}`,
        description: `${featureId} has been ${enabled ? "enabled" : "disabled"} for ${currentOrganization.name}`,
      });
    } catch (error) {
      console.error("Error updating feature:", error);
      toast({
        variant: "destructive",
        title: "Error updating feature",
        description:
          "There was a problem updating the feature. Please try again.",
      });
    } finally {
      setSaving((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  // Function to initialize all features
  const initializeFeatures = async () => {
    try {
      setShowInitDialog(false);

      const response = await fetch("/api/features/initialize", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize features: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Features initialized",
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
      console.error("Error initializing features:", error);
      toast({
        variant: "destructive",
        title: "Error initializing features",
        description:
          "There was a problem initializing the feature system. Please try again.",
      });
    }
  };

  // Function to get feature tier availability
  const getFeatureTierLabel = (availableTiers: string[]) => {
    if (availableTiers.includes(OrganizationTier.TIER1)) {
      return "All tiers";
    } else if (availableTiers.includes(OrganizationTier.TIER2)) {
      return "Tier 2 & 3";
    } else if (availableTiers.includes(OrganizationTier.TIER3)) {
      return "Tier 3 only";
    }
    return "Custom";
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin mr-2">
          <RefreshCw size={24} />
        </div>
        <p>Loading organization data...</p>
      </div>
    );
  }

  if (loadingFeatures) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin mr-2">
          <RefreshCw size={24} />
        </div>
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feature Management
          </h1>
          <p className="text-gray-500">
            Manage features for {currentOrganization.name}
            {currentOrganization.tier &&
              ` (${currentOrganization.tier.replace("_", " ")})`}
          </p>
        </div>

        <AlertDialog open={showInitDialog} onOpenChange={setShowInitDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Initialize Feature System</Button>
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
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">No features available</h3>
          <p className=&quot;text-gray-500 mt-2>
            Either no features are registered or the feature list couldn&apos;t be
            loaded.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowInitDialog(true)}
          >
            Initialize Features
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const FeatureIcon = getFeatureIcon(feature.icon);
            return (
              <Card key={feature.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-primary/10 rounded-lg text-primary">
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
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                      {getFeatureTierLabel(feature.availableTiers)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600">
                    {feature.description}
                  </CardDescription>

                  {feature.dependencies && feature.dependencies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">
                        Dependencies:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {feature.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="text-xs bg-gray-100 rounded-full px-2 py-0.5"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className=&quot;text-xs text-gray-400>
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
