/**
 * Address component from Google Places API
 */
export interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

/**
 * Location data structure derived from Google Places API
 */
export interface LocationData {
  id: string;
  displayName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressComponents: AddressComponent[];
  types: string[];
  businessStatus: string | null;
  plusCode: any | null;
}

/**
 * Google Maps JavaScript API loading status
 */
export interface GoogleMapsContext {
  isLoaded: boolean;
  isError: boolean;
  errorMessage?: string;
}
