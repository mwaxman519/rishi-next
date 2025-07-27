// Google Maps TypeScript type definitions
interface Window {
  google?: {
    maps?: {
      places?: any;
      marker?: {
        AdvancedMarkerElement?: any;
      };
      Map?: any;
      LatLngBounds?: any;
      Marker?: any;
      InfoWindow?: any;
      Size?: any;
    };
  };
  initGoogleMaps?: () => void;
  MarkerClusterer?: any;
}
