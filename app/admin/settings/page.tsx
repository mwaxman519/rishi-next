&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { ArrowLeft, Save } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkPermission } = useAuthorization();
  const [activeSection, setActiveSection] = useState(&quot;general&quot;);

  // Check if user has permission to manage settings
  const canManageSettings = checkPermission(&quot;manage:settings&quot;);

  const handleSave = () => {
    toast({
      title: &quot;Settings saved&quot;,
      description: &quot;Your settings have been saved successfully.&quot;,
    });
  };

  if (!user) {
    return (
      <div className=&quot;container mx-auto py-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-4&quot;>Settings</h1>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <div className=&quot;container mx-auto py-6&quot;>
        <h1 className=&quot;text-2xl font-bold mb-4&quot;>Settings</h1>
        <p>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case &quot;general&quot;:
        return (
          <Card className=&quot;border border-border&quot;>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general system settings and default behaviors.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;font-medium&quot;>Platform Name</div>
                <Input id=&quot;site-name&quot; defaultValue=&quot;Rishi Platform&quot; />
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  The name that appears throughout the user interface.
                </p>
              </div>

              <div className=&quot;space-y-2&quot;>
                <div className=&quot;font-medium&quot;>Default Timezone</div>
                <select
                  id=&quot;default-timezone&quot;
                  className=&quot;flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;
                  defaultValue=&quot;America/Los_Angeles&quot;
                >
                  <option value=&quot;America/Los_Angeles&quot;>
                    Pacific Time (US & Canada)
                  </option>
                  <option value=&quot;America/Denver&quot;>
                    Mountain Time (US & Canada)
                  </option>
                  <option value=&quot;America/Chicago&quot;>
                    Central Time (US & Canada)
                  </option>
                  <option value=&quot;America/New_York&quot;>
                    Eastern Time (US & Canada)
                  </option>
                  <option value=&quot;UTC&quot;>UTC</option>
                </select>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  System default timezone for new accounts and reports.
                </p>
              </div>

              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <div className=&quot;font-medium&quot;>Maintenance Mode</div>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Put the system in maintenance mode to restrict access.
                  </p>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <span className=&quot;text-sm text-muted-foreground&quot;>Off</span>
                  <button
                    className=&quot;relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-200 dark:bg-gray-700&quot;
                    role=&quot;switch&quot;
                    aria-checked=&quot;false&quot;
                  >
                    <span className=&quot;translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out&quot;></span>
                  </button>
                  <span className=&quot;text-sm text-muted-foreground&quot;>On</span>
                </div>
              </div>

              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <div className=&quot;font-medium&quot;>Analytics Tracking</div>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    Enable anonymous usage data collection to improve the
                    platform.
                  </p>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <span className=&quot;text-sm text-muted-foreground&quot;>Off</span>
                  <button
                    className=&quot;relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary&quot;
                    role=&quot;switch&quot;
                    aria-checked=&quot;true&quot;
                  >
                    <span className=&quot;translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out&quot;></span>
                  </button>
                  <span className=&quot;text-sm text-muted-foreground&quot;>On</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className=&quot;flex items-center gap-2&quot;>
                <Save size={16} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        );

      case &quot;security&quot;:
        return (
          <Card className=&quot;border border-border&quot;>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access control settings.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;font-medium&quot;>Session Timeout (minutes)</div>
                <Input id=&quot;session-timeout&quot; type=&quot;number&quot; defaultValue={60} />
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  How long before inactive users are automatically logged out.
                </p>
              </div>

              <div className=&quot;space-y-2&quot;>
                <div className=&quot;font-medium&quot;>Password Policy</div>
                <select
                  id=&quot;password-policy&quot;
                  className=&quot;flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;
                  defaultValue=&quot;standard&quot;
                >
                  <option value=&quot;basic&quot;>Basic (8+ characters)</option>
                  <option value=&quot;standard&quot;>
                    Standard (8+ chars, uppercase, lowercase, numbers)
                  </option>
                  <option value=&quot;strict&quot;>
                    Strict (12+ chars, uppercase, lowercase, numbers, symbols)
                  </option>
                </select>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  Password requirements for all users.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className=&quot;flex items-center gap-2&quot;>
                <Save size={16} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        );

      case &quot;notifications&quot;:
        return (
          <Card className=&quot;border border-border&quot;>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;font-medium&quot;>System Notification Email</div>
                <Input
                  id=&quot;notification-email&quot;
                  type=&quot;email&quot;
                  defaultValue=&quot;notifications@example.com&quot;
                />
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  Email address used for sending system notifications.
                </p>
              </div>

              <div className=&quot;space-y-4&quot;>
                <div className=&quot;font-medium&quot;>Notification Channels</div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <input
                    type=&quot;checkbox&quot;
                    id=&quot;email-notifications&quot;
                    defaultChecked
                    className=&quot;h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary&quot;
                  />
                  <label
                    htmlFor=&quot;email-notifications&quot;
                    className=&quot;text-sm font-medium&quot;
                  >
                    Email Notifications
                  </label>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <input
                    type=&quot;checkbox&quot;
                    id=&quot;sms-notifications&quot;
                    className=&quot;h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary&quot;
                  />
                  <label
                    htmlFor=&quot;sms-notifications&quot;
                    className=&quot;text-sm font-medium&quot;
                  >
                    SMS Notifications
                  </label>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <input
                    type=&quot;checkbox&quot;
                    id=&quot;in-app-notifications&quot;
                    defaultChecked
                    className=&quot;h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary&quot;
                  />
                  <label
                    htmlFor=&quot;in-app-notifications&quot;
                    className=&quot;text-sm font-medium&quot;
                  >
                    In-App Notifications
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className=&quot;flex items-center gap-2&quot;>
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
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex items-center mb-6&quot;>
        <Link href=&quot;/admin&quot; className=&quot;mr-4&quot;>
          <Button variant=&quot;outline&quot; size=&quot;icon&quot;>
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className=&quot;text-3xl font-bold&quot;>System Settings</h1>
      </div>

      <div className=&quot;flex flex-col md:flex-row gap-6&quot;>
        <div className=&quot;md:w-1/4&quot;>
          <div className=&quot;bg-card border border-border rounded-lg overflow-hidden&quot;>
            <div className=&quot;p-4 text-lg font-medium&quot;>Settings</div>
            <Separator />
            <nav className=&quot;space-y-1 p-2&quot;>
              <button
                onClick={() => setActiveSection(&quot;general&quot;)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === &quot;general&quot; ? &quot;bg-primary/10 text-primary&quot; : &quot;hover:bg-muted&quot;}`}
              >
                General
              </button>
              <button
                onClick={() => setActiveSection(&quot;security&quot;)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === &quot;security&quot; ? &quot;bg-primary/10 text-primary&quot; : &quot;hover:bg-muted&quot;}`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveSection(&quot;notifications&quot;)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeSection === &quot;notifications&quot; ? &quot;bg-primary/10 text-primary&quot; : &quot;hover:bg-muted&quot;}`}
              >
                Notifications
              </button>
            </nav>
          </div>
        </div>

        <div className=&quot;md:w-3/4&quot;>{renderSection()}</div>
      </div>
    </div>
  );
}
