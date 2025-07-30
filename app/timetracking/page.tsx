&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  MapPin,
  User,
} from &quot;lucide-react&quot;;

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState([
    {
      id: &quot;1&quot;,
      date: &quot;2025-06-22&quot;,
      startTime: &quot;09:00&quot;,
      endTime: &quot;17:00&quot;,
      duration: 8,
      location: &quot;Denver Cannabis Dispensary&quot;,
      booking: &quot;Product Demo - Peak Extracts&quot;,
      status: &quot;completed&quot;,
    },
    {
      id: &quot;2&quot;,
      date: &quot;2025-06-21&quot;,
      startTime: &quot;10:30&quot;,
      endTime: &quot;15:30&quot;,
      duration: 5,
      location: &quot;Portland Cannabis Store&quot;,
      booking: &quot;Brand Activation - Green Valley&quot;,
      status: &quot;completed&quot;,
    },
    {
      id: &quot;3&quot;,
      date: &quot;2025-06-20&quot;,
      startTime: &quot;13:00&quot;,
      endTime: &quot;18:00&quot;,
      duration: 5,
      location: &quot;Seattle Cannabis Market&quot;,
      booking: &quot;Customer Education - Leafwell&quot;,
      status: &quot;completed&quot;,
    },
  ]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentSession({
      startTime: new Date(),
      location: &quot;Current Location&quot;,
      booking: &quot;Active Booking&quot;,
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
        date: new Date().toISOString().split(&quot;T&quot;)[0],
        startTime: currentSession.startTime.toLocaleTimeString(&quot;en-US&quot;, {
          hour12: false,
        }),
        endTime: endTime.toLocaleTimeString(&quot;en-US&quot;, { hour12: false }),
        duration: Math.round(duration * 100) / 100,
        location: currentSession.location,
        booking: currentSession.booking,
        status: &quot;completed&quot;,
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
    <div className=&quot;container mx-auto p-6 max-w-7xl&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold text-foreground&quot;>Time Tracking</h1>
        <p className=&quot;text-muted-foreground mt-2&quot;>
          Track your working hours for cannabis workforce operations
        </p>
      </div>

      {/* Current Session Card */}
      <Card className=&quot;mb-6&quot;>
        <CardHeader>
          <CardTitle className=&quot;flex items-center gap-2&quot;>
            <Clock className=&quot;h-5 w-5&quot; />
            Current Session
          </CardTitle>
          <CardDescription>
            {isTracking
              ? &quot;Currently tracking time&quot;
              : &quot;Start tracking your work session&quot;}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex items-center justify-between&quot;>
            <div className=&quot;flex items-center gap-4&quot;>
              {isTracking && currentSession && (
                <div className=&quot;text-sm text-muted-foreground&quot;>
                  <p>
                    Started: {currentSession.startTime.toLocaleTimeString()}
                  </p>
                  <p>Location: {currentSession.location}</p>
                  <p>Booking: {currentSession.booking}</p>
                </div>
              )}
            </div>
            <div className=&quot;flex gap-2&quot;>
              {!isTracking ? (
                <Button onClick={startTracking} className=&quot;gap-2&quot;>
                  <Play className=&quot;h-4 w-4&quot; />
                  Start Tracking
                </Button>
              ) : (
                <Button
                  onClick={stopTracking}
                  variant=&quot;destructive&quot;
                  className=&quot;gap-2&quot;
                >
                  <Square className=&quot;h-4 w-4&quot; />
                  Stop Tracking
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6 mb-6&quot;>
        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{totalHoursThisWeek}h</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Total hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{timeEntries.length}</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {timeEntries.length > 0
                ? Math.round((totalHoursThisWeek / timeEntries.length) * 100) /
                  100
                : 0}
              h
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Per session</p>
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
          <div className=&quot;space-y-4&quot;>
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className=&quot;flex items-center justify-between p-4 border rounded-lg&quot;
              >
                <div className=&quot;flex items-center gap-4&quot;>
                  <div className=&quot;flex h-10 w-10 items-center justify-center rounded-full bg-primary/10&quot;>
                    <Calendar className=&quot;h-5 w-5 text-primary&quot; />
                  </div>
                  <div>
                    <p className=&quot;font-medium&quot;>{entry.booking}</p>
                    <div className=&quot;flex items-center gap-4 text-sm text-muted-foreground&quot;>
                      <span className=&quot;flex items-center gap-1&quot;>
                        <Calendar className=&quot;h-3 w-3&quot; />
                        {entry.date}
                      </span>
                      <span className=&quot;flex items-center gap-1&quot;>
                        <Clock className=&quot;h-3 w-3&quot; />
                        {entry.startTime} - {entry.endTime}
                      </span>
                      <span className=&quot;flex items-center gap-1&quot;>
                        <MapPin className=&quot;h-3 w-3&quot; />
                        {entry.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className=&quot;text-right&quot;>
                  <div className=&quot;font-medium&quot;>{entry.duration}h</div>
                  <div className=&quot;text-xs text-muted-foreground capitalize&quot;>
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
