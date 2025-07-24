"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

/**
 * A simpler, more reliable version of Link that uses direct navigation
 * to prevent "Failed to fetch" errors from crashing the application
 */
export function SafeLink({
  href,
  children,
  className = "",
  prefetch = false,
  onClick,
}: SafeLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default behavior
    e.preventDefault();

    // Call the provided onClick if it exists
    if (onClick) {
      onClick();
    }

    // Try using the router for client-side navigation
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation error with router:", error);

      // Fall back to window.location if router fails
      try {
        window.location.href = href;
      } catch (locationError) {
        console.error("Navigation error with location:", locationError);
      }
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
