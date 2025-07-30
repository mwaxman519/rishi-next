&quot;use client&quot;;

import { useState, useCallback, useEffect, useRef } from &quot;react&quot;;
import { useGoogleMaps } from &quot;../contexts/GoogleMapsContext&quot;;

interface PlacesAutocompleteOptions {
  componentRestrictions?: { country: string | string[] };
  types?: string[];
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
}

interface PlacesAutocompleteResult {
  predictions: google.maps.places.AutocompletePrediction[];
  loading: boolean;
  error: Error | null;
  getPlacePredictions: (
    input: string,
  ) => Promise<google.maps.places.AutocompletePrediction[]>;
  getPlaceDetails: (
    placeId: string,
  ) => Promise<google.maps.places.PlaceResult | null>;
}

export function usePlacesAutocomplete(
  options: PlacesAutocompleteOptions = {},
): PlacesAutocompleteResult {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize services when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !google) return;

    try {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();

      // Create a dummy element for PlacesService
      const dummyElement = document.createElement(&quot;div&quot;);
      placesService.current = new google.maps.places.PlacesService(
        dummyElement,
      );
    } catch (err) {
      console.error(&quot;Error initializing Places services:&quot;, err);
      setError(
        err instanceof Error
          ? err
          : new Error(&quot;Failed to initialize Google Places services&quot;),
      );
    }
  }, [isLoaded, google]);

  // Get place predictions with Promise-based API
  const getPlacePredictions = useCallback(
    async (
      input: string,
    ): Promise<google.maps.places.AutocompletePrediction[]> => {
      if (!input.trim() || !autocompleteService.current || !google) {
        setPredictions([]);
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        // Create a promise wrapper around the callback-based API
        const results = await new Promise<
          google.maps.places.AutocompletePrediction[]
        >((resolve, reject) => {
          const request = {
            input,
            ...options,
          };

          autocompleteService.current!.getPlacePredictions(
            request,
            (predictions, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.warn(&quot;Places API returned status:&quot;, status);
                reject(new Error(`Places API returned status: ${status}`));
                return;
              }

              if (!predictions || predictions.length === 0) {
                resolve([]);
                return;
              }

              resolve(predictions);
            },
          );
        });

        setPredictions(results);
        return results;
      } catch (err) {
        console.error(&quot;Error fetching place predictions:&quot;, err);
        setError(
          err instanceof Error ? err : new Error(&quot;Failed to fetch predictions&quot;),
        );
        setPredictions([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [google, options],
  );

  // Get place details with Promise-based API
  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
      if (!placeId.trim() || !placesService.current || !google) {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a promise wrapper around the callback-based API
        return await new Promise<google.maps.places.PlaceResult | null>(
          (resolve, reject) => {
            const request = {
              placeId,
              fields: [
                &quot;address_components&quot;,
                &quot;formatted_address&quot;,
                &quot;geometry&quot;,
                &quot;name&quot;,
                &quot;place_id&quot;,
              ],
            };

            placesService.current!.getDetails(request, (result, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.warn(&quot;Places Details API returned status:&quot;, status);
                reject(
                  new Error(`Places Details API returned status: ${status}`),
                );
                return;
              }

              if (!result) {
                resolve(null);
                return;
              }

              resolve(result);
            });
          },
        );
      } catch (err) {
        console.error(&quot;Error fetching place details:&quot;, err);
        setError(
          err instanceof Error
            ? err
            : new Error(&quot;Failed to fetch place details&quot;),
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [google],
  );

  return {
    predictions,
    loading,
    error,
    getPlacePredictions,
    getPlaceDetails,
  };
}
