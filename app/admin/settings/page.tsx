"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkPermission } = useAuthorization();
  const [activeSection, setActiveSection] = useState("general");

  // Check if user has permission to manage settings
  const canManageSettings = checkPermission("manage:settings");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <div className="container mx-auto py-6">
        <h1 className=&quot;text-2xl font-bold mb-4>Settings</h1>
        <p>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general system settings and default behaviors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Platform Name</div>
                <Input id="site-name" defaultValue="Rishi Platform" />
                <p className="text-sm text-muted-foreground">
                  The name that appears throughout the user interface.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Default Timezone</div>
                <select
                  id="default-timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="America/Los_Angeles"
                >
                  <option value="America/Los_Angeles">
                    Pacific Time (US & Canada)
                  </option>
                  <option value="America/Denver">
                    Mountain Time (US & Canada)
                  </option>
                  <option value="America/Chicago">
                    Central Time (US & Canada)
                  </option>
                  <option value="America/New_York">
                    Eastern Time (US & Canada)
                  </option>
                  <option value="UTC">UTC</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  System default timezone for new accounts and reports.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Maintenance Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Put the system in maintenance mode to restrict access.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Off</span>
                  <button
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-200 dark:bg-gray-700"
                    role="switch"
                    aria-checked="false"
                  >
                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                  <span className="text-sm text-muted-foreground">On</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics Tracking</div>
                  <p className="text-sm text-muted-foreground">
                    Enable anonymous usage data collection to improve the
                    platform.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Off</span>
                  <button
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary"
                    role="switch"
                    aria-checked="true"
                  >
                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                  <span className="text-sm text-muted-foreground">On</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        );

      case "security":
        return (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access control settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Session Timeout (minutes)</div>
                <Input id="session-timeout" type="number" defaultValue={60} />
                <p className="text-sm text-muted-foreground">
                  How long before inactive users are automatically logged out.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Password Policy</div>
                <select
                  id="password-policy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="standard"
                >
                  <option value="basic">Basic (8+ characters)</option>
                  <option value="standard">
                    Standard (8+ chars, uppercase, lowercase, numbers)
                  </option>
                  <option value="strict">
                    Strict (12+ chars, uppercase, lowercase, numbers, symbols)
                  </option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Password requirements for all users.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        );

      case "notifications":
        return (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">System Notification Email</div>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="notifications@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Email address used for sending system notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="font-medium">Notification Channels</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="email-notifications"
                    className="text-sm font-medium"
                  >
                    Email Notifications
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="sms-notifications"
                    className="text-sm font-medium"
                  >
                    SMS Notifications
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in-app-notifications"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="in-app-notifications"
                    className="text-sm font-medium"
                  >
                    In-App Notifications
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 text-lg font-medium">Settings</div>
            <Separator />
            <nav className="space-y-1 p-2">
              <button
                onClick={() => setActiveSection("general")}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === "general" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                General
              </button>
              <button
                onClick={() => setActiveSection("security")}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === "security" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveSection("notifications")}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === "notifications" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                Notifications
              </button>
            </nav>
          </div>
        </div>

        <div className=&quot;md:w-3/4>{renderSection()}</div>
      </div>
    </div>
  );
}
