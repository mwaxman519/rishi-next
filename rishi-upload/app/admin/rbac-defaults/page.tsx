"use client";

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
import { Shield, Globe, Building, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemRBACDefault {
  id: string;
  name: string;
  description: string;
  category: string;
  value: boolean;
}

interface OrganizationOverride {
  organizationId: string;
  organizationName: string;
  overrides: Record<string, boolean>;
}

export default function SystemRBACDefaultsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [systemDefaults, setSystemDefaults] = useState<SystemRBACDefault[]>([]);
  const [organizationOverrides, setOrganizationOverrides] = useState<
    OrganizationOverride[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSystemDefaults();
    loadOrganizationOverrides();
  }, []);

  const loadSystemDefaults = async () => {
    try {
      const response = await fetch("/api/admin/rbac-defaults");
      if (response.ok) {
        const data = await response.json();

        const defaults: SystemRBACDefault[] = [
          {
            id: "brand_agents_view_org_events",
            name: "Brand Agents Can View Organizational Events",
            description:
              "Default setting for whether brand agents can view all organizational events or only their assigned ones",
            category: "Events",
            value: data.defaults.brand_agents_view_org_events || false,
          },
          {
            id: "brand_agents_manage_availability",
            name: "Brand Agents Can Manage Availability",
            description:
              "Default setting for brand agent availability management permissions",
            category: "Events",
            value: data.defaults.brand_agents_manage_availability !== false,
          },
          {
            id: "field_coordinators_approve_assignments",
            name: "Field Coordinators Can Approve Assignments",
            description:
              "Default setting for field coordinator approval permissions",
            category: "Events",
            value:
              data.defaults.field_coordinators_approve_assignments !== false,
          },
          {
            id: "client_users_create_events",
            name: "Client Users Can Create Events",
            description:
              "Default setting for client user event creation permissions",
            category: "Events",
            value: data.defaults.client_users_create_events !== false,
          },
          {
            id: "enable_event_notifications",
            name: "Enable Event Notifications",
            description: "Default setting for event notification system",
            category: "System",
            value: data.defaults.enable_event_notifications !== false,
          },
          {
            id: "auto_assign_brand_agents",
            name: "Auto-Assign Brand Agents",
            description:
              "Automatically assign available brand agents to new events",
            category: "Events",
            value: data.defaults.auto_assign_brand_agents || false,
          },
          {
            id: "require_approval_for_schedule_changes",
            name: "Require Approval for Schedule Changes",
            description: "Require manager approval for schedule modifications",
            category: "Events",
            value: data.defaults.require_approval_for_schedule_changes || false,
          },
          {
            id: "enable_overtime_notifications",
            name: "Enable Overtime Notifications",
            description:
              "Send notifications when users approach overtime hours",
            category: "System",
            value: data.defaults.enable_overtime_notifications !== false,
          },
        ];

        setSystemDefaults(defaults);
      }
    } catch (error) {
      console.error("Error loading system defaults:", error);
      toast({
        title: "Error",
        description: "Failed to load system RBAC defaults",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationOverrides = async () => {
    // This would load organization-specific overrides from the database
    // For now, showing empty state as no overrides exist yet
    setOrganizationOverrides([]);
  };

  const updateSystemDefault = (settingId: string, value: boolean) => {
    setSystemDefaults((prev) =>
      prev.map((setting) =>
        setting.id === settingId ? { ...setting, value } : setting,
      ),
    );
  };

  const saveSystemDefaults = async () => {
    setSaving(true);
    try {
      const defaultsObject: Record<string, boolean> = {};
      systemDefaults.forEach((setting) => {
        defaultsObject[setting.id] = setting.value;
      });

      const response = await fetch("/api/admin/rbac-defaults", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ defaults: defaultsObject }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "System RBAC defaults updated successfully",
        });
      } else {
        throw new Error("Failed to save defaults");
      }
    } catch (error) {
      console.error("Error saving system defaults:", error);
      toast({
        title: "Error",
        description: "Failed to save system RBAC defaults",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Events":
        return <Shield className="h-4 w-4" />;
      case "System":
        return <Globe className="h-4 w-4" />;
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group settings by category
  const settingsByCategory = systemDefaults.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    },
    {} as Record<string, SystemRBACDefault[]>,
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center space-x-2 mb-6">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">System RBAC Defaults</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Configure system-wide RBAC defaults that apply to all organizations.
        Organizations can override these settings individually.
      </p>

      <Tabs defaultValue="defaults" className="space-y-6">
        <TabsList>
          <TabsTrigger value="defaults">System Defaults</TabsTrigger>
          <TabsTrigger value="overrides">Organization Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-6">
          {Object.entries(settingsByCategory).map(
            ([category, categorySettings]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span>{category} Defaults</span>
                  </CardTitle>
                  <CardDescription>
                    System-wide defaults for {category.toLowerCase()}-related
                    permissions
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
                            updateSystemDefault(setting.id, checked)
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

          <div className="flex justify-end">
            <Button onClick={saveSystemDefaults} disabled={saving}>
              {saving ? "Saving..." : "Save System Defaults"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organization Overrides</span>
              </CardTitle>
              <CardDescription>
                Organizations that have overridden the system defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizationOverrides.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No organizations have overridden the system defaults
                </p>
              ) : (
                <div className="space-y-4">
                  {organizationOverrides.map((org) => (
                    <div
                      key={org.organizationId}
                      className="border rounded-lg p-4"
                    >
                      <h3 className="font-medium mb-2">
                        {org.organizationName}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        <strong>Overrides:</strong>
                        <ul className="mt-1 ml-4 list-disc">
                          {Object.entries(org.overrides).map(([key, value]) => (
                            <li key={key}>
                              {systemDefaults.find((s) => s.id === key)?.name}:{" "}
                              {value ? "Enabled" : "Disabled"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">
                System Defaults Impact
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                These defaults apply to all new organizations. Existing
                organizations retain their current settings unless manually
                updated. Organizations can override these defaults through their
                individual RBAC settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
