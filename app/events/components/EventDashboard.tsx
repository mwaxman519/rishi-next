"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, List } from "lucide-react";
import Link from "next/link";
import EventCalendarView from "./EventCalendarView";
import EventListView from "./EventListView";

export default function EventDashboard() {
  const [view, setView] = useState<"list" | "calendar">("calendar");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Events Dashboard</CardTitle>
            <CardDescription>
              Schedule and manage events across all locations
            </CardDescription>
          </div>
          <Link href="/events/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={view}
          onValueChange={(v) => setView(v as "list" | "calendar")}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="mt-0">
            <EventCalendarView />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <EventListView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
