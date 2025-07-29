"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import AgentCalendar from "@/components/agent-calendar/AgentCalendar";

export default function AvailabilityPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/schedule");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Collapsed header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Availability</h1>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-b bg-muted/50">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>How to use:</strong> Click and drag on the calendar to set your availability.
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen calendar */}
      <div className="flex-1 p-2">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="min-h-[calc(100vh-200px)] overflow-x-auto w-full">
              <AgentCalendar
                userId="00000000-0000-0000-0000-000000000001"
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