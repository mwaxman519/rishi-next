&quot;use client&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { useState } from &quot;react&quot;;

export default function TestLoginPage() {
  const [username, setUsername] = useState(&quot;mike&quot;);
  const [password, setPassword] = useState(&quot;wrench519&quot;);
  const [testResult, setTestResult] = useState<string>("&quot;);
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult(&quot;Testing login...&quot;);
    
    try {
      // Step 1: Test login
      const loginResponse = await fetch(&quot;/api/auth-service/login&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        setTestResult(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        return;
      }

      const loginData = await loginResponse.json();
      setTestResult(`Login successful! User: ${loginData.data.user.username}, Role: ${loginData.data.user.role}`);
      
      // Step 2: Test session immediately after login
      setTimeout(async () => {
        const sessionResponse = await fetch(&quot;/api/auth-service/session&quot;, {
          method: &quot;GET&quot;,
          credentials: &quot;include&quot;,
        });

        if (!sessionResponse.ok) {
          setTestResult(prev => prev + `\nSession check failed: ${sessionResponse.status}`);
          return;
        }

        const sessionData = await sessionResponse.json();
        if (sessionData.data.user) {
          setTestResult(prev => prev + `\nSession verified! User: ${sessionData.data.user.username}, Role: ${sessionData.data.user.role}`);
        } else {
          setTestResult(prev => prev + `\nSession check failed: User is null`);
        }
      }, 1000);
      
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    setIsLoading(true);
    setTestResult(&quot;Testing session...&quot;);
    
    try {
      const response = await fetch(&quot;/api/auth-service/session&quot;, {
        method: &quot;GET&quot;,
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        setTestResult(`Session failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.data.user) {
        setTestResult(`Session successful! User: ${data.data.user.username}, Role: ${data.data.user.role}`);
      } else {
        setTestResult(&quot;Session check: No user found (not logged in)&quot;);
      }
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    setTestResult(&quot;Testing logout...&quot;);
    
    try {
      const response = await fetch(&quot;/api/auth-service/logout&quot;, {
        method: &quot;POST&quot;,
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        setTestResult(`Logout failed: ${response.status} ${response.statusText}`);
        return;
      }

      setTestResult(&quot;Logout successful!&quot;);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;container mx-auto py-6 max-w-2xl&quot;>
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className=&quot;space-y-4&quot;>
          <div className=&quot;grid grid-cols-2 gap-4&quot;>
            <div>
              <Label htmlFor=&quot;username&quot;>Username</Label>
              <Input
                id=&quot;username&quot;
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=&quot;Enter username&quot;
              />
            </div>
            <div>
              <Label htmlFor=&quot;password&quot;>Password</Label>
              <Input
                id=&quot;password&quot;
                type=&quot;password&quot;
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=&quot;Enter password&quot;
              />
            </div>
          </div>
          
          <div className=&quot;flex gap-4&quot;>
            <Button onClick={testLogin} disabled={isLoading}>
              Test Login
            </Button>
            <Button onClick={testSession} disabled={isLoading} variant=&quot;outline&quot;>
              Test Session
            </Button>
            <Button onClick={testLogout} disabled={isLoading} variant=&quot;outline&quot;>
              Test Logout
            </Button>
          </div>
          
          {testResult && (
            <div className=&quot;mt-4&quot;>
              <Label>Test Result:</Label>
              <pre className=&quot;bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap&quot;>
                {testResult}
              </pre>
            </div>
          )}
          
          <div className=&quot;mt-4 p-4 bg-blue-50 rounded&quot;>
            <h4 className=&quot;font-semibold mb-2&quot;>Debug Information</h4>
            <p className=&quot;text-sm">
              <strong>Environment:</strong> {process.env.NODE_ENV}<br/>
              <strong>In iframe:</strong> {typeof window !== 'undefined' && window.self !== window.top ? 'Yes' : 'No'}<br/>
              <strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}