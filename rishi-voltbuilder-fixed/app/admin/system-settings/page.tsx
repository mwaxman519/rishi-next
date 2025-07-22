"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Save,
} from "lucide-react";

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
    platformName: "Rishi Workforce Management",
    timezone: "America/Denver",
    dateFormat: "MM/dd/yyyy",
    defaultLanguage: "en",
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
    backupFrequency: "daily",
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
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure global system parameters and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  value={settings.general.platformName}
                  onChange={(e) =>
                    updateSetting("general", "platformName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    updateSetting("general", "timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) =>
                    updateSetting("general", "dateFormat", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Default Language</Label>
                <Select
                  value={settings.general.defaultLanguage}
                  onValueChange={(value) =>
                    updateSetting("general", "defaultLanguage", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable access for system maintenance
                </p>
              </div>
              <Switch
                checked={settings.general.maintenanceMode}
                onCheckedChange={(checked) =>
                  updateSetting("general", "maintenanceMode", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-timeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Input
                  id="password-length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "passwordMinLength",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="max-attempts">Max Login Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "maxLoginAttempts",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Mandate 2FA for all user accounts
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "requireTwoFactor", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to approved IP addresses only
                  </p>
                </div>
                <Switch
                  checked={settings.security.ipWhitelisting}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "ipWhitelisting", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "notifications",
                      "emailNotifications",
                      checked,
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "smsNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "pushNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical system status notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "systemAlerts", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Settings
            </CardTitle>
            <CardDescription>
              Configure database backup and maintenance options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select
                  value={settings.database.backupFrequency}
                  onValueChange={(value) =>
                    updateSetting("database", "backupFrequency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retention-period">
                  Retention Period (days)
                </Label>
                <Input
                  id="retention-period"
                  type="number"
                  value={settings.database.retentionPeriod}
                  onChange={(e) =>
                    updateSetting(
                      "database",
                      "retentionPeriod",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatic Maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic database optimization
                </p>
              </div>
              <Switch
                checked={settings.database.autoMaintenance}
                onCheckedChange={(checked) =>
                  updateSetting("database", "autoMaintenance", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
