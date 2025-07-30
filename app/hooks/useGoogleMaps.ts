&quot;use client&quot;;

import { useContext } from &quot;react&quot;;
import { GoogleMapsContext } from &quot;../components/maps/GoogleMapsContext&quot;;

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);

  if (context === undefined) {
    throw new Error(&quot;useGoogleMaps must be used within a GoogleMapsProvider&quot;);
  }

  return context;
}
