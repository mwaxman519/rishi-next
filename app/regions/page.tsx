&quot;use client&quot;;

import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Map, MapPin, Globe, BarChart, Search } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function RegionsPage() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Region Management</h1>
      </div>

      <Tabs defaultValue=&quot;map-view&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;map-view&quot;>Map View</TabsTrigger>
          <TabsTrigger value=&quot;states&quot;>States</TabsTrigger>
          <TabsTrigger value=&quot;custom-regions&quot;>Custom Regions</TabsTrigger>
          <TabsTrigger value=&quot;coverage&quot;>Coverage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;map-view&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Interactive map of all service regions.
          </p>

          <Card>
            <CardContent className=&quot;p-6&quot;>
              <div className=&quot;h-[500px] flex items-center justify-center border rounded-md bg-slate-50&quot;>
                <div className=&quot;text-center&quot;>
                  <Map className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
                  <h3 className=&quot;text-lg font-medium&quot;>Interactive Map</h3>
                  <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                    The interactive map will display all service regions with
                    filtering options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;states&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            State-level region configuration.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* State Region Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <MapPin className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    California
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Active
                  </span>
                </div>
                <CardDescription>State-wide coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Clients:</span>
                    <span className=&quot;font-medium&quot;>3</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Staff:</span>
                    <span className=&quot;font-medium&quot;>25</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Events (YTD):</span>
                    <span className=&quot;font-medium&quot;>48</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/regions/states/ca&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Manage Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another State Region Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <MapPin className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    Texas
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Active
                  </span>
                </div>
                <CardDescription>State-wide coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Clients:</span>
                    <span className=&quot;font-medium&quot;>2</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Staff:</span>
                    <span className=&quot;font-medium&quot;>18</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Events (YTD):</span>
                    <span className=&quot;font-medium&quot;>32</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/regions/states/tx&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Manage Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add State Region Card */}
            <Card className=&quot;border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center text-primary&quot;>
                  <MapPin className=&quot;mr-2 h-5 w-5&quot; />
                  Add State Region
                </CardTitle>
                <CardDescription>Configure a new state region</CardDescription>
              </CardHeader>
              <CardContent className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Link
                  href=&quot;/regions/states/new&quot;
                  className=&quot;h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors&quot;
                >
                  <span className=&quot;text-2xl font-semibold&quot;>+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;custom-regions&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Client-specific custom service regions.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* Custom Region Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <Globe className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    Bay Area Metro
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Active
                  </span>
                </div>
                <CardDescription>Acme Corporation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Coverage:</span>
                    <span className=&quot;font-medium&quot;>15 ZIP codes</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Staff:</span>
                    <span className=&quot;font-medium&quot;>12</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Kits Available:
                    </span>
                    <span className=&quot;font-medium&quot;>8</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/regions/custom/1&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Edit Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Custom Region Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <Globe className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    Greater Chicago
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Active
                  </span>
                </div>
                <CardDescription>Globex Industries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Coverage:</span>
                    <span className=&quot;font-medium&quot;>22 ZIP codes</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Staff:</span>
                    <span className=&quot;font-medium&quot;>9</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Kits Available:
                    </span>
                    <span className=&quot;font-medium&quot;>6</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/regions/custom/2&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Edit Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add Custom Region Card */}
            <Card className=&quot;border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center text-primary&quot;>
                  <Globe className=&quot;mr-2 h-5 w-5&quot; />
                  Add Custom Region
                </CardTitle>
                <CardDescription>Create a new custom region</CardDescription>
              </CardHeader>
              <CardContent className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Link
                  href=&quot;/regions/custom/new&quot;
                  className=&quot;h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors&quot;
                >
                  <span className=&quot;text-2xl font-semibold&quot;>+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;coverage&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Analysis of coverage, gaps, and overlaps in service regions.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <BarChart className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Coverage Analysis</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will provide analytics on regional coverage,
                identifying gaps and overlaps.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
