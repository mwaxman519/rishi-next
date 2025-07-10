"use client";

import React from "react";
import Link from "next/link";
import { Shield, Settings, Users, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccessControlPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Access Control</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Manage role-based access control settings across the platform. Configure
        system-wide defaults and organization-specific permissions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Defaults */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>System Defaults</span>
            </CardTitle>
            <CardDescription>
              Configure platform-wide default permissions and role settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/rbac-defaults"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Manage System Defaults
            </Link>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Organization Settings</span>
            </CardTitle>
            <CardDescription>
              Configure organization-specific RBAC overrides and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings/rbac"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Manage Org Settings
            </Link>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Permission Matrix</span>
            </CardTitle>
            <CardDescription>
              Visual overview of all roles and their permissions across the
              platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/rbac"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              View Permission Matrix
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View recent permission changes and role modifications
              </p>
              <Link
                href="/admin/monitoring/audit"
                className="text-primary hover:underline text-sm"
              >
                View Audit Logs →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage users and assign roles across organizations
              </p>
              <Link
                href="/admin/users"
                className="text-primary hover:underline text-sm"
              >
                Manage Users →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
