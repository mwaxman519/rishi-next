&quot;use client&quot;;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { LineChart, Activity, Zap, Clock, TrendingUp } from &quot;lucide-react&quot;;

export default function PerformancePage() {
  return (
    <div className=&quot;p-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>Performance Monitoring</h1>
          <p className=&quot;text-gray-600 dark:text-gray-400&quot;>
            Monitor system performance, response times, and resource usage
          </p>
        </div>
        <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>
          <Activity className=&quot;h-4 w-4 mr-2&quot; />
          Optimal
        </Badge>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6&quot;>
        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <Clock className=&quot;h-4 w-4 mr-2&quot; />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>245ms</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Avg last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <Zap className=&quot;h-4 w-4 mr-2&quot; />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>1,247</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Requests/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <TrendingUp className=&quot;h-4 w-4 mr-2&quot; />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-orange-600&quot;>34%</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Current usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <CardTitle className=&quot;flex items-center text-sm&quot;>
              <Activity className=&quot;h-4 w-4 mr-2&quot; />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold text-purple-600&quot;>2.4GB</div>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>Used of 8GB</p>
          </CardContent>
        </Card>
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <LineChart className=&quot;h-5 w-5 mr-2&quot; />
              API Performance
            </CardTitle>
            <CardDescription>Response times by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;font-mono text-sm&quot;>/api/admin/locations</span>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Badge variant=&quot;secondary&quot;>200ms</Badge>
                  <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Fast</Badge>
                </div>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;font-mono text-sm&quot;>/api/admin/organizations</span>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Badge variant=&quot;secondary&quot;>156ms</Badge>
                  <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Fast</Badge>
                </div>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;font-mono text-sm&quot;>/api/admin/users</span>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Badge variant=&quot;secondary&quot;>89ms</Badge>
                  <Badge variant=&quot;outline&quot; className=&quot;text-green-600&quot;>Fast</Badge>
                </div>
              </div>
              <div className=&quot;flex items-center justify-between&quot;>
                <span className=&quot;font-mono text-sm&quot;>/api/admin/analytics</span>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Badge variant=&quot;secondary&quot;>445ms</Badge>
                  <Badge variant=&quot;outline&quot; className=&quot;text-yellow-600&quot;>Slow</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Activity className=&quot;h-5 w-5 mr-2&quot; />
              System Resources
            </CardTitle>
            <CardDescription>Current system resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-4&quot;>
              <div>
                <div className=&quot;flex justify-between mb-1&quot;>
                  <span className=&quot;text-sm&quot;>CPU Usage</span>
                  <span className=&quot;text-sm&quot;>34%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div className=&quot;bg-orange-600 h-2 rounded-full&quot; style={{ width: '34%' }}></div>
                </div>
              </div>
              <div>
                <div className=&quot;flex justify-between mb-1&quot;>
                  <span className=&quot;text-sm&quot;>Memory Usage</span>
                  <span className=&quot;text-sm&quot;>30%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div className=&quot;bg-purple-600 h-2 rounded-full&quot; style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className=&quot;flex justify-between mb-1&quot;>
                  <span className=&quot;text-sm&quot;>Database Connections</span>
                  <span className=&quot;text-sm&quot;>24%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div className=&quot;bg-blue-600 h-2 rounded-full&quot; style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Tools</CardTitle>
          <CardDescription>Analyze and optimize system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-3&quot;>
            <Button variant=&quot;outline&quot;>
              <LineChart className=&quot;h-4 w-4 mr-2&quot; />
              Generate Report
            </Button>
            <Button variant=&quot;outline&quot;>
              <Activity className=&quot;h-4 w-4 mr-2&quot; />
              Real-time Monitor
            </Button>
            <Button variant=&quot;outline&quot;>
              <Zap className=&quot;h-4 w-4 mr-2&quot; />
              Optimize Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}