&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Database, HardDrive, Activity, Clock } from &quot;lucide-react&quot;;

export default function DatabasePage() {
  return (
    <div className=&quot;p-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>Database Management</h1>
          <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
            Monitor and manage database connections and performance
          </p>
        </div>
        <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>
          <Activity className=&quot;h-4 w-4 mr-2&quot; />
          Connected
        </Badge>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Database className=&quot;h-5 w-5 mr-2&quot; />
              Connection Status
            </CardTitle>
            <CardDescription>Database connection health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Status:</span>
                <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Active</Badge>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Provider:</span>
                <span>Neon PostgreSQL</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Response Time:</span>
                <span>45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <HardDrive className=&quot;h-5 w-5 mr-2&quot; />
              Storage Usage
            </CardTitle>
            <CardDescription>Database storage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Used:</span>
                <span>2.4 GB</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Available:</span>
                <span>7.6 GB</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Usage:</span>
                <span>24%</span>
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
            <CardDescription>Query performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span>Avg Query Time:</span>
                <span>125ms</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Active Connections:</span>
                <span>12</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span>Pool Size:</span>
                <span>50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>Manage database operations and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-3&quot;>
            <Button variant=&quot;outline&quot;>
              <Database className=&quot;h-4 w-4 mr-2&quot; />
              Run Health Check
            </Button>
            <Button variant=&quot;outline&quot;>
              <HardDrive className=&quot;h-4 w-4 mr-2&quot; />
              Backup Database
            </Button>
            <Button variant=&quot;outline&quot;>
              <Activity className=&quot;h-4 w-4 mr-2&quot; />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}