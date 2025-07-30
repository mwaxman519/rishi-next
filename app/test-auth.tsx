&quot;use client&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { useAuthService } from &quot;@/hooks/useAuthService&quot;;
import { useState } from &quot;react&quot;;

export default function TestAuth() {
  const authService = useAuthService();
  const [testResult, setTestResult] = useState<string>("&quot;);
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult(&quot;&quot;);
    try {
      const result = await authService.login({
        username: &quot;mike&quot;,
        password: &quot;wrench519&quot;,
      });
      setTestResult(`Login successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Login failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    setIsLoading(true);
    setTestResult(&quot;&quot;);
    try {
      const result = await authService.getSession();
      setTestResult(`Session: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Session failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    setTestResult(&quot;&quot;);
    try {
      await authService.logout();
      setTestResult(&quot;Logout successful&quot;);
    } catch (error) {
      setTestResult(`Logout failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className=&quot;space-y-4&quot;>
          <div className=&quot;flex gap-4&quot;>
            <Button onClick={testLogin} disabled={isLoading}>
              Test Login
            </Button>
            <Button onClick={testSession} disabled={isLoading}>
              Test Session
            </Button>
            <Button onClick={testLogout} disabled={isLoading}>
              Test Logout
            </Button>
          </div>
          {testResult && (
            <pre className=&quot;bg-gray-100 p-4 rounded text-sm overflow-auto">
              {testResult}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}