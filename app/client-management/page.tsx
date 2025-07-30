&quot;use client&quot;;

import Link from &quot;next/link&quot;;
import {
  Building,
  MapPin,
  Package2,
  Users,
  UserCog,
  CreditCard,
  ArrowRight,
} from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;../components/ui/card&quot;;
import { Button } from &quot;../components/ui/button&quot;;
import { useAuthorization } from &quot;../hooks/useAuthorization&quot;;

// Define the management modules
const managementModules = [
  {
    title: &quot;Client Accounts&quot;,
    description: &quot;Manage client organizations and account settings&quot;,
    icon: <Building className=&quot;h-10 w-10 text-blue-600 dark:text-blue-400&quot; />,
    href: &quot;/client-management/accounts&quot;,
    permission: &quot;view:client-accounts&quot;,
    stats: {
      count: 5,
      label: &quot;Active Clients&quot;,
    },
    actions: [
      {
        label: &quot;Add Client&quot;,
        href: &quot;/client-management/accounts/create&quot;,
        permission: &quot;create:client-accounts&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/accounts&quot;,
        permission: &quot;view:client-accounts&quot;,
      },
    ],
  },
  {
    title: &quot;Location Management&quot;,
    description: &quot;Manage venues, facilities, and service locations&quot;,
    icon: (
      <MapPin className=&quot;h-10 w-10 text-emerald-600 dark:text-emerald-400&quot; />
    ),
    href: &quot;/client-management/locations&quot;,
    permission: &quot;view:locations&quot;,
    stats: {
      count: 5,
      label: &quot;Total Locations&quot;,
    },
    actions: [
      {
        label: &quot;Add Location&quot;,
        href: &quot;/client-management/locations/create&quot;,
        permission: &quot;create:locations&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/locations&quot;,
        permission: &quot;view:locations&quot;,
      },
    ],
  },
  {
    title: &quot;Kit Management&quot;,
    description: &quot;Manage kit templates and deployed equipment kits&quot;,
    icon: (
      <Package2 className=&quot;h-10 w-10 text-purple-600 dark:text-purple-400&quot; />
    ),
    href: &quot;/client-management/kits&quot;,
    permission: &quot;view:kits&quot;,
    stats: {
      count: 5,
      label: &quot;Deployed Kits&quot;,
    },
    actions: [
      {
        label: &quot;Add Kit&quot;,
        href: &quot;/client-management/kits/create&quot;,
        permission: &quot;create:kits&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/kits&quot;,
        permission: &quot;view:kits&quot;,
      },
    ],
  },
  {
    title: &quot;Staff Management&quot;,
    description: &quot;Manage client staff assignments and scheduling&quot;,
    icon: <Users className=&quot;h-10 w-10 text-orange-600 dark:text-orange-400&quot; />,
    href: &quot;/client-management/staff&quot;,
    permission: &quot;view:staff&quot;,
    stats: {
      count: 5,
      label: &quot;Assigned Staff&quot;,
    },
    actions: [
      {
        label: &quot;Assign Staff&quot;,
        href: &quot;/client-management/staff/create&quot;,
        permission: &quot;assign:staff&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/staff&quot;,
        permission: &quot;view:staff&quot;,
      },
    ],
  },
  {
    title: &quot;Client Users&quot;,
    description: &quot;Manage client user accounts and access control&quot;,
    icon: (
      <UserCog className=&quot;h-10 w-10 text-indigo-600 dark:text-indigo-400&quot; />
    ),
    href: &quot;/client-management/users&quot;,
    permission: &quot;view:client-users&quot;,
    stats: {
      count: 5,
      label: &quot;Active Users&quot;,
    },
    actions: [
      {
        label: &quot;Add User&quot;,
        href: &quot;/client-management/users/create&quot;,
        permission: &quot;create:client-users&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/users&quot;,
        permission: &quot;view:client-users&quot;,
      },
    ],
  },
  {
    title: &quot;Billing Management&quot;,
    description: &quot;Manage client invoices, billing, and payment information&quot;,
    icon: <CreditCard className=&quot;h-10 w-10 text-teal-600 dark:text-teal-400&quot; />,
    href: &quot;/client-management/billing&quot;,
    permission: &quot;view:invoices&quot;,
    stats: {
      count: 3,
      label: &quot;Pending Invoices&quot;,
    },
    actions: [
      {
        label: &quot;Create Invoice&quot;,
        href: &quot;/client-management/billing/invoices/create&quot;,
        permission: &quot;create:invoices&quot;,
      },
      {
        label: &quot;View All&quot;,
        href: &quot;/client-management/billing&quot;,
        permission: &quot;view:invoices&quot;,
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
    <div className=&quot;container mx-auto px-4 py-8&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
          Client Management
        </h1>
        <p className=&quot;mt-2 text-gray-600 dark:text-gray-400 text-lg&quot;>
          Comprehensive tools for managing client organizations, facilities, and
          resources
        </p>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {accessibleModules.map((module, index) => (
          <Card key={index} className=&quot;overflow-hidden&quot;>
            <CardHeader className=&quot;pb-2&quot;>
              <div className=&quot;flex items-start justify-between&quot;>
                <div>{module.icon}</div>
                <div className=&quot;bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-center&quot;>
                  <div className=&quot;text-2xl font-bold&quot;>{module.stats.count}</div>
                  <div className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                    {module.stats.label}
                  </div>
                </div>
              </div>
              <CardTitle className=&quot;mt-4 text-xl&quot;>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className=&quot;pb-2&quot;>
              <div className=&quot;space-y-2&quot;>
                {module.actions.map(
                  (action, actionIndex) =>
                    checkPermission(action.permission) && (
                      <div key={actionIndex} className=&quot;text-sm&quot;>
                        <Link
                          href={action.href}
                          className=&quot;text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1&quot;
                        >
                          <ArrowRight className=&quot;h-3 w-3&quot; /> {action.label}
                        </Link>
                      </div>
                    ),
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant=&quot;outline&quot; className=&quot;w-full&quot;>
                <Link href={module.href}>Manage {module.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
