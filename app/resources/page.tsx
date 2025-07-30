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
  Users,
  Package,
  LayoutTemplate,
  Calendar,
  User,
  PackageCheck,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function ResourcesPage() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Resource Management
        </h1>
      </div>

      <Tabs defaultValue=&quot;staff&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;staff&quot;>Staff</TabsTrigger>
          <TabsTrigger value=&quot;kits&quot;>Kits</TabsTrigger>
          <TabsTrigger value=&quot;kit-templates&quot;>Kit Templates</TabsTrigger>
          <TabsTrigger value=&quot;availability&quot;>Availability</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;staff&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Manage brand agents and staff assignments.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* Staff Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <User className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                  Sarah Johnson
                </CardTitle>
                <CardDescription>Brand Ambassador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Location:</span>
                    <span className=&quot;font-medium&quot;>San Francisco, CA</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Status:</span>
                    <span className=&quot;font-medium text-green-600&quot;>
                      Available
                    </span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Events:</span>
                    <span className=&quot;font-medium&quot;>12 completed</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/resources/staff/1&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Staff Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <User className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                  Michael Chen
                </CardTitle>
                <CardDescription>Technical Specialist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Location:</span>
                    <span className=&quot;font-medium&quot;>Chicago, IL</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Status:</span>
                    <span className=&quot;font-medium text-amber-600&quot;>Assigned</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Events:</span>
                    <span className=&quot;font-medium&quot;>8 completed</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/resources/staff/2&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add staff card */}
            <Card className=&quot;border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center text-primary&quot;>
                  <User className=&quot;mr-2 h-5 w-5&quot; />
                  Add New Staff
                </CardTitle>
                <CardDescription>Register a new brand agent</CardDescription>
              </CardHeader>
              <CardContent className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Link
                  href=&quot;/resources/staff/new&quot;
                  className=&quot;h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors&quot;
                >
                  <span className=&quot;text-2xl font-semibold&quot;>+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;kits&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Manage equipment kits and inventory.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* Kit Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <Package className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    Demo Kit A-123
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Available
                  </span>
                </div>
                <CardDescription>
                  Standard product demonstration kit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Location:</span>
                    <span className=&quot;font-medium&quot;>San Francisco Warehouse</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Components:</span>
                    <span className=&quot;font-medium&quot;>15 items</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Last Inspected:
                    </span>
                    <span className=&quot;font-medium&quot;>April 15, 2025</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/resources/kits/1&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Details →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Kit Card */}
            <Card className=&quot;transition-all hover:shadow-md&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <Package className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                    Trade Show Kit B-456
                  </CardTitle>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                    In Transit
                  </span>
                </div>
                <CardDescription>
                  Full booth setup with displays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Location:</span>
                    <span className=&quot;font-medium&quot;>En route to Chicago</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Components:</span>
                    <span className=&quot;font-medium&quot;>32 items</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Last Inspected:
                    </span>
                    <span className=&quot;font-medium&quot;>April 10, 2025</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/resources/kits/2&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Details →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add kit card */}
            <Card className=&quot;border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center text-primary&quot;>
                  <Package className=&quot;mr-2 h-5 w-5&quot; />
                  Add New Kit
                </CardTitle>
                <CardDescription>Create a new equipment kit</CardDescription>
              </CardHeader>
              <CardContent className=&quot;flex flex-col items-center justify-center py-8&quot;>
                <Link
                  href=&quot;/resources/kits/new&quot;
                  className=&quot;h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors&quot;
                >
                  <span className=&quot;text-2xl font-semibold&quot;>+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;kit-templates&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Standard kit configurations and templates.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <LayoutTemplate className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Kit Templates</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will contain standardized kit templates for quick
                creation.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value=&quot;availability&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Staff availability and scheduling.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <Calendar className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Staff Availability</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will show staff availability calendars and
                scheduling tools.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
