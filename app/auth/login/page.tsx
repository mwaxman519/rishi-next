'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './login-form';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Force a page reload to ensure auth state is properly set
          window.location.href = '/dashboard';
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
    <LoginForm 
      onSubmit={handleLogin} 
      error={error} 
      isLoading={isLoading} 
    />
  );
}