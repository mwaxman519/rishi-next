"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Globe, Activity, Clock, Shield } from "lucide-react";

export default function APIPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor API endpoints, performance, and security
          </p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <Activity className="h-4 w-4 mr-2" />
          All Services Online
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              API Status
            </CardTitle>
            <CardDescription>Current API service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="outline" className="text-green-600">Healthy</Badge>
              </div>
              <div className="flex justify-between">
                <span>Endpoints:</span>
                <span>156 active</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Performance
            </CardTitle>
            <CardDescription>API response times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Avg Response:</span>
                <span>245ms</span>
              </div>
              <div className="flex justify-between">
                <span>Requests/min:</span>
                <span>1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span>0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>API security monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Auth Status:</span>
                <Badge variant="outline" className="text-green-600">Secure</Badge>
              </div>
              <div className="flex justify-between">
                <span>Rate Limiting:</span>
                <span>Active</span>
              </div>
              <div className="flex justify-between">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-600">GET</Badge>
                <span className="font-mono">/api/admin/locations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">200ms</Badge>
                <Badge variant="outline" className="text-green-600">Healthy</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-blue-600">POST</Badge>
                <span className="font-mono">/api/admin/organizations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">156ms</Badge>
                <Badge variant="outline" className="text-green-600">Healthy</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-600">GET</Badge>
                <span className="font-mono">/api/admin/users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">89ms</Badge>
                <Badge variant="outline" className="text-green-600">Healthy</Badge>
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Network className="h-4 w-4 mr-2" />
              Test Endpoints
            </Button>
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}