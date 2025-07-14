"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to event-data (removing the 3-second delay)
    router.replace("/event-data");
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Reports Feature Updated</CardTitle>
            <CardDescription className="text-base">
              Reports functionality has been enhanced and moved to Event Data
              Management
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You'll be automatically redirected to the new Event Data page,
              which now includes comprehensive reporting with Jotform
              integration and photo management workflows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/event-data">
                <Button className="w-full sm:w-auto">
                  Go to Event Data
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  Return to Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
              Redirecting automatically in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
