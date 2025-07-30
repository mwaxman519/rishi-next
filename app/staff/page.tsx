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
  User,
  Users,
  Clock,
  CalendarCheck,
  FileText,
  Award,
  Plus,
  Calendar,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function StaffPage() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Staff Management</h1>
        <Link
          href=&quot;/staff/new&quot;
          className=&quot;inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90&quot;
        >
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Add Staff Member
        </Link>
      </div>

      <Tabs defaultValue=&quot;directory&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;directory&quot;>Directory</TabsTrigger>
          <TabsTrigger value=&quot;certifications&quot;>Certifications</TabsTrigger>
          <TabsTrigger value=&quot;availability&quot;>Availability</TabsTrigger>
          <TabsTrigger value=&quot;timesheets&quot;>Timesheets</TabsTrigger>
          <TabsTrigger value=&quot;reports&quot;>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;directory&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Manage all Rishi staff members, including internal employees and
            brand agents.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
            {/* Staff Member Card */}
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
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Certifications:
                    </span>
                    <span className=&quot;font-medium&quot;>3 active</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/staff/1&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Staff Member Card */}
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
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Certifications:
                    </span>
                    <span className=&quot;font-medium&quot;>2 active</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/staff/2&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Internal Staff Member Card */}
            <Card className=&quot;transition-all hover:shadow-md border-blue-200&quot;>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <User className=&quot;mr-2 h-5 w-5 text-blue-600&quot; />
                  Alex Rivera
                </CardTitle>
                <CardDescription>Internal Operations Manager</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Location:</span>
                    <span className=&quot;font-medium&quot;>Remote</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Status:</span>
                    <span className=&quot;font-medium text-blue-600&quot;>Internal</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Department:</span>
                    <span className=&quot;font-medium&quot;>Operations</span>
                  </div>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>
                      Certifications:
                    </span>
                    <span className=&quot;font-medium&quot;>5 active</span>
                  </div>
                </div>
                <div className=&quot;mt-4 flex justify-end&quot;>
                  <Link
                    href=&quot;/staff/3&quot;
                    className=&quot;text-sm font-medium text-primary hover:underline&quot;
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;certifications&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground mb-4&quot;>
            Manage staff certifications for brand knowledge and technical
            skills.
          </p>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            {/* Certification Card */}
            <Card>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Award className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                  Brand Knowledge Certification
                </CardTitle>
                <CardDescription>
                  Training for specific brand product knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-4&quot;>
                  <div>
                    <p className=&quot;font-medium mb-2&quot;>Active Certifications</p>
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex justify-between items-center p-2 bg-muted rounded-md&quot;>
                        <div>
                          <span className=&quot;font-medium&quot;>Sarah Johnson</span>
                          <p className=&quot;text-xs text-muted-foreground&quot;>
                            Acme Products
                          </p>
                        </div>
                        <span className=&quot;text-xs px-2 py-1 rounded-full bg-green-100 text-green-800&quot;>
                          Valid until May 2026
                        </span>
                      </div>
                      <div className=&quot;flex justify-between items-center p-2 bg-muted rounded-md&quot;>
                        <div>
                          <span className=&quot;font-medium&quot;>Michael Chen</span>
                          <p className=&quot;text-xs text-muted-foreground&quot;>
                            Globex Products
                          </p>
                        </div>
                        <span className=&quot;text-xs px-2 py-1 rounded-full bg-green-100 text-green-800&quot;>
                          Valid until Nov 2025
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className=&quot;flex justify-end&quot;>
                    <Link
                      href=&quot;/staff/certifications/brand&quot;
                      className=&quot;text-sm font-medium text-primary hover:underline&quot;
                    >
                      Manage Certifications →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kit Use Certification Card */}
            <Card>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Award className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                  Kit Use Certification
                </CardTitle>
                <CardDescription>
                  Training for equipment handling and setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;text-sm space-y-4&quot;>
                  <div>
                    <p className=&quot;font-medium mb-2&quot;>Active Certifications</p>
                    <div className=&quot;space-y-2&quot;>
                      <div className=&quot;flex justify-between items-center p-2 bg-muted rounded-md&quot;>
                        <div>
                          <span className=&quot;font-medium&quot;>Michael Chen</span>
                          <p className=&quot;text-xs text-muted-foreground&quot;>
                            Trade Show Kit
                          </p>
                        </div>
                        <span className=&quot;text-xs px-2 py-1 rounded-full bg-green-100 text-green-800&quot;>
                          Valid until Dec 2025
                        </span>
                      </div>
                      <div className=&quot;flex justify-between items-center p-2 bg-muted rounded-md&quot;>
                        <div>
                          <span className=&quot;font-medium&quot;>Alex Rivera</span>
                          <p className=&quot;text-xs text-muted-foreground&quot;>
                            All Kit Types
                          </p>
                        </div>
                        <span className=&quot;text-xs px-2 py-1 rounded-full bg-green-100 text-green-800&quot;>
                          Valid until Mar 2026
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className=&quot;flex justify-end&quot;>
                    <Link
                      href=&quot;/staff/certifications/kit&quot;
                      className=&quot;text-sm font-medium text-primary hover:underline&quot;
                    >
                      Manage Certifications →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=&quot;availability&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            View and manage staff availability for event scheduling.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <Calendar className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>
                Staff Availability Calendar
              </h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will display staff availability for scheduling and
                assignment.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value=&quot;timesheets&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Track staff hours, clock-in/clock-out, and payroll information.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <Clock className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Timesheet Management</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will display timesheet data, hours worked, and
                payroll information.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value=&quot;reports&quot; className=&quot;space-y-6&quot;>
          <p className=&quot;text-muted-foreground&quot;>
            Generate reports on staff performance, certifications, and
            attendance.
          </p>

          <div className=&quot;flex items-center justify-center h-64&quot;>
            <div className=&quot;text-center&quot;>
              <FileText className=&quot;h-12 w-12 mx-auto text-primary mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Staff Reports</h3>
              <p className=&quot;text-muted-foreground max-w-md mt-2&quot;>
                This section will allow generation of various staff-related
                reports.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
