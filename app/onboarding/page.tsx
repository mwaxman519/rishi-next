/**
 * Onboarding Page - Entry point for new user tutorial
 */

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import TutorialManager from '@/components/onboarding/TutorialManager';
import { LoadingSpinner } from '@/components/ui/loading';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();

  const handleTutorialComplete = () => {
    // Mark tutorial as completed in user preferences
    localStorage.setItem('tutorial-completed', 'true');
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleTutorialSkip = () => {
    // Mark tutorial as skipped
    localStorage.setItem('tutorial-skipped', 'true');
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <TutorialManager
      user={{
        id: user.id,
        name: user.fullName || user.username,
        role: user.role,
        organization: user.organizations?.[0]?.name || 'Rishi Platform'
      }}
      onComplete={handleTutorialComplete}
      onSkip={handleTutorialSkip}
    />
  );
}