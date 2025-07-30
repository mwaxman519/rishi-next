&quot;use client&quot;;

import { ReactNode } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

/**
 * A simpler, more reliable version of Link that uses direct navigation
 * to prevent &quot;Failed to fetch&quot; errors from crashing the application
 */
export function SafeLink({
  href,
  children,
  className = "&quot;,
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
      console.error(&quot;Navigation error with router:&quot;, error);

      // Fall back to window.location if router fails
      try {
        window.location.href = href;
      } catch (locationError) {
        console.error(&quot;Navigation error with location:", locationError);
      }
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
