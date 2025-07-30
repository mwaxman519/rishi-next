/**
 * Geocoding utility functions
 *
 * This module provides helper functions for geocoding addresses using the Google Maps API.
 * It includes functions for forward geocoding (address to coordinates) and normalizing addresses.
 */

import { LocationDTO } from &quot;@/types/locations&quot;;

// Types for geocoding responses
export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  address_components: AddressComponent[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

// Error class for geocoding errors
export class GeocodingError extends Error {
  status: string;

  constructor(message: string, status: string) {
    super(message);
    this.name = &quot;GeocodingError&quot;;
    this.status = status;
  }
}

/**
 * Geocode an address using the server-side API endpoint
 *
 * @param address The address to geocode
 * @returns Promise with geocoding result or null if not found
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  try {
    if (!address) {
      throw new GeocodingError(&quot;Address is required&quot;, &quot;INVALID_REQUEST&quot;);
    }

    // Use the server-side API endpoint to protect the API key
    const response = await fetch(
      `/api/maps/geocode?address=${encodeURIComponent(address)}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new GeocodingError(
        errorData.message || &quot;Failed to geocode address&quot;,
        errorData.status || &quot;SERVER_ERROR&quot;,
      );
    }

    const data: GeocodeResponse = await response.json();

    // Check for Google API status errors
    if (data.status !== &quot;OK&quot;) {
      throw new GeocodingError(
        `Geocoding API error: ${data.status}`,
        data.status,
      );
    }

    // No results found
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Return the first (most relevant) result
    return data.results[0] || null;
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }

    throw new GeocodingError(
      error instanceof Error ? error.message : &quot;Unknown geocoding error&quot;,
      &quot;UNKNOWN_ERROR&quot;,
    );

    // This code is unreachable but satisfies TypeScript return type
    return null;
  }
}

/**
 * Enhance a location with data from geocoding
 * This updates the address fields with standardized versions and adds coordinates
 *
 * @param location The location to enhance
 * @returns Promise with the enhanced location
 */
export async function enhanceLocationWithGeocoding<
  T extends Partial<LocationDTO>,
>(location: T): Promise<T> {
  try {
    // Create full address for geocoding
    const addressParts = [
      location.address1,
      location.address2,
      location.city,
      location.state?.abbreviation || "&quot;,
      location.zipcode,
    ].filter(Boolean);

    const fullAddress = addressParts.join(&quot;, &quot;);

    // Geocode the address and validate result
    const result = await geocodeAddress(fullAddress);

    if (!result) {
      console.error(&quot;Geocoding returned no results for address:&quot;, fullAddress);
      return location;
    }

    // Extract address components
    const updated = { ...location };

    // Update coordinates
    updated.latitude = result.geometry.location.lat;
    updated.longitude = result.geometry.location.lng;

    // Standardize the address from components
    if (result.address_components) {
      // Street number and route (address line 1)
      const streetNumber = findAddressComponent(
        result.address_components,
        &quot;street_number&quot;,
      )?.long_name;
      const route = findAddressComponent(
        result.address_components,
        &quot;route&quot;,
      )?.long_name;

      if (streetNumber && route) {
        updated.address1 = `${streetNumber} ${route}`;
      }

      // City
      const locality = findAddressComponent(
        result.address_components,
        &quot;locality&quot;,
      );
      if (locality) {
        updated.city = locality.long_name;
      }

      // State
      const administrativeArea = findAddressComponent(
        result.address_components,
        &quot;administrative_area_level_1&quot;,
      );
      if (administrativeArea && updated.state) {
        updated.state = {
          ...updated.state,
          abbreviation: administrativeArea.short_name,
          name: administrativeArea.long_name,
        };
      }

      // Postal code
      const postalCode = findAddressComponent(
        result.address_components,
        &quot;postal_code&quot;,
      );
      if (postalCode) {
        updated.zipcode = postalCode.long_name;
      }
    }

    return updated;
  } catch (error) {
    console.error(&quot;Error enhancing location with geocoding:", error);
    // Return original location without enhancements if geocoding fails
    return location;
  }
}

/**
 * Helper function to find a specific address component by type
 */
function findAddressComponent(
  components: AddressComponent[],
  type: string,
): AddressComponent | undefined {
  return components.find((component) => component.types.includes(type));
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 *
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function getDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Radius of the Earth in miles
  const R = 3958.8;

  // Convert latitude and longitude from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Helper function to convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter locations by proximity to a reference point
 *
 * @param locations Array of locations to filter
 * @param latitude Reference latitude
 * @param longitude Reference longitude
 * @param radius Maximum distance in miles
 * @returns Filtered array of locations with distance
 */
export function filterLocationsByProximity<T extends LocationDTO>(
  locations: T[],
  latitude: number,
  longitude: number,
  radius: number,
): (T & { distance: number })[] {
  return locations
    .filter((location) => location.latitude && location.longitude)
    .map((location) => {
      const distance = getDistanceInMiles(
        latitude,
        longitude,
        location.latitude!,
        location.longitude!,
      );

      return {
        ...location,
        distance,
      };
    })
    .filter((location) => location.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
