"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  endpoint: string;
  status: "success" | "error" | "loading";
  message: string;
  data?: any;
}

export default function TestAuthPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { endpoint: "/api/auth/user", description: "User Authentication" },
    { endpoint: "/api/locations", description: "Locations API" },
    { endpoint: "/api/kits", description: "Kits API" },
    { endpoint: "/api/auth-service/session", description: "Session API" },
  ];

  const runTests = async () => {
    setLoading(true);
    const newResults: TestResult[] = [];

    for (const test of testEndpoints) {
      try {
        const response = await fetch(test.endpoint);
        const data = await response.json();

        if (response.ok) {
          newResults.push({
            endpoint: test.endpoint,
            status: "success",
            message: `✓ ${test.description} working`,
            data: data,
          });
        } else {
          newResults.push({
            endpoint: test.endpoint,
            status: "error",
            message: `✗ ${test.description} failed: ${data.error || response.statusText}`,
            data: data,
          });
        }
      } catch (error) {
        newResults.push({
          endpoint: test.endpoint,
          status: "error",
          message: `✗ ${test.description} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentication & API Testing</h1>
          <p className="text-muted-foreground mt-1">
            Testing authentication and API endpoints for Location and Kit Management
          </p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Run Tests"
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {result.endpoint}
              </CardTitle>
              <Badge variant={result.status === "success" ? "default" : "destructive"}>
                {result.status === "success" ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {result.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {result.message}
              </p>
              {result.data && (
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Location Management</CardTitle>
              <CardDescription>
                Test the Location Management System functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/locations">Go to Locations</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Kit Management</CardTitle>
              <CardDescription>
                Test the Kit Management System functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/kits">Go to Kits</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Authentication system is now configured for full system testing. Both Location and Kit Management systems should be accessible.
        </AlertDescription>
      </Alert>
    </div>
  );
}