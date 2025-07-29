// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-[rgb(var(--background))] px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/assets/logos/rishi-logo-teal.png"
                alt="Rishi Logo"
                width={64}
                height={64}
                className="object-contain w-auto h-auto"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
          <h1 className="block text-2xl font-bold text-[rgb(var(--foreground))] mt-6 sm:text-3xl">
            Access Denied
          </h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">
            You don't have permission to access this resource.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-[rgb(var(--card))] py-8 px-4 shadow border border-[rgb(var(--border))] sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center">
              <svg
                className="h-16 w-16 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>

              <p className="text-center mt-5 text-sm text-[rgb(var(--muted-foreground))]">
                Your account doesn't have the required permissions to view this
                page. If you believe this is an error, please contact your
                administrator.
              </p>

              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--primary))] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))]"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
          <p>
            Need help? Please{" "}
            <Link
              href="/contact"
              className="font-medium text-[rgb(var(--primary))] hover:opacity-80"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
