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
import { Shield, Users, Calendar, Settings } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

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
            id: &quot;brand_agents_view_org_events&quot;,
            name: &quot;Brand Agents Can View Organizational Events&quot;,
            description:
              &quot;Allow brand agents to view all organizational events, not just their assigned ones&quot;,
            category: &quot;Events&quot;,
            value: data.brand_agents_view_org_events || false,
          },
          {
            id: &quot;brand_agents_manage_availability&quot;,
            name: &quot;Brand Agents Can Manage Availability&quot;,
            description:
              &quot;Allow brand agents to update their own availability and schedule preferences&quot;,
            category: &quot;Events&quot;,
            value: data.brand_agents_manage_availability !== false,
          },
          {
            id: &quot;field_coordinators_approve_assignments&quot;,
            name: &quot;Field Coordinators Can Approve Assignments&quot;,
            description:
              &quot;Allow field coordinators to approve or reject event assignments&quot;,
            category: &quot;Events&quot;,
            value: data.field_coordinators_approve_assignments !== false,
          },
          {
            id: &quot;client_users_create_events&quot;,
            name: &quot;Client Users Can Create Events&quot;,
            description:
              &quot;Allow client users to create new events for their organization&quot;,
            category: &quot;Events&quot;,
            value: data.client_users_create_events !== false,
          },
          {
            id: &quot;enable_event_notifications&quot;,
            name: &quot;Enable Event Notifications&quot;,
            description:
              &quot;Send notifications for event updates, assignments, and changes&quot;,
            category: &quot;System&quot;,
            value: data.enable_event_notifications !== false,
          },
        ];

        setSettings(featureSettings);
      }
    } catch (error) {
      console.error(&quot;Error loading settings:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to load RBAC settings&quot;,
        variant: &quot;destructive&quot;,
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
          method: &quot;PUT&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
          body: JSON.stringify(settingsObject),
        },
      );

      if (response.ok) {
        toast({
          title: &quot;Success&quot;,
          description: &quot;RBAC settings updated successfully&quot;,
        });
      } else {
        throw new Error(&quot;Failed to save settings&quot;);
      }
    } catch (error) {
      console.error(&quot;Error saving settings:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to save RBAC settings&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case &quot;Events&quot;:
        return <Calendar className=&quot;h-4 w-4&quot; />;
      case &quot;Users&quot;:
        return <Users className=&quot;h-4 w-4&quot; />;
      case &quot;System&quot;:
        return <Settings className=&quot;h-4 w-4&quot; />;
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className=&quot;h-24 bg-muted rounded&quot;></div>
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
    <div className=&quot;container mx-auto p-6 max-w-4xl&quot;>
      <div className=&quot;flex items-center space-x-2 mb-6&quot;>
        <Shield className=&quot;h-6 w-6 text-primary&quot; />
        <h1 className=&quot;text-2xl font-bold&quot;>RBAC Settings</h1>
      </div>

      <p className=&quot;text-muted-foreground mb-8&quot;>
        Configure role-based access control settings for your organization.
        These settings control what actions different user roles can perform.
      </p>

      <div className=&quot;space-y-6&quot;>
        {Object.entries(settingsByCategory).map(
          ([category, categorySettings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className=&quot;flex items-center space-x-2&quot;>
                  {getCategoryIcon(category)}
                  <span>{category} Permissions</span>
                </CardTitle>
                <CardDescription>
                  Control access for {category.toLowerCase()}-related features
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
                          updateSetting(setting.id, checked)
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
      </div>

      <div className=&quot;flex justify-end mt-8&quot;>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? &quot;Saving...&quot; : &quot;Save Settings&quot;}
        </Button>
      </div>

      <Card className=&quot;mt-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30&quot;>
        <CardContent className=&quot;pt-6&quot;>
          <div className=&quot;flex items-start space-x-3&quot;>
            <Shield className=&quot;h-5 w-5 text-orange-600 mt-0.5&quot; />
            <div>
              <h3 className=&quot;font-medium text-orange-800 dark:text-orange-200&quot;>
                Important Note
              </h3>
              <p className=&quot;text-sm text-orange-700 dark:text-orange-300 mt-1&quot;>
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
