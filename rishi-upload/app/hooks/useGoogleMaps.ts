"use client";

import { useContext } from "react";
import { GoogleMapsContext } from "../components/maps/GoogleMapsContext";

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);

  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }

  return context;
}
