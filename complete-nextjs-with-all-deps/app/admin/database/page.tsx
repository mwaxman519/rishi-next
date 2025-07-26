"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, HardDrive, Activity, Clock } from "lucide-react";

export default function DatabasePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Database Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage database connections and performance
          </p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <Activity className="h-4 w-4 mr-2" />
          Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Connection Status
            </CardTitle>
            <CardDescription>Database connection health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Provider:</span>
                <span>Neon PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span>45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Storage Usage
            </CardTitle>
            <CardDescription>Database storage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Used:</span>
                <span>2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span>7.6 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Usage:</span>
                <span>24%</span>
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
            <CardDescription>Query performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Avg Query Time:</span>
                <span>125ms</span>
              </div>
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <span>12</span>
              </div>
              <div className="flex justify-between">
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Run Health Check
            </Button>
            <Button variant="outline">
              <HardDrive className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}