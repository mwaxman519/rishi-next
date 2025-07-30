&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Shield, Lock, AlertTriangle, Eye, Key } from &quot;lucide-react&quot;;

export default function SecurityPage() {
  return (
    <div className=&quot;p-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>Security Management</h1>
          <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
            Monitor security threats, authentication, and access control
          </p>
        </div>
        <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>
          <Shield className=&quot;h-4 w-4 mr-2&quot; />
          Secure
        </Badge>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Shield className=&quot;h-5 w-5 mr-2&quot; />
              Security Status
            </CardTitle>
            <CardDescription>Overall security health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Status:</span>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Secure</Badge>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Threats Blocked:</span>
                <span>47</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Last Scan:</span>
                <span>5 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Lock className=&quot;h-5 w-5 mr-2&quot; />
              Authentication
            </CardTitle>
            <CardDescription>User authentication metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Active Sessions:</span>
                <span>24</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Failed Logins:</span>
                <span>3</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>2FA Enabled:</span>
                <span>18/24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <AlertTriangle className=&quot;h-5 w-5 mr-2&quot; />
              Threats
            </CardTitle>
            <CardDescription>Security threat monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Active Threats:</span>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>0</Badge>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Blocked IPs:</span>
                <span>12</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Suspicious Activity:</span>
                <span>2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Monitor recent security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;space-y-3&quot;>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Shield className=&quot;h-4 w-4 text-green-600&quot; />
                <span>Login Success: mike@example.com</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>2 min ago</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Success</Badge>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <AlertTriangle className=&quot;h-4 w-4 text-yellow-600&quot; />
                <span>Rate limit exceeded: 192.168.1.100</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>15 min ago</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-yellow-600&quot;>Blocked</Badge>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Lock className=&quot;h-4 w-4 text-blue-600&quot; />
                <span>Permission updated: User Management</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>1 hr ago</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-blue-600&quot;>Updated</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Tools</CardTitle>
          <CardDescription>Manage security settings and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-3&quot;>
            <Button variant=&quot;outline&quot;>
              <Shield className=&quot;h-4 w-4 mr-2&quot; />
              Run Security Scan
            </Button>
            <Button variant=&quot;outline&quot;>
              <Eye className=&quot;h-4 w-4 mr-2&quot; />
              View Audit Log
            </Button>
            <Button variant=&quot;outline&quot;>
              <Key className=&quot;h-4 w-4 mr-2&quot; />
              Manage Access Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}