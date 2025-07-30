"use client";

import React from "react";
import { LocationPicker } from "@/components/maps/LocationPicker";

/**
 * AddressData represents a location selected by the user
 */
interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name: string | undefined;
  types: string[] | undefined;
}

/**
 * Props for the SimpleSearchPicker component
 */
interface Props {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

/**
 * SimpleSearchPicker has been rewritten to use the new React-friendly
 * Google Maps implementation to prevent DOM node conflicts
 */
export default function SimpleSearchPicker({
  onAddressSelect,
  className = "",
}: Props) {
  return (
    <LocationPicker onLocationSelect={onAddressSelect} className={className} />
  );
}
