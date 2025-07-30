/**
 * Geocoding Service for address validation and coordinate conversion
 * Uses Google Maps API for geocoding operations
 */

// Address component from Google Maps API
interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

// Extended geocoding result with all needed location data
interface GeocodingResult {
  results: Array<{
    id: string;
    displayName: string;
    formattedAddress: string;
    addressComponents: AddressComponent[];
    types: string[];
    geometry: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
  }>;
}

// Simple result for basic geocoding operations
interface SimpleGeocodingResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
  placeId?: string;
}

interface GeocodingError {
  message: string;
  code: string;
}

export class GeocodingService {
  private apiKey: string;

  constructor() {
    // Get API key from environment
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "&quot;;

    if (!this.apiKey) {
      console.warn(
        &quot;No Google Maps API key found. Geocoding features will be unavailable.&quot;,
      );
    }
  }

  /**
   * Geocode an address to get coordinates and detailed location information
   * @param address Full address to geocode
   * @returns Promise resolving to detailed location data or null if geocoding failed
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error(&quot;Google Maps API key is not configured&quot;);
    }

    try {
      // Encode address for URL
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== &quot;OK&quot;) {
        console.error(&quot;Geocoding error:&quot;, data.status, data.error_message);
        return null;
      }

      if (!data.results || data.results.length === 0) {
        return null;
      }

      // Transform the results into our expected format
      const transformedResults = data.results.map((result: any) => {
        // Transform address components
        const addressComponents =
          result.address_components?.map((component: any) => ({
            longText: component.long_name,
            shortText: component.short_name,
            types: component.types || [],
          })) || [];

        return {
          id: result.place_id || &quot;&quot;,
          displayName: this.extractLocationName(result),
          formattedAddress: result.formatted_address || &quot;&quot;,
          addressComponents,
          types: result.types || [],
          geometry: {
            location: {
              latitude: result.geometry?.location?.lat || 0,
              longitude: result.geometry?.location?.lng || 0,
            },
          },
        };
      });

      return { results: transformedResults };
    } catch (error) {
      console.error(&quot;Error calling Google Maps Geocoding API:&quot;, error);
      return null;
    }
  }

  /**
   * Extract a meaningful display name from geocoding result
   * @param result The geocoding result to extract a name from
   * @returns A display name for the location
   */
  private extractLocationName(result: any): string {
    // Try to find the most specific name component
    // First check if there&apos;s a point of interest or establishment type
    if (
      result.types &&
      (result.types.includes(&quot;point_of_interest&quot;) ||
        result.types.includes(&quot;establishment&quot;))
    ) {
      // Try to find a component that might be a business name
      const premiseComponent = result.address_components?.find(
        (c: any) =>
          c.types.includes(&quot;premise&quot;) || c.types.includes(&quot;point_of_interest&quot;),
      );

      if (premiseComponent) {
        return premiseComponent.long_name;
      }
    }

    // If no business name found, use the first line of the formatted address
    if (result.formatted_address) {
      const firstLine = result.formatted_address.split(&quot;,&quot;)[0];
      return firstLine;
    }

    // Fallback to street address if available
    const streetComponent = result.address_components?.find((c: any) =>
      c.types.includes(&quot;route&quot;),
    );

    const streetNumber = result.address_components?.find((c: any) =>
      c.types.includes(&quot;street_number&quot;),
    );

    if (streetComponent && streetNumber) {
      return `${streetNumber.long_name} ${streetComponent.long_name}`;
    } else if (streetComponent) {
      return streetComponent.long_name;
    }

    // Last resort
    return &quot;Unnamed Location&quot;;
  }

  /**
   * Reverse geocode coordinates to get detailed address information
   * @param lat Latitude
   * @param lng Longitude
   * @returns Promise resolving to detailed location data or null if reverse geocoding failed
   */
  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error(&quot;Google Maps API key is not configured&quot;);
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== &quot;OK&quot;) {
        console.error(
          &quot;Reverse geocoding error:&quot;,
          data.status,
          data.error_message,
        );
        return null;
      }

      if (!data.results || data.results.length === 0) {
        return null;
      }

      // Transform the results into our expected format
      const transformedResults = data.results.map((result: any) => {
        // Transform address components
        const addressComponents =
          result.address_components?.map((component: any) => ({
            longText: component.long_name,
            shortText: component.short_name,
            types: component.types || [],
          })) || [];

        return {
          id: result.place_id || &quot;&quot;,
          displayName: this.extractLocationName(result),
          formattedAddress: result.formatted_address || &quot;&quot;,
          addressComponents,
          types: result.types || [],
          geometry: {
            location: {
              latitude: result.geometry?.location?.lat || lat,
              longitude: result.geometry?.location?.lng || lng,
            },
          },
        };
      });

      return { results: transformedResults };
    } catch (error) {
      console.error(&quot;Error calling Google Maps Reverse Geocoding API:&quot;, error);
      return null;
    }
  }

  /**
   * Validate an address using Google's geocoding API
   * @param address Address to validate
   * @returns True if address could be geocoded, false otherwise
   */
  async validateAddress(address: string): Promise<boolean> {
    const result = await this.geocodeAddress(address);
    return result !== null && result.results && result.results.length > 0;
  }

  /**
   * Get a standardized address from raw input
   * @param address Raw address input
   * @returns Formatted address according to postal standards
   */
  async getFormattedAddress(address: string): Promise<string | null> {
    const result = await this.geocodeAddress(address);

    if (!result || !result.results || result.results.length === 0) {
      return null;
    }

    const firstResult = result.results[0];
    return firstResult?.formattedAddress || null;
  }

  /**
   * Get simple geocoding result (backward compatibility)
   * @param address Address to geocode
   * @returns Simple result with lat/lng
   */
  async getSimpleGeocodingResult(
    address: string,
  ): Promise<SimpleGeocodingResult | null> {
    const result = await this.geocodeAddress(address);

    if (!result || !result.results || result.results.length === 0) {
      return null;
    }

    const firstResult = result.results[0];

    if (!firstResult) {
      return null;
    }

    return {
      lat: firstResult.geometry?.location?.latitude || 0,
      lng: firstResult.geometry?.location?.longitude || 0,
      formattedAddress: firstResult.formattedAddress || &quot;&quot;,
      placeId: firstResult.id || &quot;",
    };
  }
}

// Export a singleton instance
export const geocodingService = new GeocodingService();
