"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Calendar, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureSetting {
  id: string;
  name: string;
  description: string;
  category: string;
  value: boolean;
}

export default function RBACSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<FeatureSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get current organization ID - fallback to default org if not available
  const organizationId =
    user?.organizationId;

  useEffect(() => {
    loadSettings();
  }, [organizationId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/feature-settings`,
      );
      if (response.ok) {
        const data = await response.json();

        // Convert to feature setting format
        const featureSettings: FeatureSetting[] = [
          {
            id: "brand_agents_view_org_events",
            name: "Brand Agents Can View Organizational Events",
            description:
              "Allow brand agents to view all organizational events, not just their assigned ones",
            category: "Events",
            value: data.brand_agents_view_org_events || false,
          },
          {
            id: "brand_agents_manage_availability",
            name: "Brand Agents Can Manage Availability",
            description:
              "Allow brand agents to update their own availability and schedule preferences",
            category: "Events",
            value: data.brand_agents_manage_availability !== false,
          },
          {
            id: "field_coordinators_approve_assignments",
            name: "Field Coordinators Can Approve Assignments",
            description:
              "Allow field coordinators to approve or reject event assignments",
            category: "Events",
            value: data.field_coordinators_approve_assignments !== false,
          },
          {
            id: "client_users_create_events",
            name: "Client Users Can Create Events",
            description:
              "Allow client users to create new events for their organization",
            category: "Events",
            value: data.client_users_create_events !== false,
          },
          {
            id: "enable_event_notifications",
            name: "Enable Event Notifications",
            description:
              "Send notifications for event updates, assignments, and changes",
            category: "System",
            value: data.enable_event_notifications !== false,
          },
        ];

        setSettings(featureSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load RBAC settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (settingId: string, value: boolean) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId ? { ...setting, value } : setting,
      ),
    );
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsObject: Record<string, boolean> = {};
      settings.forEach((setting) => {
        settingsObject[setting.id] = setting.value;
      });

      const response = await fetch(
        `/api/organizations/${organizationId}/feature-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settingsObject),
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "RBAC settings updated successfully",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save RBAC settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Events":
        return <Calendar className="h-4 w-4" />;
      case "Users":
        return <Users className="h-4 w-4" />;
      case "System":
        return <Settings className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group settings by category
  const settingsByCategory = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    },
    {} as Record<string, FeatureSetting[]>,
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">RBAC Settings</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Configure role-based access control settings for your organization.
        These settings control what actions different user roles can perform.
      </p>

      <div className="space-y-6">
        {Object.entries(settingsByCategory).map(
          ([category, categorySettings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span>{category} Permissions</span>
                </CardTitle>
                <CardDescription>
                  Control access for {category.toLowerCase()}-related features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings.map((setting, index) => (
                  <div key={setting.id}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label
                          htmlFor={setting.id}
                          className="text-sm font-medium"
                        >
                          {setting.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <Switch
                        id={setting.id}
                        checked={setting.value}
                        onCheckedChange={(checked) =>
                          updateSetting(setting.id, checked)
                        }
                      />
                    </div>
                    {index < categorySettings.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card className="mt-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800 dark:text-orange-200">
                Important Note
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Changes to RBAC settings take effect immediately. Users may need
                to refresh their browser to see updated permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
