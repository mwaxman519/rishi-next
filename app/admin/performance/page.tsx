"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Activity, Zap, Clock, TrendingUp } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system performance, response times, and resource usage
          </p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <Activity className="h-4 w-4 mr-2" />
          Optimal
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">245ms</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Requests/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">34%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Activity className="h-4 w-4 mr-2" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">2.4GB</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Used of 8GB</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              API Performance
            </CardTitle>
            <CardDescription>Response times by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">/api/admin/locations</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">200ms</Badge>
                  <Badge variant="outline" className="text-green-600">Fast</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">/api/admin/organizations</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">156ms</Badge>
                  <Badge variant="outline" className="text-green-600">Fast</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">/api/admin/users</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">89ms</Badge>
                  <Badge variant="outline" className="text-green-600">Fast</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">/api/admin/analytics</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">445ms</Badge>
                  <Badge variant="outline" className="text-yellow-600">Slow</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Resources
            </CardTitle>
            <CardDescription>Current system resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm">34%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Database Connections</span>
                  <span className="text-sm">24%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <LineChart className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Monitor
            </Button>
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Optimize Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}