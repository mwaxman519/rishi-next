&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Network, Globe, Activity, Clock, Shield } from &quot;lucide-react&quot;;

export default function APIPage() {
  return (
    <div className=&quot;p-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>API Management</h1>
          <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
            Monitor API endpoints, performance, and security
          </p>
        </div>
        <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>
          <Activity className=&quot;h-4 w-4 mr-2&quot; />
          All Services Online
        </Badge>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Network className=&quot;h-5 w-5 mr-2&quot; />
              API Status
            </CardTitle>
            <CardDescription>Current API service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Status:</span>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Healthy</Badge>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Endpoints:</span>
                <span>156 active</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Uptime:</span>
                <span>99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Clock className=&quot;h-5 w-5 mr-2&quot; />
              Performance
            </CardTitle>
            <CardDescription>API response times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Avg Response:</span>
                <span>245ms</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Requests/min:</span>
                <span>1,247</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Error Rate:</span>
                <span>0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Shield className=&quot;h-5 w-5 mr-2&quot; />
              Security
            </CardTitle>
            <CardDescription>API security monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Auth Status:</span>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Secure</Badge>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Rate Limiting:</span>
                <span>Active</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Blocked Requests:</span>
                <span>23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Monitor and manage API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;space-y-3&quot;>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>GET</Badge>
                <span className=&quot;font-mono&quot;>/api/admin/locations</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>200ms</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Healthy</Badge>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-blue-600&quot;>POST</Badge>
                <span className=&quot;font-mono&quot;>/api/admin/organizations</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>156ms</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Healthy</Badge>
              </div>
            </div>
            <div className=&quot;flex items-center justify-between p-3 border rounded-lg&quot;>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>GET</Badge>
                <span className=&quot;font-mono&quot;>/api/admin/users</span>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Badge variant=&quot;secondary&quot;>89ms</Badge>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Healthy</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Tools</CardTitle>
          <CardDescription>Manage and monitor API services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-3&quot;>
            <Button variant=&quot;outline&quot;>
              <Network className=&quot;h-4 w-4 mr-2&quot; />
              Test Endpoints
            </Button>
            <Button variant=&quot;outline&quot;>
              <Globe className=&quot;h-4 w-4 mr-2&quot; />
              View Documentation
            </Button>
            <Button variant=&quot;outline&quot;>
              <Activity className=&quot;h-4 w-4 mr-2&quot; />
              Performance Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}