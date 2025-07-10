import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Boxes,
  Tags,
  ArrowRight,
  Wrench,
  Clipboard,
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kit Management | Rishi Platform",
  description:
    "Manage kit templates, instances, inventory, and assignments for field operations",
};

export default function KitsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kit Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your kit templates, instances, and assignments for field
            operations
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Kit Templates</CardTitle>
                <CardDescription>
                  Define reusable kit configurations for your operations
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Create and manage standardized templates for your kits with
              detailed component lists. Define what goes into each kit type and
              set standards for equipment, tools, and materials.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/kits/templates">
                View Templates <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Kit Instances</CardTitle>
                <CardDescription>
                  Track and manage physical kit instances in the field
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Create and monitor specific kit instances based on your templates.
              Track location, status, and usage history of each physical kit in
              the field.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/kits/instances">
                View Instances <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Track components and inventory levels
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Tags className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Manage inventory levels for kit components. Set up alerts for low
              stock levels and generate purchase orders for replenishment.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled variant="outline" className="w-full">
              Coming Soon <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Activity Assignments</CardTitle>
                <CardDescription>
                  Associate kits with activities and events
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Assign kits to specific activities, events or field operations.
              Track which kits are being used for what purpose and by whom.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled variant="outline" className="w-full">
              Coming Soon <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Maintenance Tracking</CardTitle>
                <CardDescription>
                  Track maintenance history and schedules
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Set up maintenance schedules for equipment and tools. Record
              maintenance history and receive alerts for upcoming maintenance
              needs.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled variant="outline" className="w-full">
              Coming Soon <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Reporting</CardTitle>
                <CardDescription>
                  Generate reports on kit usage and status
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Clipboard className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Generate reports on kit utilization, component usage, maintenance
              history, and other key metrics to optimize your kit management.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled variant="outline" className="w-full">
              Coming Soon <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
