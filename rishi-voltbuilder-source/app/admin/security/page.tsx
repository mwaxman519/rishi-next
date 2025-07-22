"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertTriangle, Eye, Key } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor security threats, authentication, and access control
          </p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <Shield className="h-4 w-4 mr-2" />
          Secure
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Status
            </CardTitle>
            <CardDescription>Overall security health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="outline" className="text-green-600">Secure</Badge>
              </div>
              <div className="flex justify-between">
                <span>Threats Blocked:</span>
                <span>47</span>
              </div>
              <div className="flex justify-between">
                <span>Last Scan:</span>
                <span>5 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Authentication
            </CardTitle>
            <CardDescription>User authentication metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span>24</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Logins:</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span>2FA Enabled:</span>
                <span>18/24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Threats
            </CardTitle>
            <CardDescription>Security threat monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Threats:</span>
                <Badge variant="outline" className="text-green-600">0</Badge>
              </div>
              <div className="flex justify-between">
                <span>Blocked IPs:</span>
                <span>12</span>
              </div>
              <div className="flex justify-between">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Login Success: mike@example.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">2 min ago</Badge>
                <Badge variant="outline" className="text-green-600">Success</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>Rate limit exceeded: 192.168.1.100</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">15 min ago</Badge>
                <Badge variant="outline" className="text-yellow-600">Blocked</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Permission updated: User Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">1 hr ago</Badge>
                <Badge variant="outline" className="text-blue-600">Updated</Badge>
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Audit Log
            </Button>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Manage Access Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}