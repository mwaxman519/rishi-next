&quot;use client&quot;;

import { useState, useEffect, useContext } from &quot;react&quot;;
import { GoogleMapsContext } from &quot;../components/maps/GoogleMapsContext&quot;;

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

export function useGoogleMaps(): UseGoogleMapsReturn {
  const context = useContext(GoogleMapsContext);

  if (context === undefined) {
    throw new Error(&quot;useGoogleMaps must be used within a GoogleMapsProvider&quot;);
  }

  return {
    isLoaded: context.isLoaded,
    loadError: context.loadError,
  };
}
