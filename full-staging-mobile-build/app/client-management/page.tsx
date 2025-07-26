"use client";

import Link from "next/link";
import {
  Building,
  MapPin,
  Package2,
  Users,
  UserCog,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuthorization } from "../hooks/useAuthorization";

// Define the management modules
const managementModules = [
  {
    title: "Client Accounts",
    description: "Manage client organizations and account settings",
    icon: <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
    href: "/client-management/accounts",
    permission: "view:client-accounts",
    stats: {
      count: 5,
      label: "Active Clients",
    },
    actions: [
      {
        label: "Add Client",
        href: "/client-management/accounts/create",
        permission: "create:client-accounts",
      },
      {
        label: "View All",
        href: "/client-management/accounts",
        permission: "view:client-accounts",
      },
    ],
  },
  {
    title: "Location Management",
    description: "Manage venues, facilities, and service locations",
    icon: (
      <MapPin className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
    ),
    href: "/client-management/locations",
    permission: "view:locations",
    stats: {
      count: 5,
      label: "Total Locations",
    },
    actions: [
      {
        label: "Add Location",
        href: "/client-management/locations/create",
        permission: "create:locations",
      },
      {
        label: "View All",
        href: "/client-management/locations",
        permission: "view:locations",
      },
    ],
  },
  {
    title: "Kit Management",
    description: "Manage kit templates and deployed equipment kits",
    icon: (
      <Package2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
    ),
    href: "/client-management/kits",
    permission: "view:kits",
    stats: {
      count: 5,
      label: "Deployed Kits",
    },
    actions: [
      {
        label: "Add Kit",
        href: "/client-management/kits/create",
        permission: "create:kits",
      },
      {
        label: "View All",
        href: "/client-management/kits",
        permission: "view:kits",
      },
    ],
  },
  {
    title: "Staff Management",
    description: "Manage client staff assignments and scheduling",
    icon: <Users className="h-10 w-10 text-orange-600 dark:text-orange-400" />,
    href: "/client-management/staff",
    permission: "view:staff",
    stats: {
      count: 5,
      label: "Assigned Staff",
    },
    actions: [
      {
        label: "Assign Staff",
        href: "/client-management/staff/create",
        permission: "assign:staff",
      },
      {
        label: "View All",
        href: "/client-management/staff",
        permission: "view:staff",
      },
    ],
  },
  {
    title: "Client Users",
    description: "Manage client user accounts and access control",
    icon: (
      <UserCog className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
    ),
    href: "/client-management/users",
    permission: "view:client-users",
    stats: {
      count: 5,
      label: "Active Users",
    },
    actions: [
      {
        label: "Add User",
        href: "/client-management/users/create",
        permission: "create:client-users",
      },
      {
        label: "View All",
        href: "/client-management/users",
        permission: "view:client-users",
      },
    ],
  },
  {
    title: "Billing Management",
    description: "Manage client invoices, billing, and payment information",
    icon: <CreditCard className="h-10 w-10 text-teal-600 dark:text-teal-400" />,
    href: "/client-management/billing",
    permission: "view:invoices",
    stats: {
      count: 3,
      label: "Pending Invoices",
    },
    actions: [
      {
        label: "Create Invoice",
        href: "/client-management/billing/invoices/create",
        permission: "create:invoices",
      },
      {
        label: "View All",
        href: "/client-management/billing",
        permission: "view:invoices",
      },
    ],
  },
];

export default function ClientManagementPage() {
  const { checkPermission } = useAuthorization();

  // Filter modules based on permissions
  const accessibleModules = managementModules.filter((module) =>
    checkPermission(module.permission),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Client Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
          Comprehensive tools for managing client organizations, facilities, and
          resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleModules.map((module, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>{module.icon}</div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-center">
                  <div className="text-2xl font-bold">{module.stats.count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {module.stats.label}
                  </div>
                </div>
              </div>
              <CardTitle className="mt-4 text-xl">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {module.actions.map(
                  (action, actionIndex) =>
                    checkPermission(action.permission) && (
                      <div key={actionIndex} className="text-sm">
                        <Link
                          href={action.href}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <ArrowRight className="h-3 w-3" /> {action.label}
                        </Link>
                      </div>
                    ),
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={module.href}>Manage {module.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
