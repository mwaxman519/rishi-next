&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Shield, Globe, Building, AlertTriangle } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;

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
      const response = await fetch(&quot;/api/admin/rbac-defaults&quot;);
      if (response.ok) {
        const data = await response.json();

        const defaults: SystemRBACDefault[] = [
          {
            id: &quot;brand_agents_view_org_events&quot;,
            name: &quot;Brand Agents Can View Organizational Events&quot;,
            description:
              &quot;Default setting for whether brand agents can view all organizational events or only their assigned ones&quot;,
            category: &quot;Events&quot;,
            value: data.defaults.brand_agents_view_org_events || false,
          },
          {
            id: &quot;brand_agents_manage_availability&quot;,
            name: &quot;Brand Agents Can Manage Availability&quot;,
            description:
              &quot;Default setting for brand agent availability management permissions&quot;,
            category: &quot;Events&quot;,
            value: data.defaults.brand_agents_manage_availability !== false,
          },
          {
            id: &quot;field_coordinators_approve_assignments&quot;,
            name: &quot;Field Coordinators Can Approve Assignments&quot;,
            description:
              &quot;Default setting for field coordinator approval permissions&quot;,
            category: &quot;Events&quot;,
            value:
              data.defaults.field_coordinators_approve_assignments !== false,
          },
          {
            id: &quot;client_users_create_events&quot;,
            name: &quot;Client Users Can Create Events&quot;,
            description:
              &quot;Default setting for client user event creation permissions&quot;,
            category: &quot;Events&quot;,
            value: data.defaults.client_users_create_events !== false,
          },
          {
            id: &quot;enable_event_notifications&quot;,
            name: &quot;Enable Event Notifications&quot;,
            description: &quot;Default setting for event notification system&quot;,
            category: &quot;System&quot;,
            value: data.defaults.enable_event_notifications !== false,
          },
          {
            id: &quot;auto_assign_brand_agents&quot;,
            name: &quot;Auto-Assign Brand Agents&quot;,
            description:
              &quot;Automatically assign available brand agents to new events&quot;,
            category: &quot;Events&quot;,
            value: data.defaults.auto_assign_brand_agents || false,
          },
          {
            id: &quot;require_approval_for_schedule_changes&quot;,
            name: &quot;Require Approval for Schedule Changes&quot;,
            description: &quot;Require manager approval for schedule modifications&quot;,
            category: &quot;Events&quot;,
            value: data.defaults.require_approval_for_schedule_changes || false,
          },
          {
            id: &quot;enable_overtime_notifications&quot;,
            name: &quot;Enable Overtime Notifications&quot;,
            description:
              &quot;Send notifications when users approach overtime hours&quot;,
            category: &quot;System&quot;,
            value: data.defaults.enable_overtime_notifications !== false,
          },
        ];

        setSystemDefaults(defaults);
      }
    } catch (error) {
      console.error(&quot;Error loading system defaults:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to load system RBAC defaults&quot;,
        variant: &quot;destructive&quot;,
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

      const response = await fetch(&quot;/api/admin/rbac-defaults&quot;, {
        method: &quot;PUT&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ defaults: defaultsObject }),
      });

      if (response.ok) {
        toast({
          title: &quot;Success&quot;,
          description: &quot;System RBAC defaults updated successfully&quot;,
        });
      } else {
        throw new Error(&quot;Failed to save defaults&quot;);
      }
    } catch (error) {
      console.error(&quot;Error saving system defaults:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to save system RBAC defaults&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case &quot;Events&quot;:
        return <Shield className=&quot;h-4 w-4&quot; />;
      case &quot;System&quot;:
        return <Globe className=&quot;h-4 w-4&quot; />;
      default:
        return <Shield className=&quot;h-4 w-4&quot; />;
    }
  };

  if (loading) {
    return (
      <div className=&quot;container mx-auto p-6&quot;>
        <div className=&quot;animate-pulse space-y-6&quot;>
          <div className=&quot;h-8 bg-muted rounded w-1/3&quot;></div>
          <div className=&quot;space-y-4&quot;>
            {[...Array(8)].map((_, i) => (
              <div key={i} className=&quot;h-24 bg-muted rounded&quot;></div>
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
      acc[setting.category]?.push(setting);
      return acc;
    },
    {} as Record<string, SystemRBACDefault[]>,
  );

  return (
    <div className=&quot;container mx-auto p-6 max-w-6xl&quot;>
      <div className=&quot;flex items-center space-x-2 mb-6&quot;>
        <Globe className=&quot;h-6 w-6 text-primary&quot; />
        <h1 className=&quot;text-2xl font-bold&quot;>System RBAC Defaults</h1>
      </div>

      <p className=&quot;text-muted-foreground mb-8&quot;>
        Configure system-wide RBAC defaults that apply to all organizations.
        Organizations can override these settings individually.
      </p>

      <Tabs defaultValue=&quot;defaults&quot; className=&quot;space-y-6&quot;>
        <TabsList>
          <TabsTrigger value=&quot;defaults&quot;>System Defaults</TabsTrigger>
          <TabsTrigger value=&quot;overrides&quot;>Organization Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;defaults&quot; className=&quot;space-y-6&quot;>
          {Object.entries(settingsByCategory).map(
            ([category, categorySettings]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className=&quot;flex items-center space-x-2&quot;>
                    {getCategoryIcon(category)}
                    <span>{category} Defaults</span>
                  </CardTitle>
                  <CardDescription>
                    System-wide defaults for {category.toLowerCase()}-related
                    permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className=&quot;space-y-6&quot;>
                  {categorySettings.map((setting, index) => (
                    <div key={setting.id}>
                      <div className=&quot;flex items-center justify-between&quot;>
                        <div className=&quot;space-y-1 flex-1&quot;>
                          <Label
                            htmlFor={setting.id}
                            className=&quot;text-sm font-medium&quot;
                          >
                            {setting.name}
                          </Label>
                          <p className=&quot;text-sm text-muted-foreground&quot;>
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
                        <Separator className=&quot;mt-6&quot; />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ),
          )}

          <div className=&quot;flex justify-end&quot;>
            <Button onClick={saveSystemDefaults} disabled={saving}>
              {saving ? &quot;Saving...&quot; : &quot;Save System Defaults&quot;}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value=&quot;overrides&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center space-x-2&quot;>
                <Building className=&quot;h-5 w-5&quot; />
                <span>Organization Overrides</span>
              </CardTitle>
              <CardDescription>
                Organizations that have overridden the system defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizationOverrides.length === 0 ? (
                <p className=&quot;text-muted-foreground text-center py-8&quot;>
                  No organizations have overridden the system defaults
                </p>
              ) : (
                <div className=&quot;space-y-4&quot;>
                  {organizationOverrides.map((org) => (
                    <div
                      key={org.organizationId}
                      className=&quot;border rounded-lg p-4&quot;
                    >
                      <h3 className=&quot;font-medium mb-2&quot;>
                        {org.organizationName}
                      </h3>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        <strong>Overrides:</strong>
                        <ul className=&quot;mt-1 ml-4 list-disc&quot;>
                          {Object.entries(org.overrides).map(([key, value]) => (
                            <li key={key}>
                              {systemDefaults.find((s) => s.id === key)?.name}:{&quot; &quot;}
                              {value ? &quot;Enabled&quot; : &quot;Disabled&quot;}
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

      <Card className=&quot;mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30&quot;>
        <CardContent className=&quot;pt-6&quot;>
          <div className=&quot;flex items-start space-x-3&quot;>
            <AlertTriangle className=&quot;h-5 w-5 text-blue-600 mt-0.5&quot; />
            <div>
              <h3 className=&quot;font-medium text-blue-800 dark:text-blue-200&quot;>
                System Defaults Impact
              </h3>
              <p className=&quot;text-sm text-blue-700 dark:text-blue-300 mt-1&quot;>
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
