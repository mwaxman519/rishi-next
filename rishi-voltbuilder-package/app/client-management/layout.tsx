"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building,
  MapPin,
  Package2,
  Users,
  UserCog,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthorization } from "../hooks/useAuthorization";
import { Toaster } from "../components/ui/toaster";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission: string;
}

const clientNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/client-management",
    icon: <Building className="h-5 w-5" />,
    permission: "view:client-management",
  },
  {
    title: "Client Accounts",
    href: "/client-management/accounts",
    icon: <Building className="h-5 w-5" />,
    permission: "view:client-accounts",
  },
  {
    title: "Locations",
    href: "/client-management/locations",
    icon: <MapPin className="h-5 w-5" />,
    permission: "view:locations",
  },
  {
    title: "Kits",
    href: "/client-management/kits",
    icon: <Package2 className="h-5 w-5" />,
    permission: "view:kits",
  },
  {
    title: "Staff",
    href: "/client-management/staff",
    icon: <Users className="h-5 w-5" />,
    permission: "view:staff",
  },
  {
    title: "Client Users",
    href: "/client-management/users",
    icon: <UserCog className="h-5 w-5" />,
    permission: "view:client-users",
  },
  {
    title: "Billing",
    href: "/client-management/billing",
    icon: <CreditCard className="h-5 w-5" />,
    permission: "view:invoices",
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
    <div className="container mx-auto px-4">
      <div className="flex items-center py-4 mb-2">
        <div className="flex-1">
          <nav className="flex space-x-1" aria-label="Breadcrumb">
            <div className="flex items-center text-sm">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="text-gray-900 dark:text-gray-200 font-medium">
                Client Management
              </span>
              {pathname !== "/client-management" && (
                <>
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-200 font-medium">
                    {allowedNavItems.find((item) =>
                      pathname.startsWith(item.href),
                    )?.title || "Details"}
                  </span>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
        {allowedNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-t-lg relative -mb-px -mr-px",
              pathname === item.href ||
                (item.href !== "/client-management" &&
                  pathname.startsWith(item.href))
                ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
            )}
          >
            <span className="mr-2">{item.icon}</span>
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
