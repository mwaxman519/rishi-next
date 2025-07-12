"use client";

import React from "react";
import { GoogleMapsProvider } from "@/app/components/maps/GoogleMapsProvider";
import { NewLocationPicker } from "@/app/components/maps/NewLocationPicker";
import { LocationData } from "@/app/components/maps/types";

/**
 * Props for the ModernSearchPicker component
 *
 * This maintains a similar interface to the legacy SimpleSearchPicker for easier migration
 */
interface ModernSearchPickerProps {
  onAddressSelect: (data: LegacyAddressData) => void;
  className?: string;
}

/**
 * Legacy AddressData interface to maintain backward compatibility
 */
interface LegacyAddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name: string | undefined;
  types: string[] | undefined;
}

/**
 * ModernSearchPicker is a drop-in replacement for SimpleSearchPicker
 * using the new Google Maps Places Web Component
 *
 * This component provides a compatibility layer for existing code while
 * using the new recommended implementation under the hood.
 */
export default function ModernSearchPicker({
  onAddressSelect,
  className = "",
}: ModernSearchPickerProps) {
  // Bridge between the new LocationData format and the legacy AddressData format
  const handleLocationSelect = (location: LocationData) => {
    // Convert the new format to the legacy format
    const legacyAddress: LegacyAddressData = {
      formatted_address: location.formattedAddress,
      // Map the new addressComponents to the legacy format
      address_components: location.addressComponents.map((comp) => ({
        long_name: comp.longText,
        short_name: comp.shortText,
        types: comp.types,
      })),
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.id,
      name: location.displayName,
      types: location.types,
    };

    onAddressSelect(legacyAddress);
  };

  return (
    <GoogleMapsProvider>
      <NewLocationPicker
        onLocationSelect={handleLocationSelect}
        className={className}
      />
    </GoogleMapsProvider>
  );
}
