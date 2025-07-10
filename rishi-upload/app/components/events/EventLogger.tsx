/**
 * Event Logger Component
 *
 * A debug component that displays a live feed of all WebSocket events
 * received by the client. Useful for development and debugging.
 */

"use client";

import { useState, useEffect } from "react";
import { useWebSocketEvents, WebSocketEvent } from "@/hooks/useWebSocketEvents";
import { AppEvent } from "@/services/infrastructure/messaging/eventTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Wifi, WifiOff } from "lucide-react";

interface EventLoggerProps {
  maxEvents?: number;
  height?: string;
  title?: string;
  filter?: AppEvent[];
}

/**
 * Returns a badge color based on event type
 */
function getEventBadgeColor(eventType: string): string {
  switch (eventType) {
    case AppEvent.LOCATION_CREATED:
      return "bg-blue-500 hover:bg-blue-600";
    case AppEvent.LOCATION_UPDATED:
      return "bg-yellow-500 hover:bg-yellow-600";
    case AppEvent.LOCATION_APPROVED:
      return "bg-green-500 hover:bg-green-600";
    case AppEvent.LOCATION_REJECTED:
    case AppEvent.LOCATION_DELETED:
      return "bg-red-500 hover:bg-red-600";
    case AppEvent.SYSTEM_NOTIFICATION:
      return "bg-purple-500 hover:bg-purple-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

/**
 * Format timestamp to a human-readable string
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Event Logger Component
 */
export function EventLogger({
  maxEvents = 10,
  height = "300px",
  title = "Event Log",
  filter,
}: EventLoggerProps) {
  const { isConnected, events } = useWebSocketEvents({
    events: filter,
    autoReconnect: true,
  });

  // Filter and limit the number of events displayed
  const displayEvents = filter
    ? events
        .filter((e) => filter.includes(e.type as AppEvent))
        .slice(0, maxEvents)
    : events.slice(0, maxEvents);

  return (
    <Card className="w-full shadow-md border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge
                variant="outline"
                className="flex gap-1 items-center bg-green-500/10 text-green-500 border-green-500/20"
              >
                <Wifi className="h-3 w-3" />
                <span>Connected</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex gap-1 items-center bg-red-500/10 text-red-500 border-red-500/20"
              >
                <WifiOff className="h-3 w-3" />
                <span>Disconnected</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${height}] w-full pr-4`}>
          {displayEvents.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <p className="text-center text-sm">Waiting for events...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayEvents.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="rounded-md border p-3 text-sm bg-background"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${getEventBadgeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <pre className="text-xs overflow-x-auto p-2 bg-muted rounded">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
