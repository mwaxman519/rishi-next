&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Alert, AlertDescription } from &quot;@/components/ui/alert&quot;;
import { Loader2 } from &quot;lucide-react&quot;;

export default function LoginPage() {
  const [username, setUsername] = useState("&quot;);
  const [password, setPassword] = useState(&quot;&quot;);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(&quot;&quot;);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(&quot;&quot;);

    try {
      const response = await fetch(&quot;/api/auth/login&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || &quot;Login failed&quot;);
      }

      // Redirect to dashboard on success
      router.push(&quot;/&quot;);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : &quot;An error occurred&quot;);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=&quot;container mx-auto flex h-screen items-center justify-center&quot;>
      <Card className=&quot;w-full max-w-md&quot;>
        <CardHeader>
          <CardTitle>Login to Rishi Platform</CardTitle>
          <CardDescription>
            Enter your credentials to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;username&quot;>Username</Label>
              <Input
                id=&quot;username&quot;
                type=&quot;text&quot;
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=&quot;Enter your username&quot;
                required
              />
            </div>
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;password&quot;>Password</Label>
              <Input
                id=&quot;password&quot;
                type=&quot;password&quot;
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=&quot;Enter your password&quot;
                required
              />
            </div>
            {error && (
              <Alert variant=&quot;destructive&quot;>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type=&quot;submit&quot; className=&quot;w-full&quot; disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                  Logging in...
                </>
              ) : (
                &quot;Login&quot;
              )}
            </Button>
          </form>
          <div className=&quot;mt-4 text-sm text-muted-foreground">
            <p>Development mode: Any username/password will work</p>
            <p>Or use: admin / admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}