&quot;use client&quot;;

import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import {
  Building,
  MapPin,
  Package2,
  Users,
  UserCog,
  CreditCard,
  ChevronRight,
} from &quot;lucide-react&quot;;
import { cn } from &quot;../lib/utils&quot;;
import { useAuthorization } from &quot;../hooks/useAuthorization&quot;;
import { Toaster } from &quot;../components/ui/toaster&quot;;

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission: string;
}

const clientNavItems: NavItem[] = [
  {
    title: &quot;Dashboard&quot;,
    href: &quot;/client-management&quot;,
    icon: <Building className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:client-management&quot;,
  },
  {
    title: &quot;Client Accounts&quot;,
    href: &quot;/client-management/accounts&quot;,
    icon: <Building className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:client-accounts&quot;,
  },
  {
    title: &quot;Locations&quot;,
    href: &quot;/client-management/locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:locations&quot;,
  },
  {
    title: &quot;Kits&quot;,
    href: &quot;/client-management/kits&quot;,
    icon: <Package2 className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:kits&quot;,
  },
  {
    title: &quot;Staff&quot;,
    href: &quot;/client-management/staff&quot;,
    icon: <Users className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:staff&quot;,
  },
  {
    title: &quot;Client Users&quot;,
    href: &quot;/client-management/users&quot;,
    icon: <UserCog className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:client-users&quot;,
  },
  {
    title: &quot;Billing&quot;,
    href: &quot;/client-management/billing&quot;,
    icon: <CreditCard className=&quot;h-5 w-5&quot; />,
    permission: &quot;view:invoices&quot;,
  },
];

export default function ClientManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { checkPermission } = useAuthorization();

  // Filter nav items based on permissions
  const allowedNavItems = clientNavItems.filter((item) =>
    checkPermission(item.permission),
  );

  return (
    <div className=&quot;container mx-auto px-4&quot;>
      <div className=&quot;flex items-center py-4 mb-2&quot;>
        <div className=&quot;flex-1&quot;>
          <nav className=&quot;flex space-x-1&quot; aria-label=&quot;Breadcrumb&quot;>
            <div className=&quot;flex items-center text-sm&quot;>
              <Link
                href=&quot;/&quot;
                className=&quot;text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200&quot;
              >
                Home
              </Link>
              <ChevronRight className=&quot;h-4 w-4 mx-1 text-gray-400&quot; />
              <span className=&quot;text-gray-900 dark:text-gray-200 font-medium&quot;>
                Client Management
              </span>
              {pathname !== &quot;/client-management&quot; && (
                <>
                  <ChevronRight className=&quot;h-4 w-4 mx-1 text-gray-400&quot; />
                  <span className=&quot;text-gray-900 dark:text-gray-200 font-medium&quot;>
                    {allowedNavItems.find((item) =>
                      pathname.startsWith(item.href),
                    )?.title || &quot;Details&quot;}
                  </span>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div className=&quot;flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6&quot;>
        {allowedNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              &quot;flex items-center px-4 py-3 text-sm font-medium rounded-t-lg relative -mb-px -mr-px&quot;,
              pathname === item.href ||
                (item.href !== &quot;/client-management&quot; &&
                  pathname.startsWith(item.href))
                ? &quot;bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800&quot;
                : &quot;text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700&quot;,
            )}
          >
            <span className=&quot;mr-2&quot;>{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </div>

      <main>{children}</main>

      {/* Add Toaster component for toast notifications */}
      <Toaster />
    </div>
  );
}
