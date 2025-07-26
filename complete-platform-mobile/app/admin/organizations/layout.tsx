"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isSettings = pathname.includes("/settings");
  const isBranding = pathname.includes("/branding");
  const isUsers = pathname.includes("/users");
  const isRoles = pathname.includes("/roles");

  // If we're looking at a specific organization's feature, get the organizationId
  const organizationIdMatch = pathname.match(/organizationId=([^&]+)/);
  const organizationId = organizationIdMatch ? organizationIdMatch[1] : null;

  // Only show tabs when we're on an organization-specific page
  if (!organizationId) {
    return <>{children}</>;
  }

  // Use the correct base path for each tab
  const baseUrl = `/admin/organizations`;

  return (
    <div>
      <Tabs
        value={
          isSettings
            ? "settings"
            : isBranding
              ? "branding"
              : isUsers
                ? "users"
                : isRoles
                  ? "roles"
                  : "details"
        }
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <Link href={`${baseUrl}/${organizationId}`} passHref legacyBehavior>
            <TabsTrigger value="details" className="cursor-pointer">
              Details
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/settings?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value="settings" className="cursor-pointer">
              Settings
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/branding?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value="branding" className="cursor-pointer">
              Branding
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/users?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value="users" className="cursor-pointer">
              Users
            </TabsTrigger>
          </Link>

          <Link
            href={`${baseUrl}/roles?organizationId=${organizationId}`}
            passHref
            legacyBehavior
          >
            <TabsTrigger value="roles" className="cursor-pointer">
              Roles & Permissions
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>

      <Separator className="mb-6" />

      {children}
    </div>
  );
}
