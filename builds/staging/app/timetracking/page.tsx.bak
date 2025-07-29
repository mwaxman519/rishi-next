"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState([
    {
      id: "1",
      date: "2025-06-22",
      startTime: "09:00",
      endTime: "17:00",
      duration: 8,
      location: "Denver Cannabis Dispensary",
      booking: "Product Demo - Peak Extracts",
      status: "completed",
    },
    {
      id: "2",
      date: "2025-06-21",
      startTime: "10:30",
      endTime: "15:30",
      duration: 5,
      location: "Portland Cannabis Store",
      booking: "Brand Activation - Green Valley",
      status: "completed",
    },
    {
      id: "3",
      date: "2025-06-20",
      startTime: "13:00",
      endTime: "18:00",
      duration: 5,
      location: "Seattle Cannabis Market",
      booking: "Customer Education - Leafwell",
      status: "completed",
    },
  ]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentSession({
      startTime: new Date(),
      location: "Current Location",
      booking: "Active Booking",
    });
  };

  const stopTracking = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration =
        (endTime.getTime() - currentSession.startTime.getTime()) /
        (1000 * 60 * 60);

      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        startTime: currentSession.startTime.toLocaleTimeString("en-US", {
          hour12: false,
        }),
        endTime: endTime.toLocaleTimeString("en-US", { hour12: false }),
        duration: Math.round(duration * 100) / 100,
        location: currentSession.location,
        booking: currentSession.booking,
        status: "completed",
      };

      setTimeEntries([newEntry, ...timeEntries]);
      setCurrentSession(null);
    }
    setIsTracking(false);
  };

  const totalHoursThisWeek = timeEntries.reduce(
    (total, entry) => total + entry.duration,
    0,
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Track your working hours for cannabis workforce operations
        </p>
      </div>

      {/* Current Session Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Session
          </CardTitle>
          <CardDescription>
            {isTracking
              ? "Currently tracking time"
              : "Start tracking your work session"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isTracking && currentSession && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Started: {currentSession.startTime.toLocaleTimeString()}
                  </p>
                  <p>Location: {currentSession.location}</p>
                  <p>Booking: {currentSession.booking}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!isTracking ? (
                <Button onClick={startTracking} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Tracking
                </Button>
              ) : (
                <Button
                  onClick={stopTracking}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursThisWeek}h</div>
            <p className="text-xs text-muted-foreground">Total hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
            <p className="text-xs text-muted-foreground">Completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.length > 0
                ? Math.round((totalHoursThisWeek / timeEntries.length) * 100) /
                  100
                : 0}
              h
            </div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            Your recent cannabis workforce time tracking entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{entry.booking}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.startTime} - {entry.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{entry.duration}h</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {entry.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
