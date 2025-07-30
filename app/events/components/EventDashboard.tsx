&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { PlusCircle, Calendar as CalendarIcon, List } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import EventCalendarView from &quot;./EventCalendarView&quot;;
import EventListView from &quot;./EventListView&quot;;

export default function EventDashboard() {
  const [view, setView] = useState<&quot;list&quot; | &quot;calendar&quot;>(&quot;calendar&quot;);

  return (
    <Card className=&quot;w-full&quot;>
      <CardHeader className=&quot;pb-3&quot;>
        <div className=&quot;flex justify-between items-center&quot;>
          <div>
            <CardTitle>Events Dashboard</CardTitle>
            <CardDescription>
              Schedule and manage events across all locations
            </CardDescription>
          </div>
          <Link href=&quot;/events/create&quot;>
            <Button>
              <PlusCircle className=&quot;mr-2 h-4 w-4&quot; />
              Create Event
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={view}
          onValueChange={(v) => setView(v as &quot;list&quot; | &quot;calendar&quot;)}
        >
          <div className=&quot;flex justify-between items-center mb-6&quot;>
            <TabsList>
              <TabsTrigger value=&quot;calendar&quot;>
                <CalendarIcon className=&quot;h-4 w-4 mr-2&quot; />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value=&quot;list&quot;>
                <List className=&quot;h-4 w-4 mr-2&quot; />
                List View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value=&quot;calendar&quot; className=&quot;mt-0&quot;>
            <EventCalendarView />
          </TabsContent>

          <TabsContent value=&quot;list&quot; className=&quot;mt-0&quot;>
            <EventListView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
