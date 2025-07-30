&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Settings,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Save,
} from &quot;lucide-react&quot;;

interface SystemSettings {
  general: {
    platformName: string;
    timezone: string;
    dateFormat: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
    ipWhitelisting: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    systemAlerts: boolean;
  };
  database: {
    backupFrequency: string;
    retentionPeriod: number;
    autoMaintenance: boolean;
  };
}

const initialSettings: SystemSettings = {
  general: {
    platformName: &quot;Rishi Workforce Management&quot;,
    timezone: &quot;America/Denver&quot;,
    dateFormat: &quot;MM/dd/yyyy&quot;,
    defaultLanguage: &quot;en&quot;,
    maintenanceMode: false,
  },
  security: {
    sessionTimeout: 480,
    passwordMinLength: 8,
    requireTwoFactor: false,
    maxLoginAttempts: 5,
    ipWhitelisting: false,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
  },
  database: {
    backupFrequency: &quot;daily&quot;,
    retentionPeriod: 90,
    autoMaintenance: true,
  },
};

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (
    section: keyof SystemSettings,
    key: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings to backend
    console.log(&quot;Saving settings:&quot;, settings);
    setHasChanges(false);
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>System Settings</h1>
          <p className=&quot;text-muted-foreground mt-2&quot;>
            Configure global system parameters and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className=&quot;w-4 h-4 mr-2&quot; />
          Save Changes
        </Button>
      </div>

      {hasChanges && (
        <div className=&quot;bg-yellow-50 border border-yellow-200 rounded-lg p-4&quot;>
          <p className=&quot;text-sm text-yellow-800&quot;>
            You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </p>
        </div>
      )}

      <div className=&quot;grid gap-6&quot;>
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Settings className=&quot;w-5 h-5 mr-2&quot; />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className=&quot;space-y-4&quot;>
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              <div>
                <Label htmlFor=&quot;platform-name&quot;>Platform Name</Label>
                <Input
                  id=&quot;platform-name&quot;
                  value={settings.general.platformName}
                  onChange={(e) =>
                    updateSetting(&quot;general&quot;, &quot;platformName&quot;, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor=&quot;timezone&quot;>Default Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    updateSetting(&quot;general&quot;, &quot;timezone&quot;, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;America/Denver&quot;>
                      Mountain Time
                    </SelectItem>
                    <SelectItem value=&quot;America/Los_Angeles&quot;>
                      Pacific Time
                    </SelectItem>
                    <SelectItem value=&quot;America/New_York&quot;>
                      Eastern Time
                    </SelectItem>
                    <SelectItem value=&quot;America/Chicago&quot;>
                      Central Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor=&quot;date-format&quot;>Date Format</Label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) =>
                    updateSetting(&quot;general&quot;, &quot;dateFormat&quot;, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;MM/dd/yyyy&quot;>MM/dd/yyyy</SelectItem>
                    <SelectItem value=&quot;dd/MM/yyyy&quot;>dd/MM/yyyy</SelectItem>
                    <SelectItem value=&quot;yyyy-MM-dd&quot;>yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor=&quot;language&quot;>Default Language</Label>
                <Select
                  value={settings.general.defaultLanguage}
                  onValueChange={(value) =>
                    updateSetting(&quot;general&quot;, &quot;defaultLanguage&quot;, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;en&quot;>English</SelectItem>
                    <SelectItem value=&quot;es&quot;>Spanish</SelectItem>
                    <SelectItem value=&quot;fr&quot;>French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <Label>Maintenance Mode</Label>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  Temporarily disable access for system maintenance
                </p>
              </div>
              <Switch
                checked={settings.general.maintenanceMode}
                onCheckedChange={(checked) =>
                  updateSetting(&quot;general&quot;, &quot;maintenanceMode&quot;, checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Shield className=&quot;w-5 h-5 mr-2&quot; />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className=&quot;space-y-4&quot;>
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              <div>
                <Label htmlFor=&quot;session-timeout&quot;>
                  Session Timeout (minutes)
                </Label>
                <Input
                  id=&quot;session-timeout&quot;
                  type=&quot;number&quot;
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      &quot;security&quot;,
                      &quot;sessionTimeout&quot;,
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor=&quot;password-length&quot;>Minimum Password Length</Label>
                <Input
                  id=&quot;password-length&quot;
                  type=&quot;number&quot;
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    updateSetting(
                      &quot;security&quot;,
                      &quot;passwordMinLength&quot;,
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor=&quot;max-attempts&quot;>Max Login Attempts</Label>
                <Input
                  id=&quot;max-attempts&quot;
                  type=&quot;number&quot;
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    updateSetting(
                      &quot;security&quot;,
                      &quot;maxLoginAttempts&quot;,
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <Separator />
            <div className=&quot;space-y-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Mandate 2FA for all user accounts
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) =>
                    updateSetting(&quot;security&quot;, &quot;requireTwoFactor&quot;, checked)
                  }
                />
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>IP Whitelisting</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Restrict access to approved IP addresses only
                  </p>
                </div>
                <Switch
                  checked={settings.security.ipWhitelisting}
                  onCheckedChange={(checked) =>
                    updateSetting(&quot;security&quot;, &quot;ipWhitelisting&quot;, checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Bell className=&quot;w-5 h-5 mr-2&quot; />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className=&quot;space-y-4&quot;>
            <div className=&quot;space-y-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>Email Notifications</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      &quot;notifications&quot;,
                      &quot;emailNotifications&quot;,
                      checked,
                    )
                  }
                />
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>SMS Notifications</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Send notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(&quot;notifications&quot;, &quot;smsNotifications&quot;, checked)
                  }
                />
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>Push Notifications</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(&quot;notifications&quot;, &quot;pushNotifications&quot;, checked)
                  }
                />
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <Label>System Alerts</Label>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Critical system status notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting(&quot;notifications&quot;, &quot;systemAlerts&quot;, checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Database className=&quot;w-5 h-5 mr-2&quot; />
              Database Settings
            </CardTitle>
            <CardDescription>
              Configure database backup and maintenance options
            </CardDescription>
          </CardHeader>
          <CardContent className=&quot;space-y-4&quot;>
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              <div>
                <Label htmlFor=&quot;backup-frequency&quot;>Backup Frequency</Label>
                <Select
                  value={settings.database.backupFrequency}
                  onValueChange={(value) =>
                    updateSetting(&quot;database&quot;, &quot;backupFrequency&quot;, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;hourly&quot;>Hourly</SelectItem>
                    <SelectItem value=&quot;daily&quot;>Daily</SelectItem>
                    <SelectItem value=&quot;weekly&quot;>Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor=&quot;retention-period&quot;>
                  Retention Period (days)
                </Label>
                <Input
                  id=&quot;retention-period&quot;
                  type=&quot;number&quot;
                  value={settings.database.retentionPeriod}
                  onChange={(e) =>
                    updateSetting(
                      &quot;database&quot;,
                      &quot;retentionPeriod&quot;,
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <Separator />
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <Label>Automatic Maintenance</Label>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  Enable automatic database optimization
                </p>
              </div>
              <Switch
                checked={settings.database.autoMaintenance}
                onCheckedChange={(checked) =>
                  updateSetting(&quot;database&quot;, &quot;autoMaintenance&quot;, checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
