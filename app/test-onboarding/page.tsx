/**
 * Test Onboarding Page - Demo the tutorial system without authentication
 */

"use client";

import React from 'react';
import TutorialManager from '@/components/onboarding/TutorialManager';

export default function TestOnboardingPage() {
  const mockUser = {
    id: 'test-user-123',
    name: 'Demo User',
    role: 'brand_agent',
    organization: 'Demo Organization'
  };

  const handleComplete = () => {
    console.log('Tutorial completed!');
    alert('Tutorial completed! This would normally redirect to dashboard.');
  };

  const handleSkip = () => {
    console.log('Tutorial skipped!');
    alert('Tutorial skipped! This would normally redirect to dashboard.');
  };

  return (
    <div className="min-h-screen">
      <TutorialManager
        user={mockUser}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}