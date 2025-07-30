&quot;use client&quot;;

import React, { useRef, useEffect, useState, useId } from &quot;react&quot;;
import { useGoogleMaps } from &quot;./GoogleMapsProvider&quot;;
import { LocationData } from &quot;./types&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;

interface PlaceAutocompleteFieldProps {
  onPlaceSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?:
    | &quot;default&quot;
    | &quot;geocode&quot;
    | &quot;address&quot;
    | &quot;establishment&quot;
    | &quot;regions&quot;
    | &quot;cities&quot;;
}

/**
 * PlaceAutocompleteField component using Google's new Web Component approach
 *
 * This component wraps the `gmp-place-autocomplete` Web Component in a React-friendly way,
 * using the new Google Maps API as of March 2025.
 */
export function PlaceAutocompleteField({
  onPlaceSelected,
  placeholder = &quot;Search for a location&quot;,
  className = "&quot;,
  disabled = false,
  type = &quot;default&quot;,
}: PlaceAutocompleteFieldProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const autocompleteRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState(&quot;&quot;);
  const inputId = useId(); // Generate unique ID for input association

  // Debug console
  const debugConsole = {
    log: (...args: any[]) => console.log(&quot;[PlaceAutocompleteField]&quot;, ...args),
    error: (...args: any[]) =>
      console.error(&quot;[PlaceAutocompleteField]&quot;, ...args),
    warn: (...args: any[]) => console.warn(&quot;[PlaceAutocompleteField]&quot;, ...args),
  };

  // Setup autocomplete once Google Maps is loaded
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === &quot;undefined&quot;) return;

    if (!isLoaded || !inputRef.current) {
      debugConsole.log(
        &quot;Waiting for Maps API to load or input to be available...&quot;,
      );
      return;
    }

    debugConsole.log(&quot;Maps API loaded, initializing autocomplete...&quot;);
    let handlePlaceChanged: ((event: any) => void) | null = null;

    // Create the autocomplete web component if it doesn&apos;t exist
    if (!autocompleteRef.current) {
      try {
        // Check if the required APIs are available
        if (!window.google?.maps) {
          debugConsole.error(&quot;Google Maps API not loaded properly&quot;);
          throw new Error(&quot;Google Maps API not loaded&quot;);
        }

        debugConsole.log(&quot;Creating web component...&quot;);

        // Create the autocomplete element with a specific ID based on the React useId
        const autocompleteId = `place-autocomplete-${inputId}`;

        // Create the element - make sure to use the correct element name
        const autocomplete = document.createElement(&quot;gmp-place-autocomplete&quot;);
        autocomplete.id = autocompleteId;

        // Set properties
        // @ts-ignore - Web Component properties
        autocomplete.type = type;

        debugConsole.log(&quot;Connecting input to web component...&quot;);

        // Connect to input - this is the most critical part
        // @ts-ignore - Web Component properties
        autocomplete.input = inputRef.current;

        // Set additional attributes for debugging
        autocomplete.setAttribute(
          &quot;data-input-id&quot;,
          inputRef.current.id || &quot;unknown-input&quot;,
        );

        // Add event listener for place selection
        handlePlaceChanged = (event: any) => {
          debugConsole.log(&quot;Place changed event received&quot;, event);

          try {
            const place = event.detail?.place;
            if (!place) {
              debugConsole.warn(&quot;No place data in event&quot;);
              return;
            }

            debugConsole.log(&quot;Place selected:&quot;, place);

            // Map the Google Place object to our LocationData format
            const locationData: LocationData = {
              id: place.id,
              formattedAddress: place.formattedAddress,
              latitude: place.location?.latitude,
              longitude: place.location?.longitude,
              displayName: place.displayName?.text,
              addressComponents: place.addressComponents || [],
              types: place.types || [],
              businessStatus: place.businessStatus,
              plusCode: place.plusCode,
            };

            // Update the input value to the display name
            setInputValue(
              locationData.displayName || locationData.formattedAddress,
            );

            // Notify parent component
            onPlaceSelected(locationData);
          } catch (error) {
            debugConsole.error(&quot;Error handling place selection:&quot;, error);
          }
        };

        // Event listener registration
        debugConsole.log(&quot;Adding place-changed event listener&quot;);
        autocomplete.addEventListener(&quot;place-changed&quot;, handlePlaceChanged);

        // Handle request denied event
        autocomplete.addEventListener(&quot;request-denied&quot;, (e: any) => {
          debugConsole.error(&quot;Place request denied:&quot;, e);
        });

        // Hide the web component - it should not be visible in the UI
        // It only needs to exist in the DOM to connect to our input
        autocomplete.style.display = &quot;none&quot;;

        document.body.appendChild(autocomplete);

        debugConsole.log(`Web component created with ID: ${autocompleteId}`);

        // Store the reference
        autocompleteRef.current = autocomplete;
      } catch (error) {
        debugConsole.error(&quot;Error creating web component:&quot;, error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (autocompleteRef.current) {
        try {
          debugConsole.log(&quot;Cleaning up web component...&quot;);

          // Remove event listeners
          if (handlePlaceChanged) {
            autocompleteRef.current.removeEventListener(
              &quot;place-changed&quot;,
              handlePlaceChanged,
            );
          }

          // Remove from DOM
          document.body.removeChild(autocompleteRef.current);
          debugConsole.log(&quot;Web component removed&quot;);
        } catch (error) {
          debugConsole.error(&quot;Error removing web component:&quot;, error);
        }
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onPlaceSelected, type, inputId]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Clear input
  const clearInput = () => {
    setInputValue(&quot;&quot;);
    if (inputRef.current) {
      inputRef.current.value = &quot;&quot;;
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className=&quot;relative&quot;>
        {/* Search icon */}
        <div className=&quot;pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3&quot;>
          <svg
            xmlns=&quot;http://www.w3.org/2000/svg&quot;
            className=&quot;h-4 w-4 text-muted-foreground&quot;
            viewBox=&quot;0 0 24 24&quot;
            fill=&quot;none&quot;
            stroke=&quot;currentColor&quot;
            strokeWidth=&quot;2&quot;
            strokeLinecap=&quot;round&quot;
            strokeLinejoin=&quot;round&quot;
          >
            <circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle>
            <path d=&quot;m21 21-4.3-4.3&quot;></path>
          </svg>
        </div>

        {/* Input field */}
        <Input
          ref={inputRef}
          id={`place-input-${inputId}`}
          type=&quot;text&quot;
          className=&quot;pl-10 pr-10 h-12 focus-visible:ring-2 focus-visible:ring-ring&quot;
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled || !isLoaded || isError}
          aria-label=&quot;Search for a location&quot;
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type=&quot;button&quot;
            onClick={clearInput}
            className=&quot;absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring&quot;
            disabled={disabled}
          >
            <svg
              xmlns=&quot;http://www.w3.org/2000/svg&quot;
              className=&quot;h-4 w-4&quot;
              viewBox=&quot;0 0 24 24&quot;
              fill=&quot;none&quot;
              stroke=&quot;currentColor&quot;
              strokeWidth=&quot;2&quot;
              strokeLinecap=&quot;round&quot;
              strokeLinejoin=&quot;round&quot;
            >
              <path d=&quot;M18 6 6 18&quot;></path>
              <path d=&quot;m6 6 12 12&quot;></path>
            </svg>
            <span className=&quot;sr-only&quot;>Clear search</span>
          </button>
        )}

        {/* Loading indicator */}
        {!isLoaded && (
          <div className=&quot;absolute right-10 top-1/2 transform -translate-y-1/2&quot;>
            <Loader2 className=&quot;h-4 w-4 animate-spin text-primary&quot; />
          </div>
        )}
      </div>

      {/* Error message */}
      {isError && (
        <div className=&quot;mt-2 text-sm text-destructive">
          Failed to load Google Maps API. Please try again later.
        </div>
      )}
    </div>
  );
}
