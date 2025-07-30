"use client";

import { useState, useEffect, useContext } from "react";
import { GoogleMapsContext } from "../components/maps/GoogleMapsContext";

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

export function useGoogleMaps(): UseGoogleMapsReturn {
  const context = useContext(GoogleMapsContext);

  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }

  return {
    isLoaded: context.isLoaded,
    loadError: context.loadError,
  };
}
