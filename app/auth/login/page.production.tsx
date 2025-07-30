'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4&quot;>
      <Card className=&quot;w-full max-w-md&quot;>
        <CardHeader className=&quot;space-y-1&quot;>
          <div className=&quot;flex items-center justify-center mb-4&quot;>
            <img 
              src=&quot;/favicon.ico&quot; 
              alt=&quot;Rishi Platform&quot; 
              className=&quot;w-8 h-8 mr-2&quot;
            />
            <CardTitle className=&quot;text-2xl font-bold text-purple-700 dark:text-purple-200&quot;>
              Rishi Platform
            </CardTitle>
          </div>
          <CardDescription className=&quot;text-center&quot;>
            Sign in to your account
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
                disabled={isLoading}
                className=&quot;focus:ring-purple-500 focus:border-purple-500&quot;
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
                disabled={isLoading}
                className=&quot;focus:ring-purple-500 focus:border-purple-500&quot;
              />
            </div>

            {error && (
              <Alert variant=&quot;destructive&quot;>
                <AlertCircle className=&quot;h-4 w-4&quot; />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type=&quot;submit&quot;
              className=&quot;w-full bg-purple-600 hover:bg-purple-700 text-white&quot;
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}