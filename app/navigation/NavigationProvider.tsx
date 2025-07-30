&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import { initializeNavigation } from &quot;./NavigationItems&quot;;
import {
  superAdminNavigation,
  fieldManagerNavigation,
} from &quot;@shared/navigation-structure&quot;;

interface NavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Navigation Provider Component
 * This component initializes the navigation structure when the app loads
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize navigation structure on client-side only
    if (!initialized) {
      try {
        console.log(&quot;Initializing navigation structure...&quot;);
        initializeNavigation();
        console.log(
          &quot;Navigation initialized successfully:&quot;,
          &quot;Super Admin Navigation Items:&quot;,
          superAdminNavigation.length,
          &quot;Field Manager Navigation Items:&quot;,
          fieldManagerNavigation.length,
        );

        // Inspect some items for debugging
        if (superAdminNavigation && superAdminNavigation.length > 0) {
          console.log(
            &quot;First Super Admin item:&quot;,
            superAdminNavigation[0]?.label || &quot;No label&quot;,
          );
        }
        if (fieldManagerNavigation && fieldManagerNavigation.length > 0) {
          console.log(
            &quot;First Field Manager item:&quot;,
            fieldManagerNavigation[0]?.label || &quot;No label&quot;,
          );
        }
      } catch (error) {
        console.error(&quot;Error initializing navigation:&quot;, error);
      }
      setInitialized(true);
    }
  }, [initialized]);

  return <>{children}</>;
}
