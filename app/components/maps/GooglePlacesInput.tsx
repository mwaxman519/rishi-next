&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { useGoogleMaps } from &quot;./GoogleMapsProvider&quot;;
import { LocationData } from &quot;./types&quot;;
import { Loader2 } from &quot;lucide-react&quot;;

interface GooglePlacesInputProps {
  onPlaceSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A completely redesigned approach to Google Places Autocomplete
 * This uses a visible React-managed input connected to the Google web component
 */
export function GooglePlacesInput({
  onPlaceSelected,
  placeholder = &quot;Search for a location&quot;,
  className = "&quot;,
}: GooglePlacesInputProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [logs, setLogs] = useState<string[]>([]);

  // Our input element reference (directly managed by React)
  const inputRef = useRef<HTMLInputElement>(null);
  // Web component container reference
  const wcContainerRef = useRef<HTMLDivElement>(null);

  // Log helper
  const addLog = (message: string) => {
    console.log(`[GooglePlaces] ${message}`);
    setLogs((prev) => [...prev, message]);
  };

  // Setup the Google Places autocomplete when the page loads
  useEffect(() => {
    // Only proceed if Google Maps is loaded and we have our elements
    if (!isLoaded || !inputRef.current || !wcContainerRef.current) {
      return;
    }

    addLog(&quot;Setting up Google Places autocomplete...&quot;);

    try {
      // Clear any existing content
      while (wcContainerRef.current.firstChild) {
        wcContainerRef.current.removeChild(wcContainerRef.current.firstChild);
      }

      // Create the web component with complete configuration
      const autocomplete = document.createElement(&quot;gmp-place-autocomplete&quot;);

      // Set the type to 'default' to allow all place types
      // @ts-ignore - TypeScript doesn&apos;t know about these properties
      autocomplete.type = &quot;default&quot;;

      // Add additional attributes that might help with functionality
      // @ts-ignore
      autocomplete.setAttribute(&quot;auto-complete&quot;, &quot;on&quot;);
      // @ts-ignore
      autocomplete.setAttribute(&quot;auto-focus&quot;, &quot;true&quot;);
      // @ts-ignore
      autocomplete.setAttribute(&quot;data-full-width&quot;, &quot;true&quot;);

      // Connect the web component to our React-managed input
      // @ts-ignore - the input property exists but TypeScript doesn&apos;t know about it
      autocomplete.input = inputRef.current;

      // Listen for place selection
      autocomplete.addEventListener(&quot;place-changed&quot;, (event: any) => {
        const place = event.detail?.place;

        if (!place) {
          addLog(&quot;No place data received&quot;);
          return;
        }

        addLog(`Selected place: ${place.displayName?.text || &quot;Unnamed place&quot;}`);

        // Create our standardized LocationData object
        const locationData: LocationData = {
          id: place.id || &quot;&quot;,
          formattedAddress: place.formattedAddress || &quot;&quot;,
          latitude: place.location?.latitude || 0,
          longitude: place.location?.longitude || 0,
          displayName: place.displayName?.text || &quot;&quot;,
          addressComponents:
            place.addressComponents?.map((c: any) => ({
              longText: c.longText || &quot;&quot;,
              shortText: c.shortText || &quot;&quot;,
              types: c.types || [],
            })) || [],
          types: place.types || [],
          businessStatus: place.businessStatus,
          plusCode: place.plusCode,
        };

        // Send the location data to the parent component
        onPlaceSelected(locationData);
      });

      // Hide the web component but keep it functional
      autocomplete.style.display = &quot;none&quot;;

      // Add to DOM
      wcContainerRef.current.appendChild(autocomplete);
      addLog(&quot;Autocomplete component initialized successfully&quot;);
    } catch (error) {
      addLog(
        `Error setting up Places autocomplete: ${(error as Error).message}`,
      );
      console.error(&quot;Google Places Autocomplete error:&quot;, error);
    }

    // Cleanup on unmount
    return () => {
      addLog(&quot;Cleaning up Places autocomplete&quot;);
      if (wcContainerRef.current) {
        while (wcContainerRef.current.firstChild) {
          wcContainerRef.current.removeChild(wcContainerRef.current.firstChild);
        }
      }
    };
  }, [isLoaded, onPlaceSelected]);

  return (
    <div className={`w-full ${className}`}>
      {/* VISIBLE SEARCH INPUT - Managed by React */}
      <div className=&quot;relative w-full&quot;>
        {isLoaded ? (
          <input
            ref={inputRef}
            type=&quot;text&quot;
            placeholder={placeholder}
            autoComplete=&quot;on&quot;
            className=&quot;w-full px-4 py-2 border-2 border-blue-700 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500&quot;
            style={{
              fontSize: &quot;16px&quot;,
              height: &quot;45px&quot;,
              width: &quot;100%&quot;,
            }}
            onFocus={(e) => {
              console.log(&quot;Input focused&quot;, e.target);
              // Force a click on the input to help activate the autocomplete
              setTimeout(() => e.target.click(), 100);
            }}
          />
        ) : (
          <div className=&quot;w-full flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-md bg-gray-50 text-gray-500&quot;>
            <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
            <span>Loading places search...</span>
          </div>
        )}

        {/* Hidden container for the web component */}
        <div ref={wcContainerRef} className=&quot;hidden&quot;></div>
      </div>

      {/* Error message */}
      {isError && (
        <p className=&quot;text-red-500 text-sm mt-1&quot;>
          Failed to load Google Maps. Please try again later.
        </p>
      )}

      {/* Debug logs (only in development) */}
      {process.env.NODE_ENV === &quot;development&quot; && logs.length > 0 && (
        <div className=&quot;mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32 text-xs font-mono">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
