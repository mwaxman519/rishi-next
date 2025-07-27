// Google Maps Web Components - TypeScript Declarations

// Add window global property
interface Window {
  google?: {
    maps?: {
      places?: any;
    };
  };
  googleMapsLoaded?: () => void;
}

declare namespace JSX {
  interface IntrinsicElements {
    "gmp-place-autocomplete": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        type?:
          | "default"
          | "geocode"
          | "address"
          | "establishment"
          | "regions"
          | "cities";
        input?: HTMLInputElement;
        "child-form"?: boolean;
        "request-denied"?: (event: CustomEvent) => void;
        "place-changed"?: (
          event: CustomEvent<{
            place: google.maps.places.Place;
          }>,
        ) => void;
      },
      HTMLElement
    >;
    "gmp-map": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        center?: { lat: number; lng: number };
        zoom?: number;
        mapId?: string;
      },
      HTMLElement
    >;
    "gmp-advanced-marker": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        position?: { lat: number; lng: number };
        title?: string;
        map?: any;
      },
      HTMLElement
    >;
  }
}

declare namespace google.maps.places {
  class PlaceAutocompleteElement extends HTMLElement {
    type:
      | "default"
      | "geocode"
      | "address"
      | "establishment"
      | "regions"
      | "cities";
    input: HTMLInputElement | null;
    getPlace(): Place;
  }

  interface Place {
    id: string;
    displayName: {
      text: string;
      languageCode: string;
    };
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
    addressComponents?: {
      longText: string;
      shortText: string;
      types: string[];
    }[];
    plusCode?: {
      globalCode: string;
      compoundCode?: string;
    };
    types: string[];
    businessStatus?: string;
  }
}
