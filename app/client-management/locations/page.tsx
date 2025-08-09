"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Building, Search } from "lucide-react";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import ClientLocationsList from "@/components/locations/ClientLocationsList";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define interface for brand data
interface Brand {
  id: string;
  name: string;
  clientId: string;
  primaryColor?: string;
  secondaryColor?: string;
  active: boolean;
}

export default function ClientLocationsPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Fetch brand list (for client user who may have multiple brands)
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) {
        throw new Error("Failed to fetch brands");
      }
      return res.json();
    },
  });

  const brands = brandsData?.brands || [];

  // Handle brand selection
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Brand Locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Manage Your Brand Locations
          </CardTitle>
          <CardDescription>
            Activate and manage locations for your brands to make them available
            in booking portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brandsLoading ? (
            <div className="py-8 text-center">
              <div className="animate-pulse h-16 w-64 bg-muted rounded-md mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading brand information...
              </p>
            </div>
          ) : brandsError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load brands. Please try again later.
              </AlertDescription>
            </Alert>
          ) : brands.length === 0 ? (
            <div className="py-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No brands available</h3>
              <p className="text-muted-foreground max-w-md mx-auto>
                You don't have any brands configured. Please contact your
                administrator.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Select a Brand
                </label>
                <Select
                  onValueChange={handleBrandChange}
                  defaultValue={brands[0]?.id}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand: Brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-6" />

              {selectedBrandId || brands[0]?.id ? (
                <GoogleMapsProvider>
                  <ClientLocationsList
                    brandId={selectedBrandId || brands[0]?.id}
                  />
                </GoogleMapsProvider>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground>
                    Please select a brand to manage locations
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
