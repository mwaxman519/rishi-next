&quot;use client&quot;;

import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Building,
  Users,
  MapPin,
  CreditCard,
  Layers,
  Store,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function ClientsPage() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Client Management</h1>
      </div>

      <Tabs defaultValue=&quot;directory&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;directory&quot;>Directory</TabsTrigger>
          <TabsTrigger value=&quot;profile&quot;>Profile</TabsTrigger>
          <TabsTrigger value=&quot;brands&quot;>Brands</TabsTrigger>
          <TabsTrigger value=&quot;locations&quot;>Locations</TabsTrigger>
          <TabsTrigger value=&quot;users&quot;>Users</TabsTrigger>
          <TabsTrigger value=&quot;billing&quot;>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;directory&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            View and manage all client organizations in the system.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* Client Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Building className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                  Acme Corporation
                </CardTitle>
                <CardDescription>
                  Tier 2 - Full-service event staffing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Brands:</span>
                    <span className=&quot;font-medium&quot;>3</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Locations:</span>
                    <span className=&quot;font-medium&quot;>12</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Users:</span>
                    <span className=&quot;font-medium&quot;>8</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Regions:</span>
                    <span className=&quot;font-medium&quot;>5 states</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/clients/profile?id=1&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Manage Client →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for more clients */}
            <Card className=&quot;bg-muted/50 border-dashed transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Building className=&quot;mr-2 h-5 w-5 text-muted-foreground&quot; />
                  Globex Industries
                </CardTitle>
                <CardDescription>Tier 3 - White-label service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Brands:</span>
                    <span className=&quot;font-medium&quot;>2</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Locations:</span>
                    <span className=&quot;font-medium&quot;>5</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Users:</span>
                    <span className=&quot;font-medium&quot;>4</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Regions:</span>
                    <span className=&quot;font-medium&quot;>3 states</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/clients/profile?id=2&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    Manage Client →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add new client card */}
            <Card className=&quot;border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center text-primary&quot;>
                  <Building className=&quot;mr-2 h-5 w-5&quot; />
                  Add New Client
                </CardTitle>
                <CardDescription>
                  Create a new client organization
                </CardDescription>
              </CardHeader>
              <CardContent className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Link
                  href=&quot;/clients/new&quot;
                  className=&quot;h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors&quot;
                >
                  <span className=&quot;text-2xl font-semibold&quot;>+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;profile&quot;>
          <div className=&quot;flex items-center justify-center h-64&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Select a client from the directory to view and edit their profile.
            </p>
          </div>
        </TabsContent>

        <TabsContent value=&quot;brands&quot;>
          <div className=&quot;flex items-center justify-center h-64&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Select a client to manage their brands.
            </p>
          </div>
        </TabsContent>

        <TabsContent value=&quot;locations&quot;>
          <div className=&quot;flex items-center justify-center h-64&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Select a client to manage their locations and venues.
            </p>
          </div>
        </TabsContent>

        <TabsContent value=&quot;users&quot;>
          <div className=&quot;flex items-center justify-center h-64&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Select a client to manage their user accounts.
            </p>
          </div>
        </TabsContent>

        <TabsContent value=&quot;billing&quot;>
          <div className=&quot;flex items-center justify-center h-64&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Select a client to view and manage billing information.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
