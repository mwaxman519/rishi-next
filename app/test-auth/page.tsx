&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Alert, AlertDescription } from &quot;@/components/ui/alert&quot;;
import { CheckCircle, XCircle, Loader2 } from &quot;lucide-react&quot;;

interface TestResult {
  endpoint: string;
  status: &quot;success&quot; | &quot;error&quot; | &quot;loading&quot;;
  message: string;
  data?: any;
}

export default function TestAuthPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { endpoint: &quot;/api/auth/user&quot;, description: &quot;User Authentication&quot; },
    { endpoint: &quot;/api/locations&quot;, description: &quot;Locations API&quot; },
    { endpoint: &quot;/api/kits&quot;, description: &quot;Kits API&quot; },
    { endpoint: &quot;/api/auth/session&quot;, description: &quot;Session API&quot; },
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
            status: &quot;success&quot;,
            message: `✓ ${test.description} working`,
            data: data,
          });
        } else {
          newResults.push({
            endpoint: test.endpoint,
            status: &quot;error&quot;,
            message: `✗ ${test.description} failed: ${data.error || response.statusText}`,
            data: data,
          });
        }
      } catch (error) {
        newResults.push({
          endpoint: test.endpoint,
          status: &quot;error&quot;,
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
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Authentication & API Testing</h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Testing authentication and API endpoints for Location and Kit Management
          </p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
              Testing...
            </>
          ) : (
            &quot;Run Tests&quot;
          )}
        </Button>
      </div>

      <div className=&quot;grid gap-4&quot;>
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                {result.endpoint}
              </CardTitle>
              <Badge variant={result.status === &quot;success&quot; ? &quot;default&quot; : &quot;destructive&quot;}>
                {result.status === &quot;success&quot; ? (
                  <CheckCircle className=&quot;h-3 w-3 mr-1&quot; />
                ) : (
                  <XCircle className=&quot;h-3 w-3 mr-1&quot; />
                )}
                {result.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className=&quot;text-sm text-muted-foreground mb-2&quot;>
                {result.message}
              </p>
              {result.data && (
                <div className=&quot;bg-muted p-3 rounded-md&quot;>
                  <pre className=&quot;text-xs overflow-x-auto&quot;>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className=&quot;space-y-4&quot;>
        <h2 className=&quot;text-2xl font-bold&quot;>Quick Actions</h2>
        <div className=&quot;grid gap-4 md:grid-cols-2&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Test Location Management</CardTitle>
              <CardDescription>
                Test the Location Management System functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className=&quot;w-full&quot;>
                <a href=&quot;/locations&quot;>Go to Locations</a>
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
              <Button asChild className=&quot;w-full&quot;>
                <a href=&quot;/kits&quot;>Go to Kits</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert>
        <CheckCircle className=&quot;h-4 w-4&quot; />
        <AlertDescription>
          Authentication system is now configured for full system testing. Both Location and Kit Management systems should be accessible.
        </AlertDescription>
      </Alert>
    </div>
  );
}