import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;

export default function UnauthorizedPage() {
  return (
    <div className=&quot;flex flex-col items-center justify-center min-h-screen py-12 bg-[rgb(var(--background))] px-4 sm:px-6 lg:px-8&quot;>
      <div className=&quot;max-w-md w-full space-y-8&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;flex justify-center mb-4&quot;>
            <div className=&quot;relative w-16 h-16&quot;>
              <Image
                src=&quot;/assets/logos/rishi-logo-teal.png&quot;
                alt=&quot;Rishi Logo&quot;
                width={64}
                height={64}
                className=&quot;object-contain w-auto h-auto&quot;
                style={{ objectFit: &quot;contain&quot; }}
                priority
              />
            </div>
          </div>
          <h1 className=&quot;block text-2xl font-bold text-[rgb(var(--foreground))] mt-6 sm:text-3xl&quot;>
            Access Denied
          </h1>
          <p className=&quot;mt-2 text-[rgb(var(--muted-foreground))]&quot;>
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className=&quot;mt-8 space-y-6&quot;>
          <div className=&quot;bg-[rgb(var(--card))] py-8 px-4 shadow border border-[rgb(var(--border))] sm:rounded-lg sm:px-10&quot;>
            <div className=&quot;flex flex-col items-center&quot;>
              <svg
                className=&quot;h-16 w-16 text-red-500&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
                viewBox=&quot;0 0 24 24&quot;
                fill=&quot;none&quot;
                stroke=&quot;currentColor&quot;
                strokeWidth=&quot;2&quot;
                strokeLinecap=&quot;round&quot;
                strokeLinejoin=&quot;round&quot;
              >
                <circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot; />
                <line x1=&quot;15&quot; y1=&quot;9&quot; x2=&quot;9&quot; y2=&quot;15&quot; />
                <line x1=&quot;9&quot; y1=&quot;9&quot; x2=&quot;15&quot; y2=&quot;15&quot; />
              </svg>

              <p className=&quot;text-center mt-5 text-sm text-[rgb(var(--muted-foreground))]&quot;>
                Your account doesn&apos;t have the required permissions to view this
                page. If you believe this is an error, please contact your
                administrator.
              </p>

              <div className=&quot;mt-6&quot;>
                <Link
                  href=&quot;/&quot;
                  className=&quot;inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(var(--primary))] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))]&quot;
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className=&quot;mt-6 text-center text-sm text-[rgb(var(--muted-foreground))]&quot;>
          <p>
            Need help? Please{&quot; &quot;}
            <Link
              href=&quot;/contact&quot;
              className=&quot;font-medium text-[rgb(var(--primary))] hover:opacity-80&quot;
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
