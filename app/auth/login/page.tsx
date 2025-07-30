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
      console.log('Submitting login for:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Ensure cookies are included
      });

      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Login response data:', result);
        
        if (result.success) {
          console.log('Login successful, redirecting to dashboard...');
          
          // For Replit staging environments, use multiple redirect strategies
          try {
            // Strategy 1: Next.js router (preferred)
            router.replace('/dashboard');
            
            // Strategy 2: Fallback with window.location for staging environments
            setTimeout(() => {
              console.log('Fallback redirect to dashboard using window.location...');
              window.location.href = '/dashboard';
            }, 500);
            
            // Strategy 3: Force page reload if in iframe context
            setTimeout(() => {
              if (window !== window.parent) {
                console.log('Detected iframe context, forcing page reload...');
                window.location.replace('/dashboard');
              }
            }, 1000);
            
          } catch (error) {
            console.error('Router redirect failed, using window.location:', error);
            window.location.href = '/dashboard';
          }
          
          return; // Ensure we don&apos;t continue processing
        } else {
          setError(result.error || result.message || 'Login failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Login failed with error:', errorData);
        setError(errorData.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-4&quot;>
      <Card className=&quot;w-full max-w-md shadow-2xl border-0 rounded-2xl&quot;>
        <CardHeader className=&quot;space-y-4 text-center pb-6&quot;>
          <div className=&quot;flex flex-col items-center justify-center mb-4&quot;>
            <img 
              src=&quot;/assets/logos/rishi-logo-main.png&quot; 
              alt=&quot;Rishi Platform&quot; 
              className=&quot;w-48 h-auto mb-6&quot;
              onError={(e) => {
                console.log('Main logo failed, trying icon');
                e.currentTarget.src = '/assets/logos/rishi-logo-icon.png';
                e.currentTarget.className = 'w-16 h-16 mb-4';
              }}
            />
          </div>
          <CardDescription className=&quot;text-slate-600 dark:text-slate-400 text-lg&quot;>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className=&quot;space-y-6&quot;>
          <form onSubmit={handleSubmit} className=&quot;space-y-5&quot;>
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;username&quot; className=&quot;text-slate-700 dark:text-slate-300 font-medium&quot;>Username</Label>
              <Input
                id=&quot;username&quot;
                type=&quot;text&quot;
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=&quot;Enter your username&quot;
                required
                disabled={isLoading}
                className=&quot;h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200&quot;
              />
            </div>
            
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;password&quot; className=&quot;text-slate-700 dark:text-slate-300 font-medium&quot;>Password</Label>
              <Input
                id=&quot;password&quot;
                type=&quot;password&quot;
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=&quot;Enter your password&quot;
                required
                disabled={isLoading}
                className=&quot;h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200&quot;
              />
            </div>

            {error && (
              <Alert variant=&quot;destructive&quot; className=&quot;border-red-200 bg-red-50 text-red-800 rounded-xl&quot;>
                <AlertCircle className=&quot;h-4 w-4&quot; />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type=&quot;submit&quot;
              className=&quot;w-full h-12 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]&quot;
              disabled={isLoading}
            >
              {isLoading ? (
                <div className=&quot;flex items-center space-x-2&quot;>
                  <div className=&quot;w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin&quot;></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className=&quot;pt-6 border-t border-slate-200 dark:border-slate-700&quot;>
            <div className=&quot;text-center space-y-3&quot;>
              <div className=&quot;flex items-center justify-center space-x-4 text-sm text-slate-500&quot;>
                <a href=&quot;#&quot; className=&quot;hover:text-purple-600 transition-colors&quot;>Terms</a>
                <span>•</span>
                <a href=&quot;#&quot; className=&quot;hover:text-purple-600 transition-colors&quot;>Privacy</a>
                <span>•</span>
                <a href=&quot;#&quot; className=&quot;hover:text-purple-600 transition-colors&quot;>Help</a>
              </div>
              <p className=&quot;text-xs text-slate-400&quot;>© 2025 Rishi Platform. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}