// Type definitions for Google Maps Web Components
declare namespace JSX {
  interface IntrinsicElements {
    // Extended gmp-place-autocomplete Web Component
    "gmp-place-autocomplete": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        // Required properties
        "api-key": string;

        // Optional properties
        placeholder?: string;
        type?:
          | "default"
          | "geocode"
          | "address"
          | "establishment"
          | "regions"
          | "cities";
        fields?: string;
        "child-form"?: boolean;

        // Event handlers
        "ongmp-place-select"?: string;
        "ongmp-request-denied"?: string;
        "ongmp-place-changed"?: string;
      },
      HTMLElement
    >;

    // Extended gmp-map Web Component
    "gmp-map": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        // Required properties
        "api-key": string;

        // Optional properties
        center?: string | { lat: number; lng: number };
        zoom?: string | number;
        "map-id"?: string;
      },
      HTMLElement
    >;

    // Extended gmp-advanced-marker Web Component
    "gmp-advanced-marker": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        // Required properties
        "api-key": string;

        // Optional properties
        position?: string | { lat: number; lng: number };
        title?: string;
        map?: any;
      },
      HTMLElement
    >;
  }
}

// Type declarations for global window properties
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: any;
        marker?: { AdvancedMarkerElement?: any };
        Map?: any;
        LatLngBounds?: any;
        Marker?: any;
        InfoWindow?: any;
        Size?: any;
      };
    };
    handlePlaceSelect?: (event: any) => void;
    handleDirectPlaceSelect?: (event: any) => void;
  }
}
