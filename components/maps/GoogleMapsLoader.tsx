&quot;use client&quot;;

import React from &quot;react&quot;;
import { LoadScript } from &quot;@react-google-maps/api&quot;;

// List of libraries we need to load
const libraries = [&quot;places&quot;] as (&quot;places&quot; | &quot;drawing&quot; | &quot;geometry&quot;)[];

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that loads the Google Maps API script
 * This ensures it&apos;s only loaded once and properly managed
 */
export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  // The API key is hardcoded here for simplicity, but in a production environment
  // it should be stored in environment variables
  const apiKey = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={
        <div className=&quot;flex items-center justify-center w-full h-full min-h-[300px] bg-muted/20&quot;>
          <div className=&quot;animate-pulse text-center&quot;>
            <div className=&quot;h-6 w-24 bg-primary/20 rounded mb-2 mx-auto&quot;></div>
            <div className=&quot;h-4 w-32 bg-muted-foreground/20 rounded mx-auto&quot;></div>
          </div>
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}
