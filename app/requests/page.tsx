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
  Calendar,
  CheckCircle,
  ClockIcon,
  XCircle,
  CalendarDays,
  Filter,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { Button } from &quot;@/components/ui/button&quot;;

export default function RequestsPage() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Event Requests</h1>
        <Button variant=&quot;outline&quot; className=&quot;gap-2&quot;>
          <Filter className=&quot;h-4 w-4&quot; />
          Filter
        </Button>
      </div>

      <Tabs defaultValue=&quot;pending&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;pending&quot;>Pending</TabsTrigger>
          <TabsTrigger value=&quot;approved&quot;>Approved</TabsTrigger>
          <TabsTrigger value=&quot;scheduled&quot;>Scheduled</TabsTrigger>
          <TabsTrigger value=&quot;declined&quot;>Declined</TabsTrigger>
          <TabsTrigger value=&quot;calendar&quot;>Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;pending&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            New event booking requests waiting for approval.
          </p>

          <div className=&quot;grid grid-cols-1 gap-4&quot;>
            {/* Pending Request Card */}
            <Card className=&quot;transition-all hover:shadow-md border-amber-200&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center text-lg&quot;>
                      <Calendar className=&quot;mr-2 h-5 w-5 text-amber-600&quot; />
                      Product Launch Event
                    </CardTitle>
                    <CardDescription>
                      <span className=&quot;font-medium&quot;>Acme Corporation</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                    Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Date & Time</p>
                      <p className=&quot;font-medium&quot;>
                        May 15, 2025 • 10:00 AM - 4:00 PM
                      </p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Location</p>
                      <p className=&quot;font-medium&quot;>
                        San Francisco Convention Center
                      </p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Staff Needed</p>
                      <p className=&quot;font-medium&quot;>5 Brand Ambassadors</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Kit Requested</p>
                      <p className=&quot;font-medium&quot;>Demo Kit v2</p>
                    </div>
                  </div>

                  <div className=&quot;pt-2 border-t&quot;>
                    <p className=&quot;text-muted-foreground text-sm mb-1&quot;>
                      Request Notes
                    </p>
                    <p className=&quot;text-sm&quot;>
                      Staff should have knowledge of our new product line and be
                      able to demonstrate features to potential clients.
                    </p>
                  </div>

                  <div className=&quot;flex justify-end space-x-3&quot;>
                    <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;gap-1&quot;>
                      <XCircle className=&quot;h-4 w-4&quot; />
                      Decline
                    </Button>
                    <Link href=&quot;/requests/1&quot;>
                      <Button size=&quot;sm&quot; className=&quot;gap-1&quot;>
                        <CheckCircle className=&quot;h-4 w-4&quot; />
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Another Pending Request Card */}
            <Card className=&quot;transition-all hover:shadow-md border-amber-200&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center text-lg&quot;>
                      <Calendar className=&quot;mr-2 h-5 w-5 text-amber-600&quot; />
                      Trade Show Representation
                    </CardTitle>
                    <CardDescription>
                      <span className=&quot;font-medium&quot;>Globex Industries</span> •
                      Tier 3
                    </CardDescription>
                  </div>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                    Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Date & Time</p>
                      <p className=&quot;font-medium&quot;>
                        June 5-7, 2025 • 9:00 AM - 5:00 PM
                      </p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Location</p>
                      <p className=&quot;font-medium&quot;>Chicago McCormick Place</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Staff Needed</p>
                      <p className=&quot;font-medium&quot;>3 Technical Specialists</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Kit Requested</p>
                      <p className=&quot;font-medium&quot;>Trade Show Ultimate</p>
                    </div>
                  </div>

                  <div className=&quot;pt-2 border-t&quot;>
                    <p className=&quot;text-muted-foreground text-sm mb-1&quot;>
                      Request Notes
                    </p>
                    <p className=&quot;text-sm&quot;>
                      Need staff with technical expertise who can engage with
                      industry professionals. Booth will require full setup on
                      June 4th.
                    </p>
                  </div>

                  <div className=&quot;flex justify-end space-x-3&quot;>
                    <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;gap-1&quot;>
                      <XCircle className=&quot;h-4 w-4&quot; />
                      Decline
                    </Button>
                    <Link href=&quot;/requests/2&quot;>
                      <Button size=&quot;sm&quot; className=&quot;gap-1&quot;>
                        <CheckCircle className=&quot;h-4 w-4&quot; />
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;approved&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Approved requests ready for scheduling.
          </p>

          <div className=&quot;grid grid-cols-1 gap-4&quot;>
            {/* Approved Request Card */}
            <Card className=&quot;transition-all hover:shadow-md border-green-200&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center text-lg&quot;>
                      <Calendar className=&quot;mr-2 h-5 w-5 text-green-600&quot; />
                      Product Demo Workshop
                    </CardTitle>
                    <CardDescription>
                      <span className=&quot;font-medium&quot;>Initech Solutions</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800&quot;>
                    Approved
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Date & Time</p>
                      <p className=&quot;font-medium&quot;>
                        April 28, 2025 • 1:00 PM - 5:00 PM
                      </p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Location</p>
                      <p className=&quot;font-medium&quot;>Austin Convention Center</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Staff Needed</p>
                      <p className=&quot;font-medium&quot;>2 Brand Ambassadors</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Kit Assigned</p>
                      <p className=&quot;font-medium&quot;>Demo Kit A-123</p>
                    </div>
                  </div>

                  <div className=&quot;flex justify-end&quot;>
                    <Link href=&quot;/requests/3/schedule&quot;>
                      <Button size=&quot;sm&quot; className=&quot;gap-1&quot;>
                        <ClockIcon className=&quot;h-4 w-4&quot; />
                        Schedule Staff
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;scheduled&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Fully scheduled event requests.
          </p>

          <div className=&quot;grid grid-cols-1 gap-4&quot;>
            {/* Scheduled Request Card */}
            <Card className=&quot;transition-all hover:shadow-md border-blue-200&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <div className=&quot;flex justify-between items-start&quot;>
                  <div>
                    <CardTitle className=&quot;flex items-center text-lg&quot;>
                      <Calendar className=&quot;mr-2 h-5 w-5 text-blue-600&quot; />
                      Annual Conference
                    </CardTitle>
                    <CardDescription>
                      <span className=&quot;font-medium&quot;>Acme Corporation</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-blue-100 text-blue-800&quot;>
                    Scheduled
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;grid grid-cols-2 gap-4 text-sm&quot;>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Date & Time</p>
                      <p className=&quot;font-medium&quot;>
                        April 22-24, 2025 • 8:00 AM - 6:00 PM
                      </p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Location</p>
                      <p className=&quot;font-medium&quot;>Las Vegas Convention Center</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Staff Assigned</p>
                      <p className=&quot;font-medium&quot;>5/5 Confirmed</p>
                    </div>
                    <div>
                      <p className=&quot;text-muted-foreground&quot;>Kit Status</p>
                      <p className=&quot;font-medium&quot;>All Kits Ready</p>
                    </div>
                  </div>

                  <div className=&quot;flex justify-end&quot;>
                    <Link href=&quot;/requests/4/details&quot;>
                      <Button size=&quot;sm&quot; variant=&quot;outline&quot; className=&quot;gap-1&quot;>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;declined&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>Declined event requests.</p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <XCircle className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>No Declined Requests</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                There are currently no declined event requests.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value=&quot;calendar&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Calendar view of all event requests.
          </p>

          <div className=&quot;flex items-center justify-center h-96&quot;>
            <div className=&quot;text-center&quot;>
              <CalendarDays className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Calendar View</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will display a calendar view of all event requests.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
