"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import SidebarLayout from "@/app/components/SidebarLayout";
import UserDetailPanel from "@/components/users/UserDetailPanel";

/**
 * This page now serves as a wrapper around the UserDetailPanel component
 * for direct URL access to a user's profile
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { checkPermission } = useAuthorization();

  const userId = params.id as string;

  // Check permissions to see if user can view this page
  if (!isAuthLoading && !currentUser) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            User Details
          </h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded">
            <p className="text-red-700 dark:text-red-300">
              You need to be logged in to view this page.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthLoading && !checkPermission("read:users")) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            User Details
          </h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded">
            <p className="text-red-700 dark:text-red-300">
              You don't have permission to view user details.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Handle going back to users list
  const handleBack = () => {
    router.push("/users");
  };

  // Show loading state while authentication is checking
  if (isAuthLoading) {
    return (
      <SidebarLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <UserDetailPanel
          userId={userId}
          onBack={handleBack}
          showBackButton={true}
        />
      </div>
    </SidebarLayout>
  );
}
