&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { ArrowLeft, Calendar, Clock, CheckCircle } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import AgentCalendar from &quot;@/components/agent-calendar/AgentCalendar&quot;;

export default function AvailabilityPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push(&quot;/schedule&quot;);
  };

  return (
    <div className=&quot;min-h-screen bg-background&quot;>
      {/* Collapsed header */}
      <div className=&quot;sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b&quot;>
        <div className=&quot;flex items-center p-2&quot;>
          <Button
            variant=&quot;ghost&quot;
            size=&quot;sm&quot;
            onClick={handleBack}
            className=&quot;p-2 mr-2&quot;
          >
            <ArrowLeft className=&quot;h-4 w-4&quot; />
          </Button>
          <h1 className=&quot;text-lg font-semibold&quot;>Availability</h1>
        </div>
      </div>

      {/* Instructions */}
      <div className=&quot;p-4 border-b bg-muted/50&quot;>
        <div className=&quot;text-sm text-muted-foreground&quot;>
          <p className=&quot;mb-2&quot;>
            <strong>How to use:</strong> Click and drag on the calendar to set your availability.
          </p>
          <div className=&quot;flex items-center space-x-4 text-xs&quot;>
            <div className=&quot;flex items-center space-x-1&quot;>
              <div className=&quot;w-3 h-3 bg-green-500 rounded-sm&quot;></div>
              <span>Available</span>
            </div>
            <div className=&quot;flex items-center space-x-1&quot;>
              <div className=&quot;w-3 h-3 bg-red-500 rounded-sm&quot;></div>
              <span>Unavailable</span>
            </div>
            <div className=&quot;flex items-center space-x-1&quot;>
              <div className=&quot;w-3 h-3 bg-blue-500 rounded-sm&quot;></div>
              <span>Scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen calendar */}
      <div className=&quot;flex-1 p-2&quot;>
        <Card className=&quot;h-full&quot;>
          <CardContent className=&quot;p-0&quot;>
            <div className=&quot;min-h-[calc(100vh-200px)] overflow-x-auto w-full&quot;>
              <AgentCalendar
                userId=&quot;00000000-0000-0000-0000-000000000001&quot;
                viewOnly={false}
                startDate={new Date()}
                endDate={
                  new Date(new Date().setDate(new Date().getDate() + 30))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}