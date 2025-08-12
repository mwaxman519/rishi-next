'use client';

import { useState, useEffect } from 'react';
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

  // Add visibility fixes for iframe context
  useEffect(() => {
    if (window.location.hostname.includes('replit') && window.parent !== window) {
      document.body.classList.add('replit-preview', 'iframe-mode');
      document.documentElement.classList.add('replit-preview');
    }
  }, []);

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
          
          // Store user data in localStorage as backup for iframe context
          try {
            localStorage.setItem('rishi-user-session', JSON.stringify(result.data));
            console.log('User session stored in localStorage');
          } catch (e) {
            console.warn('Failed to store session in localStorage:', e);
          }
          
          // Dispatch login success event to notify auth hooks
          const loginEvent = new CustomEvent('loginSuccess', { detail: result.data });
          window.dispatchEvent(loginEvent);
          
          // Special handling for iframe/Replit preview context
          if (window !== window.parent || window.location.hostname.includes('replit')) {
            console.log('Detected iframe/Replit context, using window.location redirect...');
            // Add a longer delay to ensure cookie is set and propagated in iframe context
            setTimeout(() => {
              console.log('Redirecting to dashboard after cookie sync delay...');
              window.location.href = '/dashboard';
            }, 1500);
            return;
          }
          
          // For normal browser context, use Next.js router
          try {
            router.replace('/dashboard');
            
            // Fallback after short delay in case router fails
            setTimeout(() => {
              if (window.location.pathname === '/auth/login') {
                console.log('Router redirect failed, using window.location fallback...');
                window.location.href = '/dashboard';
              }
            }, 1000);
            
          } catch (error) {
            console.error('Router redirect failed, using window.location:', error);
            window.location.href = '/dashboard';
          }
          
          return; // Ensure we don't continue processing
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <img 
              src="/assets/logos/rishi-logo-actual.png" 
              alt="Rishi Platform" 
              className="w-48 h-auto mb-6"
              onError={(e) => {
                console.log('Main logo failed, trying icon');
                e.currentTarget.src = '/assets/logos/rishi-logo-icon.png';
                e.currentTarget.className = 'w-16 h-16 mb-4';
              }}
            />
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-lg">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all duration-200"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-purple-600 transition-colors">Help</a>
              </div>
              <p className="text-xs text-slate-400">© 2025 Rishi Platform. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}