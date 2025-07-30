&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { AlertCircle, Building, Search } from &quot;lucide-react&quot;;
import { GoogleMapsProvider } from &quot;@/contexts/GoogleMapsContext&quot;;
import ClientLocationsList from &quot;@/components/locations/ClientLocationsList&quot;;
import { Alert, AlertDescription } from &quot;@/components/ui/alert&quot;;

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
    queryKey: [&quot;brands&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/brands&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch brands&quot;);
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
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Brand Locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className=&quot;flex items-center&quot;>
            <Building className=&quot;mr-2 h-5 w-5&quot; />
            Manage Your Brand Locations
          </CardTitle>
          <CardDescription>
            Activate and manage locations for your brands to make them available
            in booking portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brandsLoading ? (
            <div className=&quot;py-8 text-center&quot;>
              <div className=&quot;animate-pulse h-16 w-64 bg-muted rounded-md mx-auto mb-4&quot;></div>
              <p className=&quot;text-muted-foreground&quot;>
                Loading brand information...
              </p>
            </div>
          ) : brandsError ? (
            <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
              <AlertCircle className=&quot;h-4 w-4&quot; />
              <AlertDescription>
                Failed to load brands. Please try again later.
              </AlertDescription>
            </Alert>
          ) : brands.length === 0 ? (
            <div className=&quot;py-8 text-center&quot;>
              <Building className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-medium mb-2&quot;>No brands available</h3>
              <p className=&quot;text-muted-foreground max-w-md mx-auto&quot;>
                You don&apos;t have any brands configured. Please contact your
                administrator.
              </p>
            </div>
          ) : (
            <>
              <div className=&quot;mb-8&quot;>
                <label className=&quot;block text-sm font-medium mb-2&quot;>
                  Select a Brand
                </label>
                <Select
                  onValueChange={handleBrandChange}
                  defaultValue={brands[0]?.id}
                >
                  <SelectTrigger className=&quot;w-full md:w-[300px]&quot;>
                    <SelectValue placeholder=&quot;Select a brand&quot; />
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

              <Separator className=&quot;my-6&quot; />

              {selectedBrandId || brands[0]?.id ? (
                <GoogleMapsProvider>
                  <ClientLocationsList
                    brandId={selectedBrandId || brands[0]?.id}
                  />
                </GoogleMapsProvider>
              ) : (
                <div className=&quot;py-6 text-center&quot;>
                  <p className=&quot;text-muted-foreground&quot;>
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
